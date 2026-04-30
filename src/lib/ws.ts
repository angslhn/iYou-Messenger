import type { IncomingEventMap, OutgoingEventMap } from '../@types/ws';

/**
 * Kelas WebSocketClient
 * Menangani koneksi WebSocket secara Singleton, sistem Pub/Sub (Event Emitter),
 * antrean pesan saat offline (Message Queue), dan Auto-Reconnect.
 */
class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;

  // Map untuk menyimpan semua fungsi callback yang didaftarkan oleh komponen/store
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners: Map<keyof IncomingEventMap, Set<(payload: any) => void>> = new Map();

  // Antrean pesan jika user menekan tombol "Kirim" saat koneksi sedang terputus
  private messageQueue: { event: keyof OutgoingEventMap; payload: unknown }[] = [];

  // State untuk manajemen Auto-Reconnect
  private reconnectAttempts: number = 0;
  private readonly maxReconnectDelay: number = 30000; // Maksimal jeda 30 detik
  private isIntentionallyClosed: boolean = false;
  private connectTimeout: ReturnType<typeof setTimeout> | null = null;

  // Timer untuk Ping/Pong agar koneksi tidak diputus oleh Proxy/Load Balancer
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Konstruktor inisialisasi URL WebSocket.
   * @param {string} url - URL WebSocket server (contoh: wss://api.iyou.com)
   */
  constructor(url: string) {
    this.url = url;
  }

  /**
   * Membuka koneksi ke WebSocket server.
   * Cookie autentikasi akan terkirim secara otomatis oleh browser.
   * * @returns {void}
   */
  public connect(): void {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    // Debounce — batalkan kalau dipanggil lagi dalam 300ms
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
    }

    this.connectTimeout = setTimeout(() => {
      this.connectTimeout = null;
      this.isIntentionallyClosed = false;
      this.ws = new WebSocket(this.url);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
    }, 300);
  }

  /**
   * Memutus koneksi secara manual.
   * Digunakan saat user Logout atau Hapus Akun agar tidak Auto-Reconnect.
   * * @returns {void}
   */
  public disconnect(): void {
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
      this.connectTimeout = null;
    }

    this.isIntentionallyClosed = true;
    this.reconnectAttempts = 0;
    this.stopPing();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnected intentionally');
      this.ws = null;
    }
  }

  /**
   * Mengirim event ke server.
   * Jika offline, pesan akan masuk ke antrean (Queue) dan dikirim saat online kembali.
   * * @param {string} event - Nama event (contoh: 'message:send')
   * @param {any} [payload] - Data yang dikirim
   * @returns {void}
   */
  public send<K extends keyof OutgoingEventMap>(
    event: K,
    ...args: OutgoingEventMap[K] extends undefined ? [undefined?] : [OutgoingEventMap[K]]
  ): void {
    const payload = args[0];
    const message = { event, payload };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Masukkan ke antrean jika sedang reconnecting
      this.messageQueue.push(message);
      console.warn(`[WS] Offline. Message queued for event: ${event}`);
    }
  }

  /**
   * Mendaftarkan pendengar (listener) untuk event tertentu.
   * Digunakan oleh Zustand store atau komponen React.
   * * @param {string} event - Nama event dari server (contoh: 'message:receive')
   * @param {EventHandler} callback - Fungsi yang dieksekusi saat event diterima
   * @returns {void}
   */
  public on<K extends keyof IncomingEventMap>(
    event: K,
    callback: (payload: IncomingEventMap[K]) => void,
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);
  }

  /**
   * Menghapus pendengar (listener) dari memori.
   * Wajib dipanggil saat komponen React unmount untuk mencegah Memory Leak.
   * * @param {string} event - Nama event
   * @param {EventHandler} callback - Fungsi callback yang akan dihapus
   * @returns {void}
   */
  public off<K extends keyof IncomingEventMap>(
    event: K,
    callback?: (payload: IncomingEventMap[K]) => void,
  ): void {
    if (!callback) {
      // Hapus semua listener untuk event ini
      this.listeners.delete(event);
      return;
    }

    const callbacks = this.listeners.get(event);

    if (callbacks) {
      callbacks.delete(callback);

      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  private handleOpen(): void {
    console.info('[WS] Connected to server');
    this.reconnectAttempts = 0; // Reset percobaan reconnect
    this.startPing();
    this.flushQueue(); // Kirim semua pesan yang tertunda
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const parsed = JSON.parse(event.data);
      const { event: eventName, payload } = parsed;

      // Pancarkan data ke semua callback yang mendengarkan event ini
      if (eventName && this.listeners.has(eventName)) {
        this.listeners.get(eventName)!.forEach((callback) => callback(payload));
      }
    } catch (err) {
      console.error('[WS] Failed to parse incoming message', err);
    }
  }

  private handleClose(event: CloseEvent): void {
    this.stopPing();

    // KODE 1008: BOM WAKTU SERVER (JWT Expired, Akun Dihapus, dsb)
    if (event.code === 1008) {
      console.error(`[WS] Disconnected by server (1008): ${event.reason}`);
      this.isIntentionallyClosed = true;

      // Pancarkan event khusus agar frontend bisa force logout dan redirect ke /login
      if (this.listeners.has('auth:force_logout')) {
        this.listeners.get('auth:force_logout')!.forEach((callback) => callback(event.reason));
      }
      return; // Berhenti di sini, JANGAN Auto-Reconnect
    }

    if (!this.isIntentionallyClosed) {
      this.attemptReconnect();
    } else {
      console.info('[WS] Connection closed intentionally');
    }
  }

  private handleError(error: Event): void {
    console.error('[WS] Socket encountered error', error);
    // On close akan otomatis terpanggil setelah error dan mengurus reconnect
  }

  /**
   * Logika Exponential Backoff untuk Auto-Reconnect.
   * Jeda akan berlipat ganda: 1s, 2s, 4s, 8s, hingga batas maksimum 30s.
   */
  private attemptReconnect(): void {
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);
    this.reconnectAttempts++;

    console.info(`[WS] Attempting to reconnect in ${delay / 1000}s...`);
    setTimeout(() => this.connect(), delay);
  }

  /**
   * Mengirim semua pesan yang tersangkut di antrean saat offline.
   */
  private flushQueue(): void {
    if (this.messageQueue.length === 0) return;

    const queue = [...this.messageQueue];
    this.messageQueue = [];

    console.info(`[WS] Flushing ${queue.length} queued messages...`);
    queue.forEach((msg) => this.send(msg.event, msg.payload as OutgoingEventMap[typeof msg.event]));
  }

  /**
   * Mengirim heartbeat 'ping' setiap 30 detik ke server.
   */
  private startPing(): void {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      this.send('ping');
    }, 30000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

// Export sebagai Singleton agar seluruh aplikasi menggunakan koneksi yang sama
const ws = new WebSocketClient(import.meta.env.VITE_WS_URL);

export default ws;

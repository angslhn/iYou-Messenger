import { useEffect, useState } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceDetectResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
}

const MOBILE_UA_RE =
  /mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini|windows phone|kindle|palm|fennec|meego|nokia|symbian|redmi|pocket|psp|samsung.*mobile|xiaomi|realme|vivo|oppo|huawei|wiko|infinix|tecno|itel|oneplus|nothing phone/i;

const TABLET_UA_RE =
  /ipad|android(?!.*mobile)|tablet|kindle(?!.*mobile)|silk|playbook|nexus\s?(?:7|9|10)|galaxy\s?tab|surface|kftt|kfjwi|kfjwa|kfsowi|kfthwi|lenovo.*tab|tab.*lenovo/i;

/** Cek apakah pointer device adalah "coarse" (jari, bukan mouse) */
const hasCoarsePointer = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

/** Cek apakah device support hover (desktop biasanya yes, mobile no) */
const hasHover = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

/** Cek orientation API khusus mobile */
const hasOrientationAPI = (): boolean => typeof window !== 'undefined' && 'orientation' in window;

/**
 * Heuristic: layar dengan pixel density tinggi + ukuran kecil = mobile
 * Desktop Retina dikecualikan dengan cek ukuran layar
 */
const isHighDensitySmallScreen = (): boolean => {
  if (typeof window === 'undefined') return false;
  const dpr = window.devicePixelRatio ?? 1;
  const shortSide = Math.min(window.innerWidth, window.innerHeight);
  return dpr >= 2 && shortSide < 500;
};

/** iPad modern menyamar sebagai Macintosh di Safari */
const isModernIPad = (ua: string): boolean => {
  if (typeof navigator === 'undefined') return false;
  return (
    navigator.maxTouchPoints > 1 &&
    ua.includes('Macintosh') &&
    /safari/i.test(ua) &&
    !/chrome|crios|fxios/i.test(ua)
  );
};

/** Samsung DeX dan desktop mode Android — jangan dianggap mobile */
const isDesktopMode = (ua: string): boolean => /samsung.*desktop|dex/i.test(ua);

function detect(): DeviceDetectResult {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { isMobile: false, isTablet: false, isDesktop: true, deviceType: 'desktop' };
  }

  const ua = navigator.userAgent ?? '';
  const platform =
    (navigator as Navigator & { userAgentData?: { platform: string } }).userAgentData?.platform ??
    '';

  const brands =
    (
      navigator as Navigator & {
        userAgentData?: { brands: { brand: string }[] };
      }
    ).userAgentData?.brands
      ?.map((b) => b.brand.toLowerCase())
      .join(' ') ?? '';

  const touchPoints = navigator.maxTouchPoints ?? 0;
  const isTouch = touchPoints > 1;
  const shortSide = Math.min(window.innerWidth, window.innerHeight);
  const longSide = Math.max(window.innerWidth, window.innerHeight);

  // Guard: Desktop mode (Samsung DeX dll)
  if (isDesktopMode(ua)) {
    return { isMobile: false, isTablet: false, isDesktop: true, deviceType: 'desktop' };
  }

  // ── Tablet detection ──
  const isTabletUA = TABLET_UA_RE.test(ua) || isModernIPad(ua);
  const isTabletSize = isTouch && shortSide >= 600 && longSide >= 960;
  const isTabletPlatform = /ipad/i.test(platform);
  const isTablet = isTabletUA || isTabletPlatform || (isTabletSize && !MOBILE_UA_RE.test(ua));

  // ── Mobile detection ──
  const isMobileUA = MOBILE_UA_RE.test(ua);
  const isMobilePlatform =
    /android|iphone|ipod/i.test(platform) || /android|harmonyos/i.test(brands);

  // Media query signals
  const coarse = hasCoarsePointer();
  const noHover = !hasHover();
  const hasOrientation = hasOrientationAPI();

  // Ukuran layar kecil (< 768px short side = handphone range)
  const isSmallScreen = shortSide < 768;

  // Skor-based: butuh ≥2 signal non-UA agar tidak false positive di desktop touch
  let signals = 0;

  if (coarse) signals++;
  if (noHover) signals++;
  if (hasOrientation) signals++;
  if (isHighDensitySmallScreen()) signals++;
  if (isSmallScreen && isTouch) signals++;

  const isMobileBySignals = signals >= 2;
  const isMobile = !isTablet && (isMobileUA || isMobilePlatform || isMobileBySignals);

  const deviceType: DeviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

  const isDesktop = deviceType === 'desktop';

  return { isMobile, isTablet, isDesktop, deviceType };
}

export function useDevice(): DeviceDetectResult {
  const [result, setResult] = useState<DeviceDetectResult>(() => detect());

  useEffect(() => {
    const handleResize = () => setResult(detect());

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return result;
}

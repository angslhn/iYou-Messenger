export default function formatLastSeen(dateString?: string | null) {
  if (!dateString) return null;

  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return `Last seen today at ${time}`;
  }

  const dateFormatted = date.toLocaleDateString([], { day: '2-digit', month: 'short' });
  return `Last seen ${dateFormatted} at ${time}`;
}

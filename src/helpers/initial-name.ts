export default function initialName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
}

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;

/** Format a byte count using binary units (1 KB = 1024 B). */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const unitIndex = Math.min(
    Math.max(0, Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024))),
    BYTE_UNITS.length - 1,
  );
  const value = bytes / 1024 ** unitIndex;
  return `${Number(value.toFixed(2))} ${BYTE_UNITS[unitIndex]}`;
}

/** Format a millisecond Unix timestamp as a readable local date and time. */
export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp);
}

/** Return a lowercase extension, or a label for names without one. */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot <= 0 || lastDot === filename.length - 1) return 'No extension';
  return filename.slice(lastDot).toLowerCase();
}

const TEXT_EXTENSIONS = new Set([
  '.txt', '.md', '.json', '.ts', '.tsx', '.js', '.css', '.html', '.yml',
]);
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif']);

/** Match supported text previews, including the compound `.env.example` name. */
export function isTextPreviewable(filename: string): boolean {
  return filename.toLowerCase().endsWith('.env.example') ||
    TEXT_EXTENSIONS.has(getFileExtension(filename));
}

/** Match image types that can be previewed with an object URL. */
export function isImagePreviewable(filename: string): boolean {
  return IMAGE_EXTENSIONS.has(getFileExtension(filename));
}

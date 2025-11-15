import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats duration in seconds to human-readable string.
 * Examples: 45 → "45s", 90 → "1m 30s", 125 → "2m 5s"
 */
export function formatDuration(seconds: number): string {
  const roundedSeconds = Math.floor(seconds);
  if (roundedSeconds < 60) return `${roundedSeconds}s`;
  const mins = Math.floor(roundedSeconds / 60);
  const secs = roundedSeconds % 60;
  return `${mins}m ${secs}s`;
}

import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class lists intelligently — later classes override earlier ones
 * when they target the same CSS property.
 */
export function cn(...classes: Array<string | undefined | null | false>): string {
  return twMerge(classes.filter(Boolean).join(' '));
}

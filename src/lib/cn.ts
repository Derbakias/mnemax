import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// The app's own text sizes (set in src/styles/index.css). Told here, so text-small is known as a size and not
// mistaken for a colour: text-small with text-text-secondary keeps both.
const twMerge = extendTailwindMerge({
  extend: { theme: { text: ['default', 'small', 'subtitle', 'heading', 'title', 'code'] } },
});

// Joins class names into one string. Falsy values are dropped, so `active && 'x'` works. When two classes
// set the same thing (say `p-2` and `p-4`), the later one wins and the earlier one is removed.
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

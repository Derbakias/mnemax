import { resolveDateStyle, type DateStyle } from '@/lib/prefs';
import { useSettingsStore } from '@/stores/settings';

/** The order dates are written in now, for code outside React. */
export function currentDateStyle(): DateStyle {
  return resolveDateStyle(useSettingsStore.getState().prefs.dateFormat);
}

/** The same, for components: they draw again when the user changes it. */
export function useDateStyle(): DateStyle {
  return useSettingsStore((s) => resolveDateStyle(s.prefs.dateFormat));
}

// Made once: the weekday is always English, and a new Intl formatter per call is slow.
const WEEKDAY = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });

function two(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** The time of day, 24 h: 15:00. */
export function formatTime(ms: number): string {
  const d = new Date(ms);
  return `${two(d.getHours())}:${two(d.getMinutes())}`;
}

/**
 * A date as numbers only: 19/09/2026, 09/19/2026 or 2026-09-19. Optionally with the year, the weekday in front
 * ("Tue, ") and the 24 h time after (", 15:00"). Without the year it is 19/09, 09/19 or 09-19.
 */
export function formatDate(
  ms: number,
  style: DateStyle,
  shape: { year?: boolean; weekday?: boolean; time?: boolean } = {},
): string {
  const d = new Date(ms);
  const day = two(d.getDate());
  const month = two(d.getMonth() + 1);
  const year = String(d.getFullYear());
  let text: string;
  if (style === 'ymd') {
    text = shape.year ? `${year}-${month}-${day}` : `${month}-${day}`;
  } else {
    const [a, b] = style === 'dmy' ? [day, month] : [month, day];
    text = shape.year ? `${a}/${b}/${year}` : `${a}/${b}`;
  }
  if (shape.weekday) {
    text = `${WEEKDAY.format(d)}, ${text}`;
  }
  return shape.time ? `${text}, ${formatTime(ms)}` : text;
}

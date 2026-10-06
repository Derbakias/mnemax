import { currentDateStyle, formatDate, formatTime } from '@/lib/date-format';
import { shortDate } from '@/lib/format';
import { defaultPrefs } from '@/lib/prefs';
import { useSettingsStore } from '@/stores/settings';

vi.mock('@/lib/kv', () => ({
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
}));

// Local time, like the code under test. A Saturday, with two-digit parts.
const BIG = new Date(2026, 8, 19, 15, 0).getTime();
// A Tuesday, with one-digit day, month, hour and minute.
const SMALL = new Date(2026, 0, 6, 7, 5).getTime();

describe('formatDate', () => {
  it('writes each order with slashes, and dashes for year first', () => {
    expect(formatDate(BIG, 'dmy', { year: true })).toBe('19/09/2026');
    expect(formatDate(BIG, 'mdy', { year: true })).toBe('09/19/2026');
    expect(formatDate(BIG, 'ymd', { year: true })).toBe('2026-09-19');
  });

  it('leaves out the year', () => {
    expect(formatDate(BIG, 'dmy')).toBe('19/09');
    expect(formatDate(BIG, 'mdy')).toBe('09/19');
    expect(formatDate(BIG, 'ymd')).toBe('09-19');
  });

  it('pads the day and month to two digits', () => {
    expect(formatDate(SMALL, 'dmy', { year: true })).toBe('06/01/2026');
    expect(formatDate(SMALL, 'mdy', { year: true })).toBe('01/06/2026');
    expect(formatDate(SMALL, 'ymd', { year: true })).toBe('2026-01-06');
  });

  it('puts an English weekday in front', () => {
    expect(formatDate(BIG, 'dmy', { year: true, weekday: true })).toBe('Sat, 19/09/2026');
    expect(formatDate(SMALL, 'ymd', { weekday: true })).toBe('Tue, 01-06');
  });

  it('puts a 24 h time after', () => {
    expect(formatDate(BIG, 'dmy', { year: true, time: true })).toBe('19/09/2026, 15:00');
    expect(formatDate(SMALL, 'mdy', { time: true })).toBe('01/06, 07:05');
  });

  it('can have all three', () => {
    expect(formatDate(BIG, 'ymd', { year: true, weekday: true, time: true })).toBe('Sat, 2026-09-19, 15:00');
  });
});

describe('formatTime', () => {
  it('is 24 h with two digits', () => {
    expect(formatTime(BIG)).toBe('15:00');
    expect(formatTime(SMALL)).toBe('07:05');
  });
});

describe('currentDateStyle', () => {
  it('follows the store', () => {
    useSettingsStore.setState({ prefs: { ...defaultPrefs(), dateFormat: 'mdy' } });
    expect(currentDateStyle()).toBe('mdy');
    useSettingsStore.setState({ prefs: { ...defaultPrefs(), dateFormat: 'ymd' } });
    expect(currentDateStyle()).toBe('ymd');
  });

  it('makes shortDate follow it unless a style is given', () => {
    useSettingsStore.setState({ prefs: { ...defaultPrefs(), dateFormat: 'dmy' } });
    expect(shortDate(BIG)).toBe('19/09');
    useSettingsStore.setState({ prefs: { ...defaultPrefs(), dateFormat: 'mdy' } });
    expect(shortDate(BIG)).toBe('09/19');
    expect(shortDate(BIG, 'ymd')).toBe('09-19');
  });
});

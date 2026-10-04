// The game's fixed values: round length, levels, grid, colours, speeds. Change them here.
import type { SpeedId, SpeedPreset, StreamOutcome } from '@/game/types';

export const NEUTRAL_COLOR = '#64B5F6';

export const TRIALS_PER_ROUND = 20;
export const MIN_N = 1;
export const MAX_N = 10;
export const GRID_CELLS = 9;
export const GRID_CENTER_INDEX = 4;
// All nine boxes, the centre one too.
export const POSITION_CELLS = [0, 1, 2, 3, 4, 5, 6, 7, 8];
export const POSITION_ARROWS: Record<number, string> = {
  0: '↖',
  1: '↑',
  2: '↗',
  3: '←',
  4: '•',
  5: '→',
  6: '↙',
  7: '↓',
  8: '↘',
};
// The box shows for most of each trial; the short blank that follows marks the next trial, so a repeat
// in the same cell still reads as a new trial. Difficulty comes from the trial speed.
export const BLANK_MS = 400;

// The six game colours, picked so each pair stays easy to tell apart for colour-blind vision too
// (red-weak, green-weak, blue-weak). Based on the Okabe-Ito set.
export const COLOR_PALETTE = ['#FE4614', '#33DCFF', '#00A96F', '#F0E442', '#1B6BAA', '#D085AA'];
/** Each palette colour's name, for screen readers where a swatch shows it. */
export const COLOR_NAMES = ['vermilion', 'sky blue', 'green', 'yellow', 'blue', 'pink'];
/**
 * A deeper shade of each palette colour (and of the neutral one), for the lit box's 3D edge and the digit's
 * shadow. Hand-picked rather than the colour darkened with black, which turns yellow a muddy olive: yellow
 * gets amber instead. Sky blue and yellow get deeper shades than the rest: the lit box's coloured shadow is
 * drawn in the shade, and a bright one glared under the box.
 */
export const COLOR_SHADES = ['#C93103', '#128CAD', '#098356', '#D08C00', '#034B7E', '#AC6488'];
export const NEUTRAL_SHADE = '#1976D2';

export const LETTERS = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'];
export const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function preset(id: SpeedId, label: string, answerMs: number): SpeedPreset {
  return { id, label, answerMs, ms: answerMs + BLANK_MS };
}

// The speed levels, fastest first. Their timings can change: settings and rounds save the level, not the
// time, so a round stays at its level.
export const SPEED_PRESETS: SpeedPreset[] = [
  preset('veryFast', 'Very fast', 1000),
  preset('fast', 'Fast', 1500),
  preset('normal', 'Normal', 2500),
  preset('slow', 'Slow', 3200),
  preset('verySlow', 'Very slow', 4000),
];
export const DEFAULT_SPEED: SpeedId = 'normal';

export const DEFAULT_MATCH_COUNT = 6;

export const OUTCOME_GLYPHS: Record<StreamOutcome, string> = {
  hit: '✓',
  falseAlarm: '■',
  miss: '✕',
  correctRejection: '〇',
};

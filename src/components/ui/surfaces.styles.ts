/** The boxes that hold a screen's content: the grey cards and the Stats screen's raised panels. */

/** A grey box with round corners: the last round's card and the Sync pairing cards. */
export const card = 'rounded-[14px] bg-background-element';

/**
 * A raised panel: a white surface with a hairline edge and a soft shadow under it, for the Stats screen's tiles,
 * tables and charts, and the Sync section. `pad` gives it room inside.
 */
export const panel = {
  base: 'rounded-2xl border border-surface-border bg-surface shadow-(--shadow-surface)',
  // 14px all round; small phones 12px at the top and bottom, 10px at the sides.
  pad: 'p-3.5 max-[400px]:px-2.5 max-[400px]:py-3',
};

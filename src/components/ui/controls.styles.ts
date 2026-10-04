/** Controls that both Settings and Sync use: the on/off switch, the outlined buttons and the text box. */

/**
 * An on/off switch: a checkbox drawn as a grey track with a round knob, which turns blue with the knob moved
 * right when on.
 */
export const switchStyles = [
  'relative m-0 h-6.5 w-11 shrink-0 cursor-pointer appearance-none rounded-[13px]',
  'bg-background-selected [transition:background_0.15s] checked:bg-accent',
  // The knob: white in light and dark mode, with a small shadow under it.
  'after:absolute after:top-0.75 after:left-0.75 after:size-5 after:rounded-full',
  'after:bg-[#ffffff] after:shadow-[0_1px_2px_rgba(0,0,0,0.3)]',
  'after:[transition:transform_0.15s] checked:after:transform-[translateX(18px)]',
];

/**
 * A button with a coloured outline and text, sharing a row's width with the others in it. `base` goes with one
 * colour: `accent`, `danger`, `secondary` (with the `secondary` class for its grey text) or `primary`.
 */
export const outlineButton = {
  base: ['flex-1 rounded-[14px] border-[1.5px] py-3 text-center', 'text-[16px]/6 font-medium disabled:opacity-50'],
  accent: 'border-accent text-accent',
  danger: 'border-danger text-danger',
  secondary: 'border-background-selected',
  // The one main action in a pairing card (Pair, New code): filled blue, so it stands apart from Cancel.
  primary: 'border-accent-fill bg-accent-fill text-on-accent',
  // A small one, only as wide as its word (Sync, Save).
  small: 'flex-none px-4 py-1.5 text-[14px]/5',
};

/** A box to type in, taking the room left in its row. Its text can be selected, unlike the rest of the app. */
export const textField = [
  'min-w-0 flex-1 rounded-xl border-[1.5px] border-background-selected bg-background-element',
  'px-3 py-2.5 text-[16px]/6 select-text',
];

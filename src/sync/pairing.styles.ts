/** What the two pairing cards (ShowCode and EnterCode) share. */
export const pairingStyles = {
  // The card itself; its grey and corners come from `card` (src/components/ui/surfaces.styles.ts).
  card: 'flex flex-col gap-2 p-3.5',
  // The steps at the top of a card, numbered.
  steps: 'm-0 flex flex-col gap-0.5 pl-5',
  // The address and the code side by side: shown on one device, typed on the other. Wraps on very narrow
  // screens.
  pairRow: 'flex flex-wrap justify-center gap-x-3 gap-y-2 text-center',
};

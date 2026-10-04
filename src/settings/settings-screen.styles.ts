/** The Settings screen's own look (SettingsScreen); the shared controls are in components/ui/controls.styles.ts. */
export const styles = {
  // A choice chip (the speeds, the button layouts): grey, or blue with white text when picked (data-on).
  chip: [
    'flex flex-col items-center rounded-xl px-3 py-1.5',
    'bg-background-element text-text data-[on=true]:bg-accent data-[on=true]:text-on-accent',
  ],
  // The two button layouts side by side. Their chips are a little taller, around the picture.
  layoutOptions: 'grid grid-cols-[1fr_1fr] gap-2',
  layoutChip: 'py-2',
  // A single switch sits right after its label (lists of switches keep theirs lined up on the right).
  switchInline: 'flex cursor-pointer items-center gap-3 self-start',
  // The tick on the reset button: at its right edge, so the label stays centred. It grows in as it fades in,
  // or only fades for people who turned animations down.
  resetTick: [
    'absolute top-1/2 right-4 flex text-success',
    'opacity-0 transform-[translateY(-50%)_scale(0.6)]',
    '[transition:opacity_0.2s_ease-out,transform_0.2s_ease-out] motion-reduce:[transition:opacity_0.2s_ease-out]',
    'data-[on=true]:opacity-100 data-[on=true]:transform-[translateY(-50%)_scale(1)]',
  ],
};

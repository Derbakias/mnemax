/** The Stats screen's own look (StatsScreen); its pieces (tiles, tables, calendar) keep theirs beside them. */
export const styles = {
  // The four headline tiles: two to a row, four from 700px.
  summary: 'grid grid-cols-[repeat(2,1fr)] gap-3 min-[700px]:grid-cols-[repeat(4,1fr)]',
  // The picker's panel opens under the chip, aligned left (the HUD's is centred under the row).
  picker: [
    'relative',
    '[&_.hud-popover]:left-0 [&_.hud-popover]:transform-none [&_.hud-popover]:items-stretch',
    '[&_.hud-popover]:p-1.5',
  ],
  // As wide as the widest row, even when the panel is narrower and scrolls sideways, so every row's
  // highlight spans it.
  options: 'flex w-max min-w-full flex-col gap-0.5',
  option: [
    'flex items-center justify-between gap-4 rounded-[10px] p-2.5 whitespace-nowrap',
    // The mode shown: tinted blue. It keeps its tint under the mouse.
    'data-[on=true]:bg-accent-soft hover:not-data-[on=true]:bg-background-element',
  ],
};

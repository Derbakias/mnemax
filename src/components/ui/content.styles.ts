/** The column each screen's page sits in (Play, Stats, Settings), and each screen's own spacing in it. */
export const contentStyles = {
  // Centred and at most 640px wide, with 16px around it and 48px at the bottom. The tab bar keeps its tabs in
  // the same column (src/app/App.tsx).
  base: 'mx-auto flex w-full max-w-[640px] flex-col p-4 pb-12',
  // Play (the start screen and a round): everything centred, a little less room at the bottom.
  play: 'items-center gap-4 pb-10',
  // A round fills the screen exactly, with nothing to scroll: the HUD and round progress at the top, the grid,
  // then the answer buttons sharing whatever height is left.
  inRound: 'h-[100cqh] pb-4',
  settings: 'gap-6',
  // Stats: its sections a little tighter inside (8px between heading and content, rather than 10px).
  stats: 'gap-7 [&>section]:gap-2',
};

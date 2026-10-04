import type { ReactNode } from 'react';

import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/cn';

// A headline number: its icon in a blue bubble, the label under it, then the value. The label gets the tile's
// whole width, so "Rounds played" fits even four tiles to a row or on a small phone. All four tiles are blue:
// the icons and labels tell them apart, since four colours in bubbles this small were hard to tell apart,
// especially with colour blindness.
const styles = {
  tile: 'flex min-w-0 flex-col gap-2.5 p-3.5 max-[400px]:p-3',
  icon: 'inline-flex size-7.5 flex-none items-center justify-center rounded-[10px] bg-accent-soft text-accent',
  value: [
    'text-[28px] leading-none font-bold tracking-[-0.01em] tabular-nums whitespace-nowrap',
    // Four to a row the tiles are narrow: a size down, so a long time played ("123h 45m") still fits. Small
    // phones too.
    'min-[700px]:text-[24px] max-[400px]:text-[24px]',
  ],
  // Every tile keeps a line for the note under the value, so the four stay the same height. A size down from the
  // label, so "▲ +0.06 in 7 days" stays on one line four tiles to a row, with text-small's weight written
  // out.
  sub: 'text-text-secondary -mt-1 min-h-[18px] text-[13px]/[18px] font-medium whitespace-nowrap',
};

/** A headline number, with an icon beside its label. */
export function StatTile({
  icon,
  label,
  value,
  sub,
}: {
  icon: IconName;
  label: string;
  value: string;
  sub?: ReactNode;
}) {
  return (
    <div className={cn('panel', styles.tile)}>
      <div className="flex min-w-0 flex-col items-start gap-2">
        <span className={cn(styles.icon)}>
          <Icon name={icon} size={18} />
        </span>
        <span className="text-small text-text-secondary truncate">{label}</span>
      </div>
      <span className={cn(styles.value)}>{value}</span>
      <span className={cn(styles.sub)}>{sub}</span>
    </div>
  );
}

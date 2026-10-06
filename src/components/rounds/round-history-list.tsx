import { memo, useCallback, useState } from 'react';

import { Icon } from '../ui/icon';
import { OutcomeLegend, RoundDetailTable } from './round-detail-table';
import { RoundSummaryCard } from './round-summary-card';
import { roundsCopy } from '@/copy/rounds';
import type { RoundResult } from '@/game/types';
import { formatDate, useDateStyle } from '@/lib/date-format';
import { cn } from '@/lib/cn';
import type { DateStyle } from '@/lib/prefs';

const styles = {
  list: [
    'self-stretch overflow-y-auto',
    // A classic scrollbar with its own lane beside the rows (styling it turns off the overlay kind, which would
    // be drawn over the results), and a little room between the two.
    '[scrollbar-gutter:stable] pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent',
    '[&::-webkit-scrollbar-thumb]:rounded-[4px] [&::-webkit-scrollbar-thumb]:bg-background-selected',
    '[&::-webkit-scrollbar-thumb:hover]:bg-text-secondary',
  ],
  row: [
    'group flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-1 py-3 text-left',
    '[transition:background-color_0.15s] hover:bg-background-element',
  ],
  // Points down when closed and up when open.
  chevron: [
    'inline-flex text-text-secondary group-aria-expanded:transform-[rotate(180deg)]',
    '[transition:transform_0.2s] motion-reduce:transition-none',
  ],
};

interface RoundHistoryListProps {
  rounds: RoundResult[];
  scrollHeight?: number | null;
  emptyLabel?: string;
  /** Show the key to the outcome symbols above the list (once, not in every opened round). */
  legend?: boolean;
}

// Built from numbers, not Intl: toLocaleDateString and friends set up a new formatter on every call, which
// added up to most of the time a long history took to draw.
function formatTimestamp(finishedAt: number, style: DateStyle): string {
  return formatDate(finishedAt, style, { year: true, time: true });
}

function RoundEntry({
  round,
  style,
  expanded,
  onToggle,
}: {
  round: RoundResult;
  style: DateStyle;
  expanded: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="border-surface-border not-first:border-t">
      <button type="button" className={cn(styles.row)} aria-expanded={expanded} onClick={() => onToggle(round.id)}>
        <span className="text-small min-w-0">
          {formatTimestamp(round.finishedAt, style)} · N={round.settings.nLevel}
          {round.stopped && (
            <span className="text-text-secondary"> {roundsCopy.history.stoppedAt(round.trials.length)}</span>
          )}
        </span>
        <span className="inline-flex flex-none items-center gap-2">
          <RoundSummaryCard result={round} compact />
          <span className={cn(styles.chevron)}>
            <Icon name="chevron-down" size={16} />
          </span>
        </span>
      </button>
      {expanded && (
        <div className="pb-3">
          <RoundDetailTable result={round} legend={false} />
        </div>
      )}
    </div>
  );
}

// Memoized: the Stats screen stays mounted and re-renders on every settings change, while its rounds don't.
export const RoundHistoryList = memo(function RoundHistoryList({
  rounds,
  scrollHeight = 520,
  emptyLabel,
  legend = true,
}: RoundHistoryListProps) {
  // One round open at a time: opening another closes the last, so a long history never has many trial
  // tables drawn at once.
  const style = useDateStyle();
  const [openId, setOpenId] = useState<string | null>(null);
  const toggle = useCallback((id: string) => setOpenId((open) => (open === id ? null : id)), []);
  if (rounds.length === 0) {
    return <p className="text-small text-text-secondary">{emptyLabel ?? roundsCopy.history.empty}</p>;
  }
  return (
    <>
      {legend && <OutcomeLegend inline />}
      <div className={cn(styles.list)} style={scrollHeight ? { maxHeight: scrollHeight } : undefined}>
        {rounds.map((round) => (
          <RoundEntry key={round.id} round={round} style={style} expanded={round.id === openId} onToggle={toggle} />
        ))}
      </div>
    </>
  );
});

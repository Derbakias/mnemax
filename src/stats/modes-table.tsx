import { Count } from '@/stats/count';
import { Icon } from '@/components/ui/icon';
import { panel } from '@/components/ui/surfaces.styles';
import { ModeBadge } from '@/stats/mode-badge';
import type { ModeSummary } from '@/stats/levels';
import { accuracyColor, type Theme } from '@/lib/theme';
import { cn } from '@/lib/cn';

const styles = {
  table: [
    'flex flex-col gap-0.5 p-1.5',
    // Every number column in the modes table is this wide, as in the stream table under By mode
    // (src/components/rounds/stream-table.tsx), so the two tables line up alike. Small phones: narrower
    // columns, as the stream table's, whose headings shrink to their symbols there.
    '[--stat-col:64px] max-[480px]:[--stat-col:56px] max-[400px]:[--stat-col:42px]',
  ],
  row: [
    // N | Streams | Speed | Rounds | Recent | ★ | Best. Each row is its own grid, so the mode's columns have
    // fixed widths (↺10; four 62px stream slots plus 8px, so the gap before the bolts matches the one after
    // ↺N) to line up from row to row; Speed takes the spare room.
    'grid grid-cols-[38px_70px_minmax(55px,1fr)_var(--stat-col)_var(--stat-col)_14px_var(--stat-col)]',
    'items-center gap-1.5 rounded-[10px] p-2 text-center',
    // Phones: drop the Best column so a four-stream mode still fits.
    'max-[480px]:grid-cols-[38px_70px_minmax(55px,1fr)_var(--stat-col)_var(--stat-col)_14px] max-[480px]:gap-1',
    // Small phones: 4px from N to Streams keeps both gaps equal and the bolts on screen.
    'max-[400px]:grid-cols-[34px_66px_minmax(55px,1fr)_var(--stat-col)_var(--stat-col)_14px]',
  ],
  header: [
    // Column headings a size down, so "Accuracy" fits a narrow column: the code font, as font-mono text-code
    // give it, at 11px.
    'py-1.5 font-mono text-[11px] font-medium text-text-secondary',
    // Their headings are as wide as what's under them (↺1, four stream slots, five bolts) and centred, so each
    // sits over the middle of its symbols rather than of the wider column.
    '[&>:nth-child(-n+3)]:justify-self-start',
    '[&>:nth-child(1)]:w-[30px] [&>:nth-child(2)]:w-[62px] [&>:nth-child(3)]:w-[55px]',
  ],
  mode: [
    'cursor-pointer [transition:background-color_0.15s]',
    // The mode shown in By mode: tinted blue. It keeps its tint under the mouse.
    'data-[on=true]:bg-accent-soft hover:not-data-[on=true]:bg-background-element',
  ],
  // The star is set in the same font as the percentages, sized from the capital height and placed on the
  // text baseline, so it centres on the digits whatever font the engine picks.
  mastered: [
    'text-center text-warning',
    '[&_.icon]:inline-block [&_.icon]:h-[calc(1cap+2px)] [&_.icon]:w-[calc((1cap+2px)*480/448)]',
    '[&_.icon]:align-[-0.5px]',
    'not-supports-[height:1cap]:[&_.icon]:h-[calc(0.7em+2px)]',
    'not-supports-[height:1cap]:[&_.icon]:w-[calc((0.7em+2px)*480/448)]',
  ],
  // Phones: no Best column (see row).
  best: 'max-[480px]:hidden',
};

export function ModesTable({
  modes,
  selectedKey,
  onSelect,
  theme,
}: {
  modes: ModeSummary[];
  selectedKey: string;
  onSelect: (key: string) => void;
  theme: Theme;
}) {
  return (
    <div className={cn(panel.base, styles.table)}>
      <div className={cn(styles.row, styles.header)}>
        <span>N</span>
        <span>Streams</span>
        <span>Speed</span>
        <span>Rounds</span>
        <span>Recent</span>
        <span />
        <span className={cn(styles.best)}>Best</span>
      </div>
      {modes.map((m) => (
        <button
          key={m.mode.key}
          type="button"
          className={cn(styles.row, styles.mode)}
          data-on={m.mode.key === selectedKey}
          onClick={() => onSelect(m.mode.key)}
        >
          {/* The mode's parts (↺N, streams, bolts) become the row's first three cells, at the start of each. */}
          <ModeBadge mode={m.mode} aligned className="contents *:justify-self-start" />
          <Count className="font-mono text-code" value={m.rounds.length} label="rounds" />
          <span className="font-mono text-code" style={{ color: accuracyColor(m.recentAccuracy, theme) }}>
            {Math.round(m.recentAccuracy)}%
          </span>
          <span className={cn('font-mono text-code', styles.mastered)} title={m.mastered ? 'Mastered' : undefined}>
            {m.mastered && <Icon name="star-tight" />}
          </span>
          <span className={cn('font-mono text-code', styles.best)}>{Math.round(m.bestAccuracy)}%</span>
        </button>
      ))}
    </div>
  );
}

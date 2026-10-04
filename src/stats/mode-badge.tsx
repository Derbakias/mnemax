import { Icon } from '../components/ui/icon';
import { STREAM_ICONS } from '@/config/ui';
import { SPEED_PRESETS } from '@/config/game';
import { speedPreset } from '@/game/rules';
import { STREAM_IDS, STREAM_LABELS } from '@/game/types';
import type { Mode } from '@/stats/levels';
import { cn } from '@/lib/cn';

const styles = {
  badge: 'group inline-flex items-center gap-2 whitespace-nowrap',
  part: 'inline-flex items-center gap-0.5',
  // Lists: N always takes two digits' room, so single- and double-digit levels line up.
  n: 'group-data-[aligned=true]:min-w-[calc(14px+2ch+2px)]',
  slot: 'inline-flex',
  // A stream the mode doesn't use: a grey dash, as wide as a stream icon.
  slotOff: 'w-3.5 justify-center text-text-secondary opacity-60',
  // The speed bolts: the ones up to the mode's speed lit in blue, the rest faint.
  bolt: 'inline-flex opacity-25 data-[on=true]:text-accent data-[on=true]:opacity-100',
};

/**
 * A mode in the same symbols as the Play screen chips: ↺N, the active stream icons, the speed bolts.
 * `aligned` (for lists) gives every stream a fixed slot, left empty when it's off, so rows line up.
 * `className` goes on the badge, after its own classes.
 */
export function ModeBadge({ mode, aligned = false, className }: { mode: Mode; aligned?: boolean; className?: string }) {
  const level = SPEED_PRESETS.length - SPEED_PRESETS.findIndex((p) => p.id === mode.speed);
  return (
    <span className={cn('t-code', styles.badge, className)} data-aligned={aligned} title={modeLabel(mode)}>
      <span className={cn(styles.part, styles.n)}>
        <Icon name="counter-clockwise" size={14} />
        {mode.nLevel}
      </span>
      <span className={cn(styles.part)}>
        {/* Aligned: a slot per stream, with a dash for the ones this mode doesn't use. */}
        {(aligned ? STREAM_IDS : mode.streams).map((s) =>
          mode.streams.includes(s) ? (
            <span key={s} className={cn(styles.slot)}>
              <Icon name={STREAM_ICONS[s]} size={14} />
            </span>
          ) : (
            <span key={s} className={cn(styles.slot, styles.slotOff)} aria-hidden>
              –
            </span>
          ),
        )}
      </span>
      <span className={cn(styles.part, 'gap-0')}>
        {SPEED_PRESETS.map((p, i) => (
          <span key={p.ms} className={cn(styles.bolt)} data-on={i < level}>
            <Icon name="flash" size={11} />
          </span>
        ))}
      </span>
    </span>
  );
}

/** The same mode in words, for tooltips and chart legends. */
export function modeLabel(mode: Mode): string {
  const streams = mode.streams.map((s) => STREAM_LABELS[s]).join(' + ');
  return `N=${mode.nLevel} · ${streams} · ${speedPreset(mode.speed).label}`;
}

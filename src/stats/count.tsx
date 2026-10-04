import { useHoverOrTap } from '../components/ui/info-tip';
import { formatCount } from '@/lib/format';
import { cn } from '@/lib/cn';

const styles = {
  // The exact number, under the count and growing to the left (these counts sit in the right-hand columns).
  panel: [
    'absolute top-[calc(100%+6px)] -right-2 z-20 px-2.5 py-1.5 whitespace-nowrap',
    'rounded-[10px] border border-background-selected bg-background text-text shadow-(--shadow-popover)',
  ],
};

/**
 * A count kept short for a narrow column (1.2K, 12K…). When shortened, hovering or tapping it shows the
 * exact number, e.g. "1,202 matched".
 */
export function Count({ value, label, className }: { value: number; label: string; className?: string }) {
  const short = formatCount(value);
  const { rootRef, open, toggle, hoverHandlers } = useHoverOrTap<HTMLSpanElement>();
  if (short === String(value)) {
    return <span className={className}>{short}</span>;
  }

  const exact = `${value.toLocaleString()} ${label}`;
  // Not a <button>: in the modes table it sits inside a row that is one. A tap here shouldn't pick the row.
  return (
    <span className="relative inline-flex justify-center" ref={rootRef} {...hoverHandlers}>
      <span
        role="button"
        tabIndex={0}
        className={cn('cursor-pointer', className)}
        aria-label={exact}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' && e.key !== ' ') {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          toggle();
        }}
      >
        {short}
      </span>
      {open && (
        <span className={cn('text-small', styles.panel)} role="tooltip">
          {exact}
        </span>
      )}
    </span>
  );
}

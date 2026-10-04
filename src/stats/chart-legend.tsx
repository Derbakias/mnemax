import { cn } from '@/lib/cn';

const styles = {
  legend: 't-small secondary flex flex-wrap items-center justify-center gap-x-4 gap-y-1',
  item: 'inline-flex items-center gap-1.5',
  toggle: [
    '-mx-1.5 -my-0.5 rounded-md px-1.5 py-0.5 hover:bg-background-element',
    'data-[off=true]:line-through data-[off=true]:opacity-40',
  ],
  // The series' mark, in its colour: a square for a bar, a dot, a short line, or a dotted or dashed one.
  swatch: [
    'inline-block size-2.5 rounded-[2px]',
    'data-[mark=dot]:size-2 data-[mark=dot]:rounded-full',
    'data-[mark=line]:h-[3px] data-[mark=line]:w-3.5',
    'data-[mark=dotted]:h-0 data-[mark=dotted]:w-3.5 data-[mark=dotted]:rounded-none',
    'data-[mark=dotted]:[border-top:2px_dotted]',
    'data-[mark=dashed]:h-0 data-[mark=dashed]:w-3.5 data-[mark=dashed]:rounded-none',
    'data-[mark=dashed]:[border-top:2px_dashed]',
  ],
};

export interface LegendItem {
  label: string;
  color: string;
  mark: 'dot' | 'bar' | 'line' | 'dashed' | 'dotted';
  /** Toggleable items show or hide their series. */
  shown?: boolean;
  onToggle?: () => void;
}

/** A compact, centred key under a chart; toggleable items are buttons. */
export function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <div className={cn(styles.legend)}>
      {items.map((item) => {
        const swatch = <i className={cn(styles.swatch)} data-mark={item.mark} style={swatchStyle(item)} />;
        if (!item.onToggle) {
          return (
            <span key={item.label} className={cn(styles.item)}>
              {swatch}
              {item.label}
            </span>
          );
        }
        return (
          <button
            key={item.label}
            type="button"
            className={cn(styles.item, styles.toggle)}
            data-off={item.shown === false}
            aria-pressed={item.shown !== false}
            title={item.shown === false ? `Show ${item.label}` : `Hide ${item.label}`}
            onClick={item.onToggle}
          >
            {swatch}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function swatchStyle(item: LegendItem) {
  return item.mark === 'dashed' || item.mark === 'dotted' ? { borderColor: item.color } : { background: item.color };
}

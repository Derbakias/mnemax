import { useEffect, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';

import { Icon } from '../ui/icon';
import { CHART_RANGES } from '@/config/charts';
import { useElementWidth } from '@/hooks/use-element-width';
import { cn } from '@/lib/cn';
import type { ChartZoom } from './zoom';

/**
 * The chips over every chart (time ranges, the By mode metric) and Reset zoom: put `row` on the row and `chip`
 * on each chip, with data-on on the picked one.
 */
export const chipStyles = {
  row: 'flex flex-wrap items-center gap-1.5',
  chip: [
    // The code font, as t-code gives it, a size down.
    'font-mono text-[11px] font-medium',
    'rounded-lg border border-transparent px-2.5 py-[5px]',
    'bg-background-element text-text-secondary [transition:background-color_0.15s,color_0.15s]',
    'data-[on=true]:border-[color-mix(in_srgb,var(--color-accent)_30%,transparent)]',
    'data-[on=true]:bg-accent-soft data-[on=true]:text-accent-ink hover:not-data-[on=true]:text-text',
  ],
};

const styles = {
  // The crosshair switch in a chart's header (see CrosshairToggle): touch screens only. Just the icon, with
  // its ring filled (grey off, accent on); the button around it is a bit bigger than the icon, for the finger.
  crosshair: [
    'hidden size-7 items-center justify-center [@media(hover:none)]:inline-flex',
    'text-text-secondary aria-pressed:text-accent',
    '[&_.icon_.ionicon-stroke-width]:fill-background-selected',
    'aria-pressed:[&_.icon_.ionicon-stroke-width]:fill-accent',
  ],
};

interface UPlotChartProps {
  /** Memoize these: a new object rebuilds the chart. */
  options: Omit<uPlot.Options, 'width' | 'height'>;
  data: uPlot.AlignedData;
  height: number;
  /** Which data series to show (entry i is series i + 1); changing it doesn't rebuild the chart. */
  seriesShown?: boolean[];
  /** For a chart built with `chartInteraction`: its crosshair switch (see CrosshairToggle) applies. */
  zoom?: ChartZoom;
}

// uPlot draws on a canvas, so it can't follow CSS: the chart is rebuilt whenever its options or data
// change (theme colors come in through the options), and only resized when the width changes.
export function UPlotChart({ options, data, height, seriesShown, zoom }: UPlotChartProps) {
  const [boxRef, width] = useElementWidth<HTMLDivElement>();
  const plotRef = useRef<uPlot | null>(null);
  const widthRef = useRef(width);
  widthRef.current = width;
  const hasWidth = width > 0;

  useEffect(() => {
    const el = boxRef.current;
    if (!el || !hasWidth) {
      return;
    }
    const plot = new uPlot({ ...options, width: widthRef.current, height }, data, el);
    plotRef.current = plot;
    return () => {
      plot.destroy();
      plotRef.current = null;
    };
  }, [boxRef, options, data, height, hasWidth]);

  // Shows or hides series on the live chart. It runs after the one above with the same triggers, so a
  // rebuilt chart gets the hidden series hidden again.
  useEffect(() => {
    const plot = plotRef.current;
    seriesShown?.forEach((show, i) => {
      if (plot && plot.series[i + 1].show !== show) {
        plot.setSeries(i + 1, { show });
      }
    });
  }, [boxRef, options, data, height, hasWidth, seriesShown]);

  useEffect(() => {
    if (width > 0) {
      plotRef.current?.setSize({ width, height });
    }
  }, [width, height]);

  // Turning the crosshair off takes it (and the tooltip) away at once.
  const crosshair = zoom?.crosshair ?? false;
  useEffect(() => {
    if (!crosshair) {
      plotRef.current?.setCursor({ left: -10, top: -10 });
    }
  }, [crosshair]);

  // The box holds the chart's height before uPlot has drawn into it (a new chart waits a render for its
  // width), so rebuilding one, like picking another mode, doesn't move the page under it.
  const box = <div ref={boxRef} className="min-w-0 self-stretch" style={{ minHeight: height }} />;
  if (!zoom) {
    return box;
  }
  // The touch gestures read the switch from `data-crosshair` (see addTouchControls), so flipping it
  // doesn't rebuild the chart.
  return (
    <div className="min-w-0 self-stretch" data-crosshair={crosshair ? 'on' : 'off'}>
      {box}
    </div>
  );
}

/**
 * The time range chips every chart has (the last `days` days, or all of them for null). While zoomed the
 * view is no range in particular, so none is shown as picked; picking one (even the same) starts unzoomed.
 */
export function RangeChips({
  days,
  zoom,
  onPick,
}: {
  days: number | null;
  zoom: ChartZoom;
  onPick: (days: number | null) => void;
}) {
  return (
    <div className={cn(chipStyles.row)}>
      {CHART_RANGES.map((range) => (
        <button
          key={range.label}
          type="button"
          className={cn(chipStyles.chip)}
          data-on={days === range.days && !zoom.zoomed}
          onClick={() => {
            onPick(range.days);
            zoom.reset();
          }}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}

/**
 * What goes in the header of a section with a chart built with `chartInteraction`: the crosshair switch, and
 * Reset zoom beside it while zoomed.
 */
export function ChartZoomActions({ zoom }: { zoom: ChartZoom }) {
  return (
    <>
      <CrosshairToggle zoom={zoom} />
      {zoom.zoomed && (
        <button type="button" className={cn(chipStyles.chip)} onClick={zoom.reset}>
          Reset zoom
        </button>
      )}
    </>
  );
}

/**
 * The crosshair switch, shown on touch screens only (with a mouse, the crosshair simply follows the pointer).
 * One finger moves the crosshair while it's on, and the chart while it's off.
 */
function CrosshairToggle({ zoom }: { zoom: ChartZoom }) {
  return (
    <button
      type="button"
      className={cn(styles.crosshair)}
      aria-label="Crosshair"
      aria-pressed={zoom.crosshair}
      title={zoom.crosshair ? 'Crosshair on: one finger reads values' : 'Crosshair off: one finger moves the chart'}
      onClick={() => zoom.setCrosshair((v) => !v)}
    >
      <Icon name="locate-outline" size={22} />
    </button>
  );
}

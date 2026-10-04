import type { StreamId } from '@/game/types';
import { STREAM_LABELS } from '@/game/types';

function Slider({
  value,
  min,
  max,
  step,
  onValueChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number) => void;
}) {
  return (
    <input
      type="range"
      className="mx-0 my-2 w-full cursor-pointer accent-accent"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onValueChange(Number(e.target.value))}
    />
  );
}

export function MatchSlider({
  stream,
  value,
  cap,
  onChange,
}: {
  stream: StreamId;
  value: number;
  cap: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-1 flex flex-col gap-0.5">
      <div className="row-between">
        <span className="text-default">{STREAM_LABELS[stream]}</span>
        <span className="font-mono text-code">{value}</span>
      </div>
      <Slider value={value} min={0} max={cap} step={1} onValueChange={onChange} />
    </div>
  );
}

import { cn } from '@/lib/cn';

const styles = {
  select: [
    'cursor-pointer self-start rounded-lg px-2.5 py-1.5',
    'border border-background-selected bg-background-element',
  ],
};

//TODO: On android it uses a strange native dropdown and it's very ugly
export function YearDropdown({
  years,
  value,
  onChange,
}: {
  years: number[];
  value: number;
  onChange: (year: number) => void;
}) {
  return (
    <select
      className={cn('text-small', styles.select)}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  );
}

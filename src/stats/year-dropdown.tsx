import { HudDropdown } from '@/components/ui/hud-dropdown';
import { cn } from '@/lib/cn';

const styles = {
  // The panel opens under the chip, aligned left (the HUD's is centred under the row).
  picker: [
    'relative self-start',
    '[&_.hud-popover]:left-0 [&_.hud-popover]:transform-none [&_.hud-popover]:items-stretch',
    '[&_.hud-popover]:top-[calc(100%+4px)] [&_.hud-popover]:gap-0 [&_.hud-popover]:rounded-lg [&_.hud-popover]:p-1',
    '[&_.hud-popover]:shadow-md',
  ],
  // The size and corners of the old select, not the HUD's pill.
  chip: 'rounded-lg border border-background-selected px-2.5 py-1.5 font-sans text-small',
  options: 'flex w-max min-w-full flex-col',
  option: [
    'cursor-pointer rounded-md px-2.5 py-1 text-left text-small',
    // The year shown is bold, so it stands out on touch screens too. A light grey under the mouse.
    'data-[on=true]:font-semibold',
    'hover:bg-background-element',
  ],
};

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
    <div className={cn(styles.picker)}>
      <HudDropdown
        label={`Year: ${value}`}
        chipClassName={styles.chip}
        chip={
          <>
            {value}
            <span aria-hidden className="text-text-secondary">
              ▾
            </span>
          </>
        }
      >
        {(close) => (
          <div className={cn(styles.options)}>
            {years.map((y) => (
              <button
                key={y}
                type="button"
                className={cn(styles.option)}
                data-on={y === value}
                aria-current={y === value}
                onClick={() => {
                  if (y !== value) {
                    onChange(y);
                  }
                  close();
                }}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </HudDropdown>
    </div>
  );
}

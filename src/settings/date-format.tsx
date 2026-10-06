import { HudDropdown } from '@/components/ui/hud-dropdown';
import { settingsCopy } from '@/copy/settings';
import { DATE_STYLES } from '@/config/stats';
import { cn } from '@/lib/cn';
import { resolveDateStyle, type AppPrefs } from '@/lib/prefs';
import { useSettingsStore } from '@/stores/settings';

// Same look as the year picker in Stats (src/stats/year-dropdown.tsx).
const styles = {
  picker: [
    'relative self-start',
    '[&_.hud-popover]:left-0 [&_.hud-popover]:transform-none [&_.hud-popover]:items-stretch',
    '[&_.hud-popover]:top-[calc(100%+4px)] [&_.hud-popover]:gap-0 [&_.hud-popover]:rounded-lg [&_.hud-popover]:p-1',
    '[&_.hud-popover]:shadow-md',
  ],
  chip: 'rounded-lg border border-background-selected px-2.5 py-1.5 font-sans text-small',
  options: 'flex w-max min-w-full flex-col',
  option: [
    'cursor-pointer rounded-md px-2.5 py-1 text-left text-small',
    // The chosen one is bold, so it shows without colour.
    'data-[on=true]:font-semibold',
    'hover:bg-background-element',
  ],
};

type Choice = AppPrefs['dateFormat'];

// The pattern itself, so it reads without an example: MM/DD/YYYY.
function optionLabel(choice: Choice): string {
  const pattern = settingsCopy.dateFormat.styles[resolveDateStyle(choice)];
  return choice === 'system' ? `${settingsCopy.dateFormat.system} (${pattern})` : pattern;
}

const CHOICES: Choice[] = ['system', ...DATE_STYLES];

export function DateFormatPicker() {
  const value = useSettingsStore((s) => s.prefs.dateFormat);
  const setDateFormat = useSettingsStore((s) => s.setDateFormat);
  const current = optionLabel(value);
  return (
    <div className={cn(styles.picker)}>
      <HudDropdown
        label={`${settingsCopy.dateFormat.title}: ${current}`}
        chipClassName={styles.chip}
        chip={
          <>
            {current}
            <span aria-hidden className="text-text-secondary">
              ▾
            </span>
          </>
        }
      >
        {(close) => (
          <div className={cn(styles.options)}>
            {CHOICES.map((c) => (
              <button
                key={c}
                type="button"
                className={cn(styles.option)}
                data-on={c === value}
                aria-current={c === value}
                onClick={() => {
                  if (c !== value) {
                    setDateFormat(c);
                  }
                  close();
                }}
              >
                {optionLabel(c)}
              </button>
            ))}
          </div>
        )}
      </HudDropdown>
    </div>
  );
}

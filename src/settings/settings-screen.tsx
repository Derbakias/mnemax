import { useEffect, useMemo, useRef, useState } from 'react';

import { KeyBindings } from '@/settings/key-bindings';
import { LayoutPreview } from '@/settings/layout-preview';
import { MatchSlider } from '@/settings/sliders';
import { styles } from '@/settings/settings-screen.styles';
import { outlineButton, switchStyles } from '@/components/ui/controls.styles';
import { contentStyles } from '@/components/ui/content.styles';
import { Icon } from '@/components/ui/icon';
import { Section } from '@/components/ui/section';
import { Stepper } from '@/components/ui/stepper';
import { settingsCopy } from '@/copy/settings';
import { SyncSection } from '@/sync/sync-section';
import { MAX_N, MIN_N, SPEED_PRESETS } from '@/config/game';
import { RESET_CONFIRM_MS } from '@/config/ui';
import { maxMatchesFor } from '@/game/rules';
import { STREAM_IDS, STREAM_LABELS } from '@/game/types';
import { MAX_DAILY_TARGET_MINUTES, MIN_DAILY_TARGET_MINUTES, STEP_DAILY_TARGET_MINUTES } from '@/config/stats';
import type { ButtonLayout } from '@/lib/prefs';
import { useSettingsStore } from '@/stores/settings';
import { cn } from '@/lib/cn';
import { buildStatsJson, exportStats, parseStatsPayload, pickStatsFileText, statsFilename } from '@/lib/stats-io';
import { loadRounds, mergeRounds } from '@/lib/storage';

const BUTTON_LAYOUTS: ButtonLayout[] = ['grid', 'rows'];

/** `active`: the Settings tab is showing (the screen stays mounted behind the other tabs). */
export function SettingsScreen({ active }: { active: boolean }) {
  const settings = useSettingsStore((s) => s.settings);
  const prefs = useSettingsStore((s) => s.prefs);
  const toggleStream = useSettingsStore((s) => s.toggleStream);
  const setNLevel = useSettingsStore((s) => s.setNLevel);
  const setSpeed = useSettingsStore((s) => s.setSpeed);
  const setMatchCount = useSettingsStore((s) => s.setMatchCount);
  const setButtonLayout = useSettingsStore((s) => s.setButtonLayout);
  const setSwipeAnswers = useSettingsStore((s) => s.setSwipeAnswers);
  const setDailyTargetMinutes = useSettingsStore((s) => s.setDailyTargetMinutes);
  const setShowTrialTimer = useSettingsStore((s) => s.setShowTrialTimer);
  const setTutorialAid = useSettingsStore((s) => s.setTutorialAid);
  const setKeyBinding = useSettingsStore((s) => s.setKeyBinding);
  const resetDefaults = useSettingsStore((s) => s.resetDefaults);
  const [dataStatus, setDataStatus] = useState<string | null>(null);
  const [dataBusy, setDataBusy] = useState(false);
  // Key bindings only matter with a real keyboard; same test as the key hints on the Play screen.
  const hasKeyboard = useMemo(() => window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false, []);

  const matchCap = maxMatchesFor(settings.nLevel);

  // A tick on the reset button confirms the reset, then fades after a moment. Another click restarts it.
  const [resetDone, setResetDone] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(resetTimer.current), []);
  const onResetDefaults = () => {
    resetDefaults();
    setResetDone(true);
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setResetDone(false), RESET_CONFIRM_MS);
  };

  const onExportStats = async () => {
    if (dataBusy) {
      return;
    }
    setDataBusy(true);
    setDataStatus(null);
    try {
      const rounds = await loadRounds();
      if (rounds.length === 0) {
        setDataStatus(settingsCopy.data.nothingToExport);
        return;
      }
      const filename = statsFilename();
      if (!(await exportStats(buildStatsJson(rounds), filename))) {
        return;
      }
      setDataStatus(settingsCopy.data.exported(rounds.length));
    } catch (error) {
      setDataStatus(errorMessage(error, settingsCopy.data.exportFailed));
    } finally {
      setDataBusy(false);
    }
  };

  const onImportStats = async () => {
    if (dataBusy) {
      return;
    }
    setDataBusy(true);
    setDataStatus(null);
    try {
      const text = await pickStatsFileText();
      if (text == null) {
        return;
      }
      const { rounds, skipped } = parseStatsPayload(text);
      const { added } = await mergeRounds(rounds);
      const status = added > 0 ? settingsCopy.data.imported(added) : settingsCopy.data.nothingNew;
      setDataStatus(skipped > 0 ? `${status} ${settingsCopy.data.skipped(skipped)}` : status);
    } catch (error) {
      setDataStatus(errorMessage(error, settingsCopy.data.importFailed));
    } finally {
      setDataBusy(false);
    }
  };

  return (
    <div className={cn(contentStyles.base, contentStyles.settings)}>
      <Section title={settingsCopy.streams.title} info={settingsCopy.streams.info}>
        {STREAM_IDS.map((stream) => (
          <label key={stream} className="flex cursor-pointer items-center justify-between gap-2">
            <span className="text-default">{STREAM_LABELS[stream]}</span>
            <input
              type="checkbox"
              role="switch"
              className={cn(switchStyles)}
              checked={settings.activeStreams[stream]}
              onChange={(e) => toggleStream(stream, e.target.checked)}
            />
          </label>
        ))}
      </Section>

      <Section title={settingsCopy.nLevel.title} info={settingsCopy.nLevel.info}>
        <Stepper value={settings.nLevel} min={MIN_N} max={MAX_N} onChange={setNLevel} />
      </Section>

      <Section title={settingsCopy.speed.title} info={settingsCopy.speed.info}>
        <div className="flex flex-wrap gap-2">
          {/* Slowest first, reading left to right towards faster. */}
          {[...SPEED_PRESETS].reverse().map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={cn(styles.chip)}
              data-on={settings.speed === preset.id}
              onClick={() => setSpeed(preset.id)}
            >
              <span className="text-small">{preset.label}</span>
              <span className="font-mono text-code opacity-70">{preset.answerMs} ms</span>
            </button>
          ))}
        </div>
        {/* The same room below the speed chips as between them and the heading above. */}
        <label className={cn(styles.switchInline, 'mt-1.5')}>
          <span className="text-default">{settingsCopy.speed.timerSwitch}</span>
          <input
            type="checkbox"
            role="switch"
            className={cn(switchStyles)}
            checked={prefs.showTrialTimer}
            onChange={(e) => setShowTrialTimer(e.target.checked)}
          />
        </label>
      </Section>

      <Section title={settingsCopy.matches.title} info={settingsCopy.matches.info(matchCap)}>
        {STREAM_IDS.filter((s) => settings.activeStreams[s]).map((stream) => (
          <MatchSlider
            key={stream}
            stream={stream}
            value={settings.matchCounts[stream]}
            cap={matchCap}
            onChange={(v) => setMatchCount(stream, v)}
          />
        ))}
      </Section>

      <Section title={settingsCopy.dailyTarget.title} info={settingsCopy.dailyTarget.info}>
        {/* The minutes right beside the number, rather than pushed to the far edge. */}
        <div className="flex items-center gap-3">
          <Stepper
            value={prefs.dailyTargetMinutes}
            min={MIN_DAILY_TARGET_MINUTES}
            max={MAX_DAILY_TARGET_MINUTES}
            step={STEP_DAILY_TARGET_MINUTES}
            onChange={setDailyTargetMinutes}
          />
          <span className="text-default text-text-secondary">{settingsCopy.dailyTarget.unit}</span>
        </div>
      </Section>

      <Section title={settingsCopy.tutorial.title} info={settingsCopy.tutorial.info}>
        <label className="flex cursor-pointer items-center justify-between gap-2">
          <span className="text-default">{settingsCopy.tutorial.historySwitch}</span>
          <input
            type="checkbox"
            role="switch"
            className={cn(switchStyles)}
            checked={prefs.tutorialHistory}
            onChange={(e) => setTutorialAid('tutorialHistory', e.target.checked)}
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-2">
          <span className="text-default">{settingsCopy.tutorial.solutionSwitch}</span>
          <input
            type="checkbox"
            role="switch"
            className={cn(switchStyles)}
            checked={prefs.tutorialSolution}
            onChange={(e) => setTutorialAid('tutorialSolution', e.target.checked)}
          />
        </label>
      </Section>

      <Section title={settingsCopy.buttonLayout.title} info={settingsCopy.buttonLayout.info}>
        <div className={cn(styles.layoutOptions)}>
          {BUTTON_LAYOUTS.map((layout) => (
            <button
              key={layout}
              type="button"
              className={cn(styles.chip, styles.layoutChip)}
              data-on={prefs.buttonLayout === layout}
              onClick={() => setButtonLayout(layout)}
            >
              <LayoutPreview layout={layout} />
              <span className="text-small">{settingsCopy.buttonLayout.layouts[layout]}</span>
            </button>
          ))}
        </div>
        {prefs.buttonLayout === 'grid' && (
          <label className={cn(styles.switchInline)}>
            <span className="text-default">{settingsCopy.buttonLayout.swipeSwitch}</span>
            <input
              type="checkbox"
              role="switch"
              className={cn(switchStyles)}
              checked={prefs.swipeAnswers}
              onChange={(e) => setSwipeAnswers(e.target.checked)}
            />
          </label>
        )}
      </Section>

      {hasKeyboard && (
        <Section title={settingsCopy.keyboard.title} info={settingsCopy.keyboard.info}>
          <KeyBindings keys={prefs.keyBindings} onChange={setKeyBinding} />
        </Section>
      )}

      <Section title={settingsCopy.data.title} info={settingsCopy.data.info}>
        <div className="flex gap-2.5">
          <button
            type="button"
            className={cn(outlineButton.base, outlineButton.accent)}
            disabled={dataBusy}
            onClick={onExportStats}
          >
            Export JSON
          </button>
          <button
            type="button"
            className={cn(outlineButton.base, outlineButton.accent)}
            disabled={dataBusy}
            onClick={onImportStats}
          >
            Import JSON
          </button>
        </div>
        {dataStatus && <p className="text-small text-text-secondary">{dataStatus}</p>}
      </Section>

      <SyncSection active={active} />

      <button
        type="button"
        className={cn(outlineButton.base, outlineButton.danger, 'relative')}
        onClick={onResetDefaults}
      >
        Reset to defaults
        <span className={cn(styles.resetTick)} data-on={resetDone}>
          <Icon name="checkmark-circle" size={22} />
        </span>
      </button>
      <span className="sr-only" role="status">
        {resetDone ? settingsCopy.reset.done : ''}
      </span>

      <p className="text-small text-text-secondary text-center">Mnemax v{__APP_VERSION__}</p>
    </div>
  );
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string' && error) {
    return error;
  }
  return fallback;
}

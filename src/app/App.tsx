import { useCallback, useEffect, useState } from 'react';

import { GridLoader } from '@/components/ui/grid-loader';
import { SPLASH_FADE_MS, SPLASH_MAX_MS, SPLASH_MIN_MS } from '@/config/ui';
import { Icon, type IconName } from '@/components/ui/icon';
import { appCopy } from '@/copy/app';
import { PlayScreen, type PlayStage } from '@/play/play-screen';
import { SettingsScreen } from '@/settings/settings-screen';
import { StatsScreen } from '@/stats/stats-screen';
import { useSettingsStore } from '@/stores/settings';
import { useSyncStore } from '@/stores/sync';
import { cn } from '@/lib/cn';
import { preloadSpeech } from '@/lib/speech';

type Tab = 'play' | 'stats' | 'settings';

const TABS: { id: Tab; icon: IconName }[] = [
  { id: 'play', icon: 'play-circle-outline' },
  { id: 'stats', icon: 'stats-chart-outline' },
  { id: 'settings', icon: 'settings-outline' },
];

type SplashState = 'showing' | 'fading' | 'gone';

const styles = {
  // The whole app: the screen with the tab bar under it, clear of the phone's status bar at the top.
  app: 'relative flex h-full flex-col pt-(--safe-top)',
  screen: [
    // relative: anything placed inside a screen stays inside it. Without it, the screen-reader-only text
    // (sr-only) was placed against the whole app, and stretched the page past the tab bar.
    'relative min-h-0 flex-1 overflow-y-auto',
    // Nothing (e.g. an open dropdown) ever scrolls a screen sideways.
    'overflow-x-hidden',
    // Lets what's inside size itself to the visible screen (cqh), e.g. the Play stage on phones.
    '@container-size',
    // It scrolls, but shows no scrollbar.
    '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  ],
  // A faint blue glow from the top left and orange from the bottom right (Play and Stats), so the screen isn't
  // flat white or black; faint enough that the grid's colours still stand out.
  wash: [
    'bg-background',
    'bg-[image:radial-gradient(120%_55%_at_0%_0%,var(--color-wash-blue),transparent_70%),radial-gradient(110%_50%_at_100%_100%,var(--color-wash-orange),transparent_70%)]',
  ],
  tabBar: [
    'flex shrink-0 border-t border-background-selected bg-background pb-(--safe-bottom)',
    // The tabs sit in the pages' column (640px less its 16px sides, see src/components/ui/content.styles.ts),
    // not spread across a wide window; the border still runs the full width.
    'px-[max(0px,calc((100%_-_608px)_/_2))]',
    // A paused round (data-overlay): the tab bar comes back over the bottom of the screen, so nothing under it
    // moves.
    'data-[overlay=true]:absolute data-[overlay=true]:inset-x-0 data-[overlay=true]:bottom-0',
    'data-[overlay=true]:z-20 data-[overlay=true]:shadow-[0_-8px_24px_rgba(0,0,0,0.12)]',
  ],
  // A tab: its icon over its name, grey, or blue for the tab showing (data-on).
  tab: [
    'flex h-(--tab-bar-height) flex-1 flex-col items-center justify-center gap-0.5',
    'text-[11px] font-medium text-text-secondary data-[on=true]:text-accent',
  ],
  // The startup screen: a big loader over the whole app, fading out once it's ready (data-fading), and letting
  // presses through to the app while it does.
  splash: [
    'fixed inset-0 z-100 flex flex-col items-center justify-center gap-5 bg-background',
    '[transition:opacity_0.25s_ease-out] data-[fading=true]:pointer-events-none data-[fading=true]:opacity-0',
  ],
};

export default function App() {
  const [tab, setTab] = useState<Tab>('play');
  // A round takes the whole screen: no tab bar while it runs. When it's paused the tab bar comes back over
  // the bottom of the screen, without moving the game under it.
  const [playStage, setPlayStage] = useState<PlayStage>('start');
  const tabBarHidden = tab === 'play' && playStage === 'playing';
  const tabBarOverlay = tab === 'play' && playStage === 'paused';
  const settingsReady = useSettingsStore((s) => s.ready);
  const [splash, setSplash] = useState<SplashState>('showing');
  const [minTimeDone, setMinTimeDone] = useState(false);
  const [playReady, setPlayReady] = useState(false);
  const [statsReady, setStatsReady] = useState(false);
  const onPlayReady = useCallback(() => setPlayReady(true), []);
  const onStatsReady = useCallback(() => setStatsReady(true), []);
  // The letter clips, decoded before the first round so its first trial isn't silent.
  const [audioReady, setAudioReady] = useState(false);
  const dataReady = settingsReady && playReady && statsReady && audioReady;

  // Sync needs to know when the Settings tab is open and when a round is being played (see src/sync/sync-auto.ts).
  useEffect(() => {
    useSyncStore.getState().setScreen({ settingsActive: tab === 'settings', playing: playStage === 'playing' });
  }, [tab, playStage]);

  useEffect(() => {
    // Settles on failure too (letters then load on Play), so the startup screen can't hang on it.
    preloadSpeech().finally(() => setAudioReady(true));
  }, []);

  // Startup: a game-like moment, while the screens load their data behind the startup screen.
  useEffect(() => {
    const delay = SPLASH_MIN_MS + Math.random() * (SPLASH_MAX_MS - SPLASH_MIN_MS);
    const timer = setTimeout(() => setMinTimeDone(true), delay);
    return () => clearTimeout(timer);
  }, []);

  // Two steps: fade once everything is ready, then remove it when the fade has finished. (One effect doing
  // both cancelled its own removal timer, since switching to 'fading' re-ran it.)
  useEffect(() => {
    if (splash === 'showing' && minTimeDone && dataReady) {
      setSplash('fading');
    }
  }, [splash, minTimeDone, dataReady]);
  useEffect(() => {
    if (splash !== 'fading') {
      return;
    }
    const timer = setTimeout(() => setSplash('gone'), SPLASH_FADE_MS);
    return () => clearTimeout(timer);
  }, [splash]);

  // All screens stay mounted (like the Expo tab navigator) so a running round survives tab switches.
  return (
    // Buttons don't take focus from a mouse click or tap (Tab still reaches them): a focused button,
    // like the Play button or the Play tab, would catch the answer keys, so arrow keys moved focus and
    // showed a focus ring instead of answering. Only buttons: sliders and inputs still need the press.
    <div
      className={cn(styles.app)}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest('button')) {
          e.preventDefault();
        }
      }}
    >
      <main className={cn(styles.screen, styles.wash)} hidden={tab !== 'play'}>
        {/* Keyboard shortcuts stay off under the startup screen, so Space can't start a round behind it. */}
        <PlayScreen active={tab === 'play' && splash === 'gone'} onReady={onPlayReady} onStageChange={setPlayStage} />
      </main>
      <main className={cn(styles.screen, styles.wash)} hidden={tab !== 'stats'}>
        <StatsScreen onReady={onStatsReady} />
      </main>
      <main className={cn(styles.screen)} hidden={tab !== 'settings'}>
        <SettingsScreen active={tab === 'settings'} />
      </main>
      {/* data-tab-bar: the HUD's dropdowns find the tab bar by it, to stop above it. */}
      <nav className={cn(styles.tabBar)} data-tab-bar data-overlay={tabBarOverlay} hidden={tabBarHidden}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={cn(styles.tab)}
            data-on={tab === t.id}
            aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => setTab(t.id)}
          >
            <Icon name={t.icon} size={24} />
            <span>{appCopy.tabs[t.id]}</span>
          </button>
        ))}
      </nav>
      {splash !== 'gone' && (
        <div className={cn(styles.splash)} data-fading={splash === 'fading'}>
          <GridLoader label="Loading" size="large" />
          <span className="text-[20px] font-semibold tracking-[0.02em] text-text-secondary">{appCopy.splashTitle}</span>
        </div>
      )}
    </div>
  );
}

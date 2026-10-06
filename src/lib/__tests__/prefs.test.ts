import { clampPrefs, resolveDateStyle } from '../prefs';
import { DEFAULT_KEY_BINDINGS } from '@/config/ui';

describe('clampPrefs key bindings', () => {
  it('defaults to F, D, J, K', () => {
    expect(clampPrefs(null).keyBindings).toEqual(DEFAULT_KEY_BINDINGS);
  });

  it('keeps valid bindings, upper-cased', () => {
    const keyBindings = { position: 'q', color: 'w', number: '1', audio: ';' };
    expect(clampPrefs({ keyBindings }).keyBindings).toEqual({ position: 'Q', color: 'W', number: '1', audio: ';' });
  });

  it('accepts arrow keys', () => {
    const keyBindings = { position: 'ArrowLeft', color: 'ArrowUp', number: 'ArrowRight', audio: 'ArrowDown' };
    expect(clampPrefs({ keyBindings }).keyBindings).toEqual(keyBindings);
  });

  it('falls back to the defaults for duplicates, Space, other named keys or missing streams', () => {
    expect(clampPrefs({ keyBindings: { position: 'A', color: 'A', number: 'K', audio: 'L' } }).keyBindings).toEqual(
      DEFAULT_KEY_BINDINGS,
    );
    expect(clampPrefs({ keyBindings: { position: 'Enter', color: 'S', number: 'K', audio: 'L' } }).keyBindings).toEqual(
      DEFAULT_KEY_BINDINGS,
    );
    expect(clampPrefs({ keyBindings: { position: ' ', color: 'S', number: 'K', audio: 'L' } }).keyBindings).toEqual(
      DEFAULT_KEY_BINDINGS,
    );
    expect(
      clampPrefs({ keyBindings: { position: 'Q' } as unknown as typeof DEFAULT_KEY_BINDINGS }).keyBindings,
    ).toEqual(DEFAULT_KEY_BINDINGS);
  });
});

describe('clampPrefs tutorial', () => {
  it('shows the history by default', () => {
    expect(clampPrefs(null)).toMatchObject({ tutorialHistory: true, tutorialSolution: false });
  });

  it('keeps either one or both on', () => {
    expect(clampPrefs({ tutorialHistory: false, tutorialSolution: true })).toMatchObject({
      tutorialHistory: false,
      tutorialSolution: true,
    });
    expect(clampPrefs({ tutorialHistory: true, tutorialSolution: true })).toMatchObject({
      tutorialHistory: true,
      tutorialSolution: true,
    });
  });

  it('never turns both off', () => {
    expect(clampPrefs({ tutorialHistory: false, tutorialSolution: false })).toMatchObject({
      tutorialHistory: true,
      tutorialSolution: false,
    });
  });
});

describe('clampPrefs swipe answers', () => {
  it('is off by default', () => {
    expect(clampPrefs(null).swipeAnswers).toBe(false);
  });

  it('only turns on for true', () => {
    expect(clampPrefs({ swipeAnswers: true }).swipeAnswers).toBe(true);
    expect(clampPrefs({ swipeAnswers: 'yes' as unknown as boolean }).swipeAnswers).toBe(false);
  });
});

describe('clampPrefs auto sync', () => {
  it('is on by default', () => {
    expect(clampPrefs(null).autoSync).toBe(true);
    expect(clampPrefs({}).autoSync).toBe(true);
  });

  it('only turns off for false', () => {
    expect(clampPrefs({ autoSync: false }).autoSync).toBe(false);
    expect(clampPrefs({ autoSync: 'no' as unknown as boolean }).autoSync).toBe(true);
  });
});

describe('clampPrefs dateFormat', () => {
  it('follows the system by default', () => {
    expect(clampPrefs(null).dateFormat).toBe('system');
  });

  it('keeps system and the fixed orders', () => {
    for (const ok of ['system', 'dmy', 'mdy', 'ymd'] as const) {
      expect(clampPrefs({ dateFormat: ok }).dateFormat).toBe(ok);
    }
  });

  it('falls back to system for anything else', () => {
    for (const bad of [5, 'en-GB', 'DMY', '', null]) {
      expect(clampPrefs({ dateFormat: bad as never }).dateFormat).toBe('system');
    }
  });
});

describe('resolveDateStyle', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('returns a fixed order as it is', () => {
    expect(resolveDateStyle('mdy')).toBe('mdy');
  });

  it('reads the order of navigator.language for system', () => {
    vi.stubGlobal('navigator', { language: 'en-US' });
    expect(resolveDateStyle('system')).toBe('mdy');
    vi.stubGlobal('navigator', { language: 'en-GB' });
    expect(resolveDateStyle('system')).toBe('dmy');
    vi.stubGlobal('navigator', { language: 'ja-JP' });
    expect(resolveDateStyle('system')).toBe('ymd');
  });

  it('falls back to day first when the system has no usable language', () => {
    vi.stubGlobal('navigator', undefined);
    expect(resolveDateStyle('system')).toBe('dmy');
    vi.stubGlobal('navigator', { language: 'not a locale!' });
    expect(resolveDateStyle('system')).toBe('dmy');
    vi.stubGlobal('navigator', { language: '' });
    expect(resolveDateStyle('system')).toBe('dmy');
  });
});

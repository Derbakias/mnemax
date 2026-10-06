import { isTauri } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, stat, writeTextFile } from '@tauri-apps/plugin-fs';

import { buildStatsJson, exportStats, parseStatsPayload, pickStatsFileText, statsFilename } from '../stats-io';
import type { RoundResult } from '../../game/types';

vi.mock('@tauri-apps/api/core', () => ({ isTauri: vi.fn() }));
vi.mock('@tauri-apps/plugin-dialog', () => ({ save: vi.fn(), open: vi.fn() }));
vi.mock('@tauri-apps/plugin-fs', () => ({ writeTextFile: vi.fn(), readTextFile: vi.fn(), stat: vi.fn() }));

const MAX_BYTES = 32 * 1024 * 1024;

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

function round(id: string): RoundResult {
  return {
    id,
    finishedAt: Date.UTC(2026, 8, 29),
    settings: {
      activeStreams: { position: true, color: false, number: false, audio: true },
      nLevel: 2,
      speed: 'normal',
      trialDurationMs: 2900,
      matchCounts: { position: 6, color: 6, number: 6, audio: 6 },
    },
    trials: [],
  };
}

describe('parseStatsPayload', () => {
  it('reads back what export writes', () => {
    const rounds = [round('a'), round('b')];
    expect(parseStatsPayload(buildStatsJson(rounds))).toEqual({ rounds, skipped: 0 });
  });

  it('reads a bare list of rounds', () => {
    expect(parseStatsPayload(JSON.stringify([round('a')]))).toEqual({ rounds: [round('a')], skipped: 0 });
  });

  it('keeps the good rounds and counts the broken ones', () => {
    const text = JSON.stringify({ rounds: [round('a'), { ...round('b'), finishedAt: 'soon' }, 42] });
    expect(parseStatsPayload(text)).toEqual({ rounds: [round('a')], skipped: 2 });
  });

  it('explains a file it cannot use', () => {
    expect(() => parseStatsPayload('{')).toThrow('not valid JSON');
    expect(() => parseStatsPayload('{"games": []}')).toThrow('No "rounds" array');
    expect(() => parseStatsPayload('{"rounds": [{}]}')).toThrow('No valid rounds');
  });

  it('turns down a file far bigger than an export', () => {
    const huge = `{"rounds": [], "pad": "${'x'.repeat(32 * 1024 * 1024)}"}`;
    expect(() => parseStatsPayload(huge)).toThrow('too big');
  });
});

describe('buildStatsJson', () => {
  it('wraps the rounds with the app, version and export time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-19T10:30:00.000Z'));
    expect(JSON.parse(buildStatsJson([round('a')]))).toEqual({
      app: 'mnemax',
      version: 1,
      exportedAt: '2026-09-19T10:30:00.000Z',
      rounds: [round('a')],
    });
  });
});

describe('statsFilename', () => {
  it('names the file after the day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-19T23:59:59.000Z'));
    expect(statsFilename()).toBe('mnemax-stats-2026-09-19.json');
  });
});

function stubAndroid(on: boolean) {
  vi.stubGlobal('navigator', { userAgent: on ? 'Mozilla/5.0 (Linux; Android 14)' : 'Mozilla/5.0 (X11; Linux)' });
}

describe('exportStats in the browser', () => {
  it('downloads the file through a link and frees the url', async () => {
    const anchor = { href: '', download: '', click: vi.fn() };
    vi.stubGlobal('document', { createElement: vi.fn(() => anchor) });
    const createObjectURL = vi.fn(() => 'blob:fake');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    vi.mocked(isTauri).mockReturnValue(false);

    expect(await exportStats('{}', 'out.json')).toBe(true);

    const blob = (createObjectURL.mock.calls[0] as unknown as [Blob])[0];
    expect(blob.type).toBe('application/json');
    expect(await blob.text()).toBe('{}');
    expect(anchor).toMatchObject({ href: 'blob:fake', download: 'out.json' });
    expect(anchor.click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:fake');
  });
});

describe('exportStats in Tauri', () => {
  beforeEach(() => {
    vi.mocked(isTauri).mockReturnValue(true);
    stubAndroid(false);
  });

  it('writes the file to the chosen path', async () => {
    vi.mocked(save).mockResolvedValue('/tmp/out.json');
    expect(await exportStats('{}', 'out.json')).toBe(true);
    expect(save).toHaveBeenCalledWith({ defaultPath: 'out.json', filters: [{ name: 'JSON', extensions: ['json'] }] });
    expect(writeTextFile).toHaveBeenCalledWith('/tmp/out.json', '{}');
  });

  it('writes nothing when the user cancels', async () => {
    vi.mocked(save).mockResolvedValue(null);
    expect(await exportStats('{}', 'out.json')).toBe(false);
    expect(writeTextFile).not.toHaveBeenCalled();
  });

  it('does not filter by type on Android', async () => {
    stubAndroid(true);
    vi.mocked(save).mockResolvedValue(null);
    await exportStats('{}', 'out.json');
    expect(save).toHaveBeenCalledWith({ defaultPath: 'out.json', filters: undefined });
  });
});

describe('pickStatsFileText in Tauri', () => {
  beforeEach(() => {
    vi.mocked(isTauri).mockReturnValue(true);
    stubAndroid(false);
  });

  it('reads the chosen file', async () => {
    vi.mocked(open).mockResolvedValue('/tmp/in.json');
    vi.mocked(stat).mockResolvedValue({ size: 10 } as Awaited<ReturnType<typeof stat>>);
    vi.mocked(readTextFile).mockResolvedValue('text');
    expect(await pickStatsFileText()).toBe('text');
    expect(open).toHaveBeenCalledWith({
      multiple: false,
      directory: false,
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });
  });

  it('returns null when the user cancels', async () => {
    vi.mocked(open).mockResolvedValue(null);
    expect(await pickStatsFileText()).toBeNull();
    expect(readTextFile).not.toHaveBeenCalled();
  });

  it('refuses a huge file without reading it', async () => {
    vi.mocked(open).mockResolvedValue('/tmp/big.json');
    vi.mocked(stat).mockResolvedValue({ size: MAX_BYTES + 1 } as Awaited<ReturnType<typeof stat>>);
    await expect(pickStatsFileText()).rejects.toThrow('too big');
    expect(readTextFile).not.toHaveBeenCalled();
  });
});

describe('pickStatsFileText in the browser', () => {
  type Input = {
    type: string;
    accept: string;
    files?: unknown[];
    onchange?: () => void;
    oncancel?: () => void;
    click: () => void;
  };

  /** Stubs the DOM; `act` plays the user's part once the picker is open. */
  function stubPicker(act: (input: Input) => void, reader?: { result?: string; fail?: boolean }) {
    const input: Input = { type: '', accept: '', click: () => act(input) };
    vi.stubGlobal('document', { createElement: vi.fn(() => input) });
    vi.stubGlobal(
      'FileReader',
      class {
        result = reader?.result;
        onload?: () => void;
        onerror?: () => void;
        readAsText() {
          if (reader?.fail) {
            this.onerror?.();
          } else {
            this.onload?.();
          }
        }
      },
    );
    vi.mocked(isTauri).mockReturnValue(false);
    return input;
  }

  it('reads the file the user picks', async () => {
    const input = stubPicker(
      (i) => {
        i.files = [{ size: 5 }];
        i.onchange?.();
      },
      { result: 'hello' },
    );
    expect(await pickStatsFileText()).toBe('hello');
    expect(input.type).toBe('file');
    expect(input.accept).toBe('application/json,.json');
  });

  it('returns null when nothing is picked', async () => {
    stubPicker((i) => {
      i.files = [];
      i.onchange?.();
    });
    expect(await pickStatsFileText()).toBeNull();
  });

  it('returns null when the picker is cancelled', async () => {
    stubPicker((i) => i.oncancel?.());
    expect(await pickStatsFileText()).toBeNull();
  });

  it('refuses a huge file', async () => {
    stubPicker((i) => {
      i.files = [{ size: MAX_BYTES + 1 }];
      i.onchange?.();
    });
    await expect(pickStatsFileText()).rejects.toThrow('too big');
  });

  it('returns null when the file cannot be read', async () => {
    stubPicker(
      (i) => {
        i.files = [{ size: 5 }];
        i.onchange?.();
      },
      { fail: true },
    );
    expect(await pickStatsFileText()).toBeNull();
  });
});

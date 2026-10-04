import { useEffect, useState, type SubmitEvent } from 'react';

import { Section } from '../components/ui/section';
import { outlineButton, switchStyles, textField } from '@/components/ui/controls.styles';
import { syncCopy } from '@/copy/sync';
import { SyncLog } from './sync-log';
import { Pairing } from './sync-pairing';
import { PeerRow } from './sync-peer';
import { useSettingsStore } from '@/stores/settings';
import { isUsable, useSyncStore } from '@/stores/sync';
import { cancelPairing, renameDevice } from '@/sync/sync';
import { cn } from '@/lib/cn';

/**
 * Sync with your other devices on the same Wi-Fi: the paired devices, pairing a new one, and the switch for
 * syncing by itself. The syncing itself runs for the whole app (see src/sync/sync-auto.ts). Only in the app.
 */
export function SyncSection({ active }: { active: boolean }) {
  return useSyncStore((s) => s.available) ? <SyncPanel active={active} /> : null;
}

function SyncPanel({ active }: { active: boolean }) {
  const autoSync = useSettingsStore((s) => s.prefs.autoSync);
  const setAutoSync = useSettingsStore((s) => s.setAutoSync);
  const status = useSyncStore((s) => s.status);
  const setStatus = useSyncStore((s) => s.setStatus);
  const usable = useSyncStore(isUsable);
  const listening = useSyncStore((s) => s.listening);
  const refresh = useSyncStore((s) => s.refresh);
  const notice = useSyncStore((s) => s.notice);
  const failWith = useSyncStore((s) => s.failWith);
  const dismiss = useSyncStore((s) => s.dismiss);
  const log = useSyncStore((s) => s.log);
  const syncing = useSyncStore((s) => s.syncing);
  const [pairing, setPairing] = useState<{ how: 'show' | 'enter'; hint?: string } | null>(null);
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  // Any pairing ends when the Sync section goes away.
  useEffect(() => () => void cancelPairing().catch(() => {}), []);
  useEffect(() => {
    if (!active) {
      setNameDraft(null);
    }
  }, [active]);

  const startPairing = (how: 'show' | 'enter', hint?: string) => {
    dismiss();
    setPairing({ how, hint });
  };

  const onRename = async (e: SubmitEvent) => {
    e.preventDefault();
    if (nameDraft == null) {
      return;
    }
    try {
      setStatus(await renameDevice(nameDraft));
      setNameDraft(null);
    } catch (error) {
      failWith(error);
    }
  };

  const peers = status?.peers ?? [];
  const busy = syncing != null || pairing != null;

  return (
    <Section title={syncCopy.section.title} info={syncCopy.section.info}>
      {usable && (
        <div className="panel panel-pad stack-10">
          {nameDraft == null ? (
            <div className="row-between">
              <div>
                <div className="text-small text-text-secondary">{syncCopy.section.thisDevice}</div>
                <div className="text-default">{status?.name}</div>
              </div>
              <button
                type="button"
                className="text-button text-small text-text-secondary"
                onClick={() => setNameDraft(status?.name ?? '')}
              >
                Rename
              </button>
            </div>
          ) : (
            <form className="flex flex-col gap-1.5" onSubmit={onRename}>
              <label className="text-small text-text-secondary" htmlFor="sync-name">
                {syncCopy.section.renameLabel}
              </label>
              <div className="flex gap-2.5">
                <input
                  id="sync-name"
                  className={cn(textField)}
                  value={nameDraft}
                  maxLength={40}
                  autoFocus
                  onChange={(e) => setNameDraft(e.target.value)}
                />
                <button type="submit" className={cn(outlineButton.base, outlineButton.accent, outlineButton.small)}>
                  Save
                </button>
              </div>
            </form>
          )}

          <div className="stack-8">
            {peers.length > 0 ? (
              <>
                <div className="text-small text-text-secondary">{syncCopy.section.pairedDevices}</div>
                {peers.map((peer) => (
                  <PeerRow
                    key={peer.key}
                    peer={peer}
                    busy={busy}
                    onReconnect={
                      pairing == null
                        ? () => startPairing('enter', syncCopy.pairing.stepShowCodeOn(peer.name))
                        : undefined
                    }
                  />
                ))}
              </>
            ) : (
              <p className="text-small text-text-secondary">{syncCopy.section.noPeers}</p>
            )}
          </div>

          {pairing == null ? (
            <div className="flex gap-2.5">
              <button
                type="button"
                className={cn(outlineButton.base, outlineButton.accent)}
                disabled={busy}
                onClick={() => startPairing('show')}
              >
                Show a code
              </button>
              <button
                type="button"
                className={cn(outlineButton.base, outlineButton.accent)}
                disabled={busy}
                onClick={() => startPairing('enter')}
              >
                Enter a code
              </button>
            </div>
          ) : (
            <Pairing how={pairing.how} hint={pairing.hint} active={active} onEnd={() => setPairing(null)} />
          )}

          <label className="row-between cursor-pointer">
            <span className="text-default">{syncCopy.section.autoSwitch}</span>
            <input
              type="checkbox"
              role="switch"
              className={cn(switchStyles)}
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
            />
          </label>
          {peers.length > 0 && <p className="text-small text-text-secondary">{reachText(listening, autoSync)}</p>}
        </div>
      )}
      {!usable && status == null && notice?.kind === 'error' && (
        <button
          type="button"
          className={cn(outlineButton.base, outlineButton.accent)}
          onClick={() => {
            dismiss();
            refresh();
          }}
        >
          Try again
        </button>
      )}
      {notice && (
        // A message under the section, with a small Dismiss at its bottom right.
        <div className="flex flex-col gap-1">
          {notice.kind === 'error' ? (
            // An error is labelled, not only red.
            <p className="text-small text-danger" role="alert">
              <strong>{syncCopy.section.errorLead}</strong> {notice.text}
            </p>
          ) : (
            <p className="text-small text-text-secondary" role="status">
              {notice.text}
            </p>
          )}
          <button
            type="button"
            className="text-button text-text-secondary self-end text-[12px]/4"
            aria-label={notice.kind === 'error' ? 'Dismiss error' : 'Dismiss message'}
            onClick={dismiss}
          >
            Dismiss
          </button>
        </div>
      )}
      {/* Always there (not only after a first attempt), so it appearing can't push things down. */}
      {(usable || log.lines.length > 0) && <SyncLog start={log.start} lines={log.lines} deviceName={status?.name} />}
    </Section>
  );
}

/** Whether paired devices can sync with this one now. */
function reachText(listening: boolean, auto: boolean): string {
  if (auto) {
    return syncCopy.section.reachAuto;
  }
  return listening ? syncCopy.section.reachListening : syncCopy.section.reachClosed;
}

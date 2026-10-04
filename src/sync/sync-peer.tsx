import { useEffect, useRef, useState } from 'react';

import { outlineButton } from '@/components/ui/controls.styles';
import { syncCopy } from '@/copy/sync';
import { cn } from '@/lib/cn';
import { DATE_LOCALE } from '@/config/stats';
import { FORGET_CONFIRM_MS } from '@/config/sync';
import { useSyncStore } from '@/stores/sync';
import { forgetDevice, type SyncPeer } from '@/sync/sync';

/**
 * One paired device: its name, when it was paired and last synced, Sync (only on the device that connects) and
 * Forget, and under it how the latest sync with it went. `busy`: something else is going on, so no Sync now.
 */
export function PeerRow({ peer, busy, onReconnect }: { peer: SyncPeer; busy: boolean; onReconnect?: () => void }) {
  const setStatus = useSyncStore((s) => s.setStatus);
  const inform = useSyncStore((s) => s.inform);
  const failWith = useSyncStore((s) => s.failWith);
  const syncing = useSyncStore((s) => s.syncing);
  const syncWithPeer = useSyncStore((s) => s.syncWithPeer);
  const peerNote = useSyncStore((s) => s.peerNote);
  const [confirming, setConfirming] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const onForget = async () => {
    clearTimeout(timer.current);
    if (!confirming) {
      setConfirming(true);
      timer.current = setTimeout(() => setConfirming(false), FORGET_CONFIRM_MS);
      return;
    }
    setConfirming(false);
    try {
      setStatus(await forgetDevice(peer.key));
      inform(syncCopy.peer.forgot(peer.name));
    } catch (error) {
      failWith(error);
    }
  };

  const note = peerNote?.key === peer.key ? peerNote : null;
  return (
    // The device's row, then how the latest sync with it went.
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-default">{peer.name}</div>
          <div className="text-small text-text-secondary">{syncCopy.peer.pairedOn(day(peer.pairedAt))}</div>
          <PeerState peer={peer} />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {/* Only the device that connects can start a sync; the other one waits for it. */}
          {peer.address != null && (
            <button
              type="button"
              className={cn(outlineButton.base, outlineButton.accent, outlineButton.small)}
              disabled={busy}
              onClick={() => void syncWithPeer(peer)}
            >
              {syncing === peer.key ? 'Syncing…' : 'Sync'}
            </button>
          )}
          <button
            type="button"
            className={confirming ? 'py-1 text-small text-danger' : 'py-1 text-small text-text-secondary'}
            disabled={syncing != null}
            onClick={onForget}
          >
            {confirming ? 'Tap again' : 'Forget'}
          </button>
        </div>
      </div>
      {note && (
        <p
          className={note.kind === 'error' ? 'text-small text-danger' : 'text-small text-text-secondary'}
          role={note.kind === 'error' ? 'alert' : 'status'}
        >
          {note.text}
        </p>
      )}
      {note?.reconnect && onReconnect && (
        <button type="button" className="py-1 text-small text-accent" onClick={onReconnect}>
          Reconnect
        </button>
      )}
    </div>
  );
}

/** When it last synced. */
function PeerState({ peer }: { peer: SyncPeer }) {
  let text = syncCopy.peer.notSynced;
  if (peer.lastSyncAt != null) {
    text = syncCopy.peer.lastSynced(when(peer.lastSyncAt));
  } else if (peer.address == null) {
    // The device that showed the code doesn't start syncs (it has no Sync button): the other one does.
    text = syncCopy.peer.notSyncedWaits;
  }
  return <div className="text-small text-text-secondary">{text}</div>;
}

function day(ms: number): string {
  return new Date(ms).toLocaleDateString(DATE_LOCALE, { dateStyle: 'medium' });
}

function when(ms: number): string {
  return new Date(ms).toLocaleString(DATE_LOCALE, { dateStyle: 'medium', timeStyle: 'short' });
}

import type { ReactNode, SubmitEvent } from 'react';

import { outlineButton, textField } from '@/components/ui/controls.styles';
import { Icon } from '@/components/ui/icon';
import { syncCopy } from '@/copy/sync';
import { cn } from '@/lib/cn';
import { pairingStyles } from '@/sync/pairing.styles';
import { isPhone } from '@/sync/sync';
import { CameraScan, ScanOverlay } from '@/sync/sync-scan';

const styles = {
  // A note a size down from t-small (t-small's weight, written out: t-small's own size would win over this).
  note: 'text-[13px]/[18px] font-medium',
  // The room in the row is shared out by the longest each can be: 15 characters for an address, 11 for a code.
  field: 'flex min-w-0 flex-[15_1_0] flex-col gap-1 text-left last:grow-[11]',
  // Boxes to type in: the page's own background with a thin border and small corners, so they don't look like
  // the buttons under them (which have the card's grey and rounder corners). The text is small enough for the
  // longest address (15 characters) and a code to fit side by side on a small phone.
  input: [
    'w-full flex-none rounded-lg border bg-background px-1.5 py-2.5 font-mono text-[14px]/6',
    'focus:border-accent focus:outline-none',
  ],
  // The × that closes the error, at its top right. `!`: the text-button class's own padding would win.
  close: 'absolute top-0 right-0 flex p-px!',
};

/**
 * The form for the other device's address and code: scan its QR code, or type them in. Any error from the last
 * try shows under the Pair button.
 */
export function EnterCode({
  hint,
  address,
  code,
  canPair,
  joining,
  scanning,
  error,
  onAddress,
  onCode,
  onScan,
  onScanned,
  onScanFailed,
  onCancelPhoneScan,
  onCloseError,
  onSubmit,
  cancel,
}: {
  hint?: string;
  address: string;
  code: string;
  canPair: boolean;
  joining: boolean;
  scanning: boolean;
  error: string | null;
  onAddress: (value: string) => void;
  onCode: (value: string) => void;
  onScan: () => void;
  onScanned: (text: string | null) => Promise<void>;
  onScanFailed: (e: unknown) => void;
  onCancelPhoneScan: () => void;
  onCloseError: () => void;
  onSubmit: (e: SubmitEvent) => void;
  cancel: ReactNode;
}) {
  return (
    <form className={cn('card', pairingStyles.card)} onSubmit={onSubmit}>
      <ol className={cn('t-small secondary', pairingStyles.steps)}>
        <li>{hint ?? syncCopy.pairing.stepShowCode}</li>
        <li>{syncCopy.pairing.stepScan}</li>
      </ol>
      <p className={cn('secondary', styles.note)}>{syncCopy.pairing.ownCodeOnly}</p>
      <button
        type="button"
        className={cn(outlineButton.base, outlineButton.accent)}
        disabled={joining}
        onClick={onScan}
      >
        Scan QR code
      </button>
      <p className="t-small secondary text-center">{syncCopy.pairing.orType}</p>
      <div className={cn(pairingStyles.pairRow)}>
        <label className={cn(styles.field)}>
          <span className="t-small secondary">Address</span>
          <input
            className={cn(textField, styles.input)}
            value={address}
            inputMode="decimal"
            placeholder="192.168.1.20"
            autoFocus={!isPhone()}
            readOnly={joining}
            // TODO: For event listeners like this one we need a function named something like handleAddressInput and place on the top.
            // Check the whole repo for cases like this one.
            onChange={(e) => onAddress(e.target.value)}
          />
        </label>
        <label className={cn(styles.field)}>
          <span className="t-small secondary">Code</span>
          <input
            className={cn(textField, styles.input)}
            value={code}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000-000-000"
            readOnly={joining}
            onChange={(e) => onCode(e.target.value)}
          />
        </label>
      </div>
      <div className="flex gap-2.5">
        {cancel}
        <button type="submit" className={cn(outlineButton.base, outlineButton.primary)} disabled={joining || !canPair}>
          {joining ? 'Connecting…' : 'Pair'}
        </button>
      </div>
      {/* Always there, with room for four lines (on a small phone), so an error coming or going doesn't move
          anything. A failed pairing is labelled, not only red, and leaves room on the right for the ×. */}
      <div className="relative min-h-20" role="alert">
        {error && (
          <>
            <p className="t-small pr-7 text-danger">
              <strong>{syncCopy.pairing.failedLead}</strong> {error}
            </p>
            <button
              type="button"
              className={cn('text-button secondary', styles.close)}
              aria-label="Close the error"
              onClick={onCloseError}
            >
              <Icon name="close" size={18} />
            </button>
          </>
        )}
      </div>
      {scanning &&
        (isPhone() ? (
          <ScanOverlay hint={syncCopy.pairing.phoneScanHint} onCancel={onCancelPhoneScan} />
        ) : (
          <CameraScan
            onFound={(text) => void onScanned(text)}
            onCancel={() => void onScanned(null)}
            onFail={onScanFailed}
          />
        ))}
    </form>
  );
}

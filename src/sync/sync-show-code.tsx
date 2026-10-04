import { useEffect, useState, type ReactNode } from 'react';

import { outlineButton } from '@/components/ui/controls.styles';
import { card } from '@/components/ui/surfaces.styles';
import { syncCopy } from '@/copy/sync';
import { cn } from '@/lib/cn';
import { pairingStyles } from '@/sync/pairing.styles';
import { groupCode, type Qr, type ShownCode } from '@/sync/sync';

const styles = {
  // White behind the QR code in dark mode too (see QrCode): scanners look for dark squares on a light ground.
  qr: 'h-auto w-[min(220px,70vw)] self-center rounded-lg',
  // Holds the QR code's place until it's ready.
  qrWaiting: 'aspect-square bg-background-selected',
  // The address and the code, in the code font. They can be selected, to copy them.
  value: 'font-mono text-[16px]/6 font-semibold select-text',
};

/**
 * The address, code and QR code, with the seconds left. Once the code can't be used any more (it ran out, or
 * someone tried it and it failed), says why and offers a new one.
 */
export function ShowCode({
  showing,
  onNewCode,
  cancel,
}: {
  showing: { shown: ShownCode | null; expiresAt: number; ended: string | null };
  onNewCode: () => void;
  cancel: ReactNode;
}) {
  const [now, setNow] = useState(Date.now);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);
  const { shown } = showing;
  const left = Math.max(0, Math.ceil((showing.expiresAt - now) / 1000));

  const ended = showing.ended ?? (shown != null && left === 0 ? syncCopy.showCode.ranOut : null);
  if (ended) {
    return (
      <div className={cn(card, pairingStyles.card)}>
        <p className="text-default" role="alert">
          {ended}
        </p>
        <p className="text-small text-text-secondary">{syncCopy.showCode.whyShort}</p>
        <div className="flex gap-2.5">
          {cancel}
          <button type="button" className={cn(outlineButton.base, outlineButton.primary)} onClick={onNewCode}>
            New code
          </button>
        </div>
      </div>
    );
  }
  const onCopy = async () => {
    if (!shown) {
      return;
    }
    try {
      await navigator.clipboard.writeText(shown.text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className={cn(card, pairingStyles.card)}>
      <ol className={cn('text-small text-text-secondary', pairingStyles.steps)}>
        <li>{syncCopy.showCode.stepEnterCode}</li>
        <li>{syncCopy.showCode.stepScan}</li>
      </ol>
      {/* Until the code is ready, an empty square holds its place, so nothing jumps when it comes. */}
      {shown ? (
        <QrCode qr={shown.qr} label={`QR code for the address ${shown.address} and its pairing code`} />
      ) : (
        <div className={cn(styles.qr, styles.qrWaiting)} aria-hidden />
      )}
      <div className={cn(pairingStyles.pairRow)}>
        <div>
          <p className="text-small text-text-secondary">Address</p>
          <p className={cn(styles.value)}>{shown?.address ?? '…'}</p>
        </div>
        <div>
          <p className="text-small text-text-secondary">Code</p>
          <p className={cn(styles.value)} aria-live="polite">
            {shown ? groupCode(shown.code) : '…'}
          </p>
        </div>
      </div>
      <p className="text-small text-text-secondary text-center">
        {shown ? syncCopy.showCode.timeLeft(left) : '\u00a0'}
      </p>
      <button
        type="button"
        className="py-1 text-small text-text-secondary self-center"
        disabled={!shown}
        onClick={onCopy}
      >
        {copied ? 'Copied' : 'Copy address and code'}
      </button>
      {cancel}
    </div>
  );
}

/** Dark squares on white, with the blank border scanners need, in light and dark mode alike. */
function QrCode({ qr, label }: { qr: Qr; label: string }) {
  const quiet = 4;
  const side = qr.size + quiet * 2;
  let path = '';
  for (let i = 0; i < qr.modules.length; i++) {
    if (qr.modules[i] === '1') {
      path += `M${(i % qr.size) + quiet} ${Math.floor(i / qr.size) + quiet}h1v1h-1z`;
    }
  }
  return (
    <svg
      className={cn(styles.qr)}
      viewBox={`0 0 ${side} ${side}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
    >
      <rect width={side} height={side} fill="#fff" />
      <path d={path} fill="#000" />
    </svg>
  );
}

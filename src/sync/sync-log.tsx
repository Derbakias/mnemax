import { useState } from 'react';

import { cn } from '@/lib/cn';
import type { LogLine } from '@/sync/sync-messages';

const styles = {
  // Every step of the latest attempt, to find out why one failed: small code-font lines on the card grey,
  // scrolling past 260px. Long words break anywhere, and the text can be selected to copy it.
  lines: [
    'm-0 max-h-[260px] list-none overflow-y-auto rounded-xl bg-background-element px-3 py-2.5',
    'font-mono text-[12px]/[18px] wrap-anywhere select-text',
  ],
};

/** The steps of the latest pairing or sync, hidden until asked for, with a way to copy them. */
export function SyncLog({ start, lines, deviceName }: { start: number; lines: LogLine[]; deviceName?: string }) {
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);
  const text = () =>
    [
      `Mnemax v${__APP_VERSION__} sync log from ${deviceName ?? 'this device'}, ${new Date(start).toISOString()}`,
      `(${navigator.userAgent})`,
      ...lines.map((l) => `${elapsed(l.at - start)}  ${l.text}`),
    ].join('\n');
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="flex flex-col gap-1">
      <div className="row-between">
        <button
          type="button"
          className="text-button text-small text-text-secondary"
          onClick={() => setShown((s) => !s)}
        >
          {shown ? 'Hide sync logs' : lines.length > 0 ? `Sync logs (${lines.length})` : 'Sync logs'}
        </button>
        {shown && (
          <button type="button" className="text-button text-small text-text-secondary" onClick={onCopy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
      {shown && (
        <ol className={cn(styles.lines)}>
          {lines.map((l, i) => (
            <li key={i}>
              <span className="text-text-secondary">{elapsed(l.at - start)}</span> {l.text}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/** `+1.25 s` */
function elapsed(ms: number): string {
  return `+${(ms / 1000).toFixed(2)} s`;
}

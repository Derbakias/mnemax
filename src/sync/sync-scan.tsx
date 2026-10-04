import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { outlineButton } from '@/components/ui/controls.styles';
import { syncCopy } from '@/copy/sync';
import { LOOK_EVERY_MS, LOOK_WIDTH } from '@/config/sync';
import { cn } from '@/lib/cn';

// White over the camera picture, in light and dark mode alike.
const styles = {
  // Over the whole screen, clear of the phone's notch and home bar.
  overlay: [
    'fixed inset-0 z-100 flex flex-col items-center justify-center gap-7 text-light',
    'px-6 pt-[calc(var(--safe-top)+24px)] pb-[calc(var(--safe-bottom)+24px)]',
  ],
  hint: 'max-w-[280px] text-center font-semibold [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]',
  // The square to aim with; everything around it is dimmed.
  frame: [
    'aspect-square w-[min(260px,70vw)] rounded-[20px] border-3 border-light',
    'shadow-[0_0_0_100vmax_rgba(0,0,0,0.45)]',
  ],
  cancel: 'flex-none border-light bg-[rgba(0,0,0,0.35)] px-8 py-2.5 text-light',
  // The camera picture behind it all, mirrored like a mirror: moving the code left moves it left on screen.
  video: 'absolute inset-0 -z-1 size-full bg-[#000] object-cover transform-[scaleX(-1)]',
};

/**
 * While the camera looks for the QR code: a frame to aim with and Cancel. On a phone the camera shows behind the
 * page, so the page hides everything else; on a computer `children` is the camera picture.
 */
export function ScanOverlay({
  hint,
  onCancel,
  children,
}: {
  hint: string;
  onCancel: () => void;
  children?: ReactNode;
}) {
  // Clears the page's background and hides the app while it's open (see `html.scanning` in index.css).
  useEffect(() => {
    document.documentElement.classList.add('scanning');
    return () => document.documentElement.classList.remove('scanning');
  }, []);
  return createPortal(
    <div className={cn(styles.overlay)}>
      {children}
      <p className={cn(styles.hint)}>{hint}</p>
      <div className={cn(styles.frame)} aria-hidden />
      <button type="button" className={cn(outlineButton.base, styles.cancel)} onClick={onCancel}>
        Cancel
      </button>
    </div>,
    document.body,
  );
}

/**
 * Scanning on a computer: the page opens the camera itself and looks for a QR code in its picture, until it
 * finds one (`onFound`), Cancel is pressed, or the camera can't be opened (`onFail`). The camera turns off when
 * this closes.
 */
export function CameraScan({
  onFound,
  onCancel,
  onFail,
}: {
  onFound: (text: string) => void;
  onCancel: () => void;
  onFail: (error: unknown) => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const handlers = useRef({ onFound, onFail });
  handlers.current = { onFound, onFail };

  useEffect(() => {
    let closed = false;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | undefined;
    const close = () => {
      closed = true;
      clearInterval(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };

    void (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(syncCopy.camera.cantOpen);
        }
        // The QR reader first: if it can't load, the camera is never turned on.
        const { default: jsQR } = await import('jsqr');
        if (closed) {
          return;
        }
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        const view = video.current;
        if (closed || !view) {
          return close();
        }
        view.srcObject = stream;
        await view.play();

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) {
          throw new Error(syncCopy.camera.cantRead);
        }
        timer = setInterval(() => {
          if (closed || view.readyState < view.HAVE_CURRENT_DATA || view.videoWidth === 0) {
            return;
          }
          const scale = Math.min(1, LOOK_WIDTH / view.videoWidth);
          canvas.width = Math.round(view.videoWidth * scale);
          canvas.height = Math.round(view.videoHeight * scale);
          context.drawImage(view, 0, 0, canvas.width, canvas.height);
          const picture = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(picture.data, picture.width, picture.height, { inversionAttempts: 'dontInvert' });
          if (code?.data) {
            close();
            handlers.current.onFound(code.data);
          }
        }, LOOK_EVERY_MS);
      } catch (error) {
        if (closed) {
          return;
        }
        close();
        handlers.current.onFail(cameraError(error));
      }
    })();
    return close;
  }, []);

  return (
    <ScanOverlay hint={syncCopy.pairing.cameraScanHint} onCancel={onCancel}>
      <video ref={video} className={cn(styles.video)} muted playsInline />
    </ScanOverlay>
  );
}

/** Why the camera didn't open, in words the person can act on. */
function cameraError(error: unknown): unknown {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError') {
    return new Error(syncCopy.camera.notAllowed);
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return new Error(syncCopy.camera.notFound);
  }
  if (name === 'NotReadableError') {
    return new Error(syncCopy.camera.busy);
  }
  return error;
}

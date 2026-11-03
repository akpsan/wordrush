/**
 * A bottom sheet (a centred dialog on desktop) with a scrim. Accessible modal behaviour:
 * focus moves in on open, Tab stays inside, Escape or a tap on the scrim closes, and focus
 * returns to where it was.
 */

import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';

export interface SheetProps {
  readonly title: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}

const FOCUSABLE = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function Sheet({ title, onClose, children }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    return () => previous?.focus();
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !ref.current) return;
    const items = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (!items.length) return;
    const first = items[0]!;
    const last = items[items.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <div className="scrim" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className="sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={onKeyDown}>
        <span className="grab" aria-hidden="true" />
        <span className="stitle" id={titleId}>
          {title}
        </span>
        {children}
      </div>
    </>
  );
}

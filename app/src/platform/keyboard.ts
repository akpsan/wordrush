/**
 * Physical keyboard input on desktop. Maps keys to game commands; the game decides what they do.
 * Ignored while a dialog is open, while focus is in a text field, or when `enabled` is false.
 */

import { useEffect, useRef } from 'react';

export type KeyCommand =
  | { readonly kind: 'letter'; readonly letter: string }
  | { readonly kind: 'delete' }
  | { readonly kind: 'play' }
  | { readonly kind: 'flip' }
  | { readonly kind: 'escape' };

export function toCommand(e: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey'>): KeyCommand | null {
  if (e.ctrlKey || e.metaKey || e.altKey) return null; // leave browser shortcuts alone
  if (/^[a-zA-Z]$/.test(e.key)) return { kind: 'letter', letter: e.key.toLowerCase() };
  switch (e.key) {
    case 'Backspace':
      return { kind: 'delete' };
    case 'Enter':
      return { kind: 'play' };
    case ' ':
    case 'ArrowRight':
    case 'ArrowDown':
      return { kind: 'flip' };
    case 'Escape':
      return { kind: 'escape' };
    default:
      return null;
  }
}

function isTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function useKeyboardCommands(onCommand: (c: KeyCommand) => void, enabled: boolean): void {
  const handler = useRef(onCommand);
  handler.current = onCommand;
  useEffect(() => {
    if (!enabled) return;
    const listener = (e: KeyboardEvent) => {
      if (e.repeat && e.key !== 'Backspace') return; // held keys: only delete repeats
      if (isTextField(e.target) || document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      // Enter on a focused button activates that button; let it.
      if (e.key === 'Enter' && e.target instanceof HTMLButtonElement) return;
      if (e.key === ' ' && e.target instanceof HTMLButtonElement) return;
      const command = toCommand(e);
      if (!command) return;
      e.preventDefault();
      handler.current(command);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [enabled]);
}

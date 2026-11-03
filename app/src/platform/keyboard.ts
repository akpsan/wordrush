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

/*
 * How each element got focus. Enter and Space press a focused button only if the player
 * moved focus there with the keyboard (Tab). A button that merely kept focus after a mouse
 * or touch click (or got it back when a sheet closed) doesn't own them: they go to the game,
 * so Enter still plays the word. This is how media players like YouTube behave.
 *
 * The browser's :focus-visible can't be used for this: Chrome switches it on as soon as any
 * key is pressed, so by the time Enter arrives a clicked button already looks keyboard-focused.
 */
type Source = 'pointer' | 'keyboard';
let lastInput: Source = 'keyboard';
const focusSource = new WeakMap<Element, Source>();
let tracking = false;

function trackFocusSource(): void {
  if (tracking) return;
  tracking = true;
  window.addEventListener('pointerdown', () => (lastInput = 'pointer'), true);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' || e.key.startsWith('Arrow')) lastInput = 'keyboard';
  }, true);
  window.addEventListener('focusin', (e) => {
    if (e.target instanceof Element) focusSource.set(e.target, lastInput);
  }, true);
}

function ownsActivationKeys(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    target.matches('button, [role="button"]') &&
    focusSource.get(target) === 'keyboard'
  );
}

function isTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function useKeyboardCommands(onCommand: (c: KeyCommand) => void, enabled: boolean): void {
  const handler = useRef(onCommand);
  handler.current = onCommand;
  useEffect(trackFocusSource, []);
  useEffect(() => {
    if (!enabled) return;
    const listener = (e: KeyboardEvent) => {
      if (e.repeat && e.key !== 'Backspace') return; // held keys: only delete repeats
      if (isTextField(e.target) || document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      if ((e.key === 'Enter' || e.key === ' ') && ownsActivationKeys(e.target)) return;
      const command = toCommand(e);
      if (!command) return;
      e.preventDefault();
      handler.current(command);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [enabled]);
}

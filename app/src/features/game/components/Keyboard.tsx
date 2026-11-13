import type { MouseEvent } from 'react';
import { plain } from '../../../copy';
import { Icon } from '../../../ui/Icon';
import '../styles/entry.css';

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'] as const;

export interface KeyboardProps {
  readonly enabled: boolean;
  /** The player's letters, marked on their keys (a hint, never an answer). */
  readonly highlight: ReadonlySet<string>;
  readonly onLetter: (letter: string) => void;
  readonly onDelete: () => void;
  /** Optional emphasis per key ('delete' for the delete key). The tutorial uses it to spotlight keys. */
  readonly emphasis?: (key: string) => 'next' | 'dim' | undefined;
  /**
   * A Play key at the start of the bottom row (the game; the tutorial keeps its own buttons). It stays
   * tappable when not ready (aria-disabled), so tapping it explains why.
   */
  readonly play?: { readonly ready: boolean; readonly losing: boolean; readonly label: string; readonly onPlay: () => void };
}

/**
 * Keys don't take focus on mouse or touch, so Enter on a physical keyboard always means Play.
 * When inactive (the AI's turn), keys are aria-disabled rather than disabled, so focus stays put.
 */
const keepFocus = (e: MouseEvent) => e.preventDefault();

export function Keyboard({ enabled, highlight, onLetter, onDelete, emphasis, play }: KeyboardProps) {
  const extra = (key: string) => {
    const e = emphasis?.(key);
    return e ? ` ${e}` : '';
  };
  return (
    <div className={enabled ? 'kb' : 'kb off'} role="group" aria-label={plain('keyboard.aria')}>
      {ROWS.map((row, r) => (
        <div key={row} className={r === 1 ? 'krow mid' : 'krow'}>
          {r === 2 && play && (
            <button
              type="button"
              className={play.ready ? (play.losing ? 'key play ready losing' : 'key play ready') : 'key play'}
              aria-label={play.label}
              aria-disabled={!enabled || !play.ready}
              onMouseDown={keepFocus}
              onClick={() => enabled && play.onPlay()}
            >
              {plain('btn.play')}
            </button>
          )}
          {[...row].map((letter) => {
            const mine = highlight.has(letter);
            return (
              <button
                key={letter}
                type="button"
                className={(mine ? 'key anc' : 'key') + extra(letter)}
                aria-label={mine ? plain('key.letter.aria', { L: letter.toUpperCase() }) : letter.toUpperCase()}
                aria-disabled={!enabled}
                onMouseDown={keepFocus}
                onClick={() => enabled && onLetter(letter)}
              >
                {letter.toUpperCase()}
              </button>
            );
          })}
          {r === 2 && (
            <button
              type="button"
              className={'key wide' + extra('delete')}
              aria-label={plain('key.delete.aria')}
              aria-disabled={!enabled}
              onMouseDown={keepFocus}
              onClick={() => enabled && onDelete()}
            >
              <Icon name="backspace" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

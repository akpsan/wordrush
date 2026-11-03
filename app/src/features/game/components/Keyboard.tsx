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
}

/** Keys don't take focus on mouse or touch, so Enter on a physical keyboard always means Play. */
const keepFocus = (e: MouseEvent) => e.preventDefault();

export function Keyboard({ enabled, highlight, onLetter, onDelete, emphasis }: KeyboardProps) {
  const extra = (key: string) => {
    const e = emphasis?.(key);
    return e ? ` ${e}` : '';
  };
  return (
    <div className={enabled ? 'kb' : 'kb off'} role="group" aria-label={plain('keyboard.aria')}>
      {ROWS.map((row, r) => (
        <div key={row} className={r === 1 ? 'krow mid' : 'krow'}>
          {[...row].map((letter) => {
            const mine = highlight.has(letter);
            return (
              <button
                key={letter}
                type="button"
                className={(mine ? 'key anc' : 'key') + extra(letter)}
                aria-label={mine ? plain('key.letter.aria', { L: letter.toUpperCase() }) : letter.toUpperCase()}
                disabled={!enabled}
                onMouseDown={keepFocus}
                onClick={() => onLetter(letter)}
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
              disabled={!enabled}
              onMouseDown={keepFocus}
              onClick={onDelete}
            >
              <Icon name="backspace" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

import { plain, t } from '../../../copy';
import { Icon } from '../../../ui/Icon';
import '../styles/entry.css';
import { RichText } from '../../../ui/RichText';
import type { EntryView } from '../model/entry';

export interface ActionsProps {
  readonly entry: EntryView;
  readonly enabled: boolean;
  readonly onFlip: () => void;
  readonly onPlay: () => void;
  /** Hints left for the player to move, or null when hints are off for this game. */
  readonly hintsLeft: number | null;
  readonly onHint: () => void;
}

export function Actions({ entry, enabled, onFlip, onPlay, hintsLeft, onHint }: ActionsProps) {
  const n = entry.spots.length;
  const i = entry.index + 1;
  const word = entry.typed.toUpperCase();
  return (
    <div className="actions">
      {hintsLeft !== null && (
        <button
          type="button"
          className="btn sec icon"
          onClick={onHint}
          disabled={!enabled || hintsLeft === 0}
          aria-label={hintsLeft === 0 ? plain('hint.none.aria') : plain('hint.button.aria', { n: hintsLeft })}
        >
          <Icon name="bulb" />
        </button>
      )}
      <button
        type="button"
        className="btn sec"
        onClick={onFlip}
        disabled={!enabled || n < 2}
        aria-label={plain('btn.flip.aria', { i, n })}
      >
        <Icon name="flip" />
        <span>{t('btn.flip')}</span>
        <span className="cnt">{n ? t('btn.flip.count', { i, n }) : '–'}</span>
      </button>
      {/* Stays tappable when not ready (aria-disabled), so tapping it explains why. */}
      <button
        type="button"
        className={entry.ready ? 'btn pri' : 'btn pri soft'}
        onClick={onPlay}
        disabled={!enabled}
        aria-disabled={!entry.ready}
      >
        <span>{entry.ready ? t('btn.play.ready', { WORD: word }) : t('btn.play')}</span>
        <span className="kbd">Enter</span>
      </button>
    </div>
  );
}

export function KeyHelp() {
  return (
    <p className="khelp">
      <RichText text={t('desk.keys')} renderBold={(part, key) => <span key={key} className="kbd">{part}</span>} />
    </p>
  );
}

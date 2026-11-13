import { plain } from '../../../copy';
import { Icon } from '../../../ui/Icon';
import { Logo } from '../../../ui/Logo';
import '../styles/status.css';

export interface HeaderProps {
  readonly onMenu: () => void;
  readonly onGiveUp: () => void;
  readonly canGiveUp: boolean;
  /** Opens Learn to play. Omitted until that feature is available. */
  readonly onHelp?: () => void;
  /** Hints left for the player to move, or null when hints are off: a bulb button when on. */
  readonly hintsLeft?: number | null;
  readonly onHint?: () => void;
}

export function Header({ onMenu, onGiveUp, canGiveUp, onHelp, hintsLeft = null, onHint }: HeaderProps) {
  return (
    <header className="hdr game">
      <Logo />
      <div className="hbtns">
        {hintsLeft !== null && onHint && (
          <button
            type="button"
            className="ibtn hintbtn"
            onClick={onHint}
            disabled={hintsLeft === 0 || !canGiveUp}
            aria-label={hintsLeft === 0 ? plain('hint.none.aria') : plain('hint.button.aria', { n: hintsLeft })}
          >
            <Icon name="bulb" />
            {hintsLeft > 0 && <span className="hcount">{hintsLeft}</span>}
          </button>
        )}
        <button type="button" className="ibtn" aria-label={plain('game.giveup.aria')} onClick={onGiveUp} disabled={!canGiveUp}>
          <Icon name="flag" />
        </button>
        {onHelp && (
          <button type="button" className="ibtn" aria-label={plain('game.help.aria')} onClick={onHelp}>
            <Icon name="help" />
          </button>
        )}
        <button type="button" className="ibtn" aria-label={plain('game.menu.aria')} onClick={onMenu}>
          <Icon name="menu" />
        </button>
      </div>
    </header>
  );
}

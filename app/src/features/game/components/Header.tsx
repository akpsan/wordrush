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
}

export function Header({ onMenu, onGiveUp, canGiveUp, onHelp }: HeaderProps) {
  return (
    <header className="hdr">
      <button type="button" className="ibtn" aria-label={plain('game.menu.aria')} onClick={onMenu}>
        <Icon name="menu" />
      </button>
      <Logo />
      <div className="hbtns">
        <button type="button" className="ibtn" aria-label={plain('game.giveup.aria')} onClick={onGiveUp} disabled={!canGiveUp}>
          <Icon name="flag" />
        </button>
        {onHelp && (
          <button type="button" className="ibtn" aria-label={plain('game.help.aria')} onClick={onHelp}>
            <Icon name="help" />
          </button>
        )}
      </div>
    </header>
  );
}

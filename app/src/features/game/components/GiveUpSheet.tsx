import { playerName, t } from '../../../copy';
import type { Player } from '../../../engine';
import { Icon } from '../../../ui/Icon';
import { RichText } from '../../../ui/RichText';
import { Sheet } from '../../../ui/Sheet';

export interface GiveUpSheetProps {
  readonly player: Player;
  readonly onKeepPlaying: () => void;
  readonly onGiveUp: () => void;
  /** Hints left, when hints are on and some are left: offer one before giving up. */
  readonly hintsLeft: number | null;
  readonly onHint: () => void;
}

export function GiveUpSheet({ player, onKeepPlaying, onGiveUp, hintsLeft, onHint }: GiveUpSheetProps) {
  const opponent = playerName(player === 0 ? 1 : 0);
  return (
    <Sheet title={t('giveup.title')} onClose={onKeepPlaying}>
      <p className="stext">
        <RichText text={t('giveup.body', { opponent })} />
      </p>
      {hintsLeft !== null && hintsLeft > 0 && (
        <div className="optcard">
          <Icon name="bulb" />
          <div className="ot">
            <b>{t('giveup.hint.title')}</b>
            <span>{t('giveup.hint.body', { n: hintsLeft })}</span>
          </div>
          <button type="button" className="btn pri sm" onClick={onHint}>
            {t('giveup.hint.button')}
          </button>
        </div>
      )}
      <div className="orow">
        <button type="button" className="btn sec" onClick={onKeepPlaying}>
          {t('giveup.keep')}
        </button>
        <button type="button" className="btn danger" onClick={onGiveUp}>
          <Icon name="flag" />
          {t('giveup.confirm')}
        </button>
      </div>
    </Sheet>
  );
}

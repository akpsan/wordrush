import { t } from '../../../copy';
import { Icon } from '../../../ui/Icon';
import { RichText } from '../../../ui/RichText';
import { Sheet } from '../../../ui/Sheet';

export interface GiveUpSheetProps {
  /** Who wins if you give up: Blue, Orange or the AI's name. */
  readonly opponent: string;
  readonly onKeepPlaying: () => void;
  readonly onGiveUp: () => void;
  /** Hints left, when hints are on and some are left: offer one before giving up. */
  readonly hintsLeft: number | null;
  readonly onHint: () => void;
}

export function GiveUpSheet({ opponent, onKeepPlaying, onGiveUp, hintsLeft, onHint }: GiveUpSheetProps) {
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

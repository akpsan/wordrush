import { playerName, t } from '../../../copy';
import type { Player } from '../../../engine';
import { Icon } from '../../../ui/Icon';
import { RichText } from '../../../ui/RichText';
import { Sheet } from '../../../ui/Sheet';

export interface GiveUpSheetProps {
  readonly player: Player;
  readonly onKeepPlaying: () => void;
  readonly onGiveUp: () => void;
}

export function GiveUpSheet({ player, onKeepPlaying, onGiveUp }: GiveUpSheetProps) {
  const opponent = playerName(player === 0 ? 1 : 0);
  return (
    <Sheet title={t('giveup.title')} onClose={onKeepPlaying}>
      <p className="stext">
        <RichText text={t('giveup.body', { opponent })} />
      </p>
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

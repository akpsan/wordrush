import { plain, t } from '../../../copy';
import { Icon } from '../../../ui/Icon';
import type { PlayerStatus, TurnStatus } from '../model/status';
import '../styles/status.css';

/** A player's shape (circle for Blue, square for Orange); the AI's has its face inside. */
export function PlayerPip({ player, ai, size }: { player: 0 | 1; ai?: PlayerStatus['ai']; size?: number }) {
  const side = player === 0 ? 'a' : 'b';
  const style = size ? { width: size, height: size } : undefined;
  return <span className={ai ? `pip ${side} bot ${ai.level}` : `pip ${side}`} style={style} aria-hidden="true" />;
}

function PlayerCard({ p, thinking }: { p: PlayerStatus; thinking: boolean }) {
  const side = p.player === 0 ? 'a' : 'b';
  const classes = ['pl', side, p.active && 'on', p.alarm && 'alarm', p.ai && 'cpu', p.ai && thinking && 'thinking']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes}>
      <div className="ptop">
        <PlayerPip player={p.player} ai={p.ai} />
        <span className="pname">{p.name}</span>
        {p.you && <span className="you">{t('player.you')}</span>}
        {p.ai && (
          <span className="you lvl" aria-hidden="true">
            {t('cpu.card.level', { level: p.ai.levelName })}
          </span>
        )}
      </div>
      <div
        className={`room ${p.level}`}
        role="meter"
        aria-label={p.aria}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={p.segments}
        aria-valuetext={p.label}
      >
        <span className="segs">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} className={i < p.segments ? 'on' : ''} />
          ))}
        </span>
        {p.warn && <Icon name="warn" />}
      </div>
      <div className="pfoot">
        <span className="rlbl">{p.label}</span>
        <span className="pcells">{t('squares.count', { n: p.squares })}</span>
      </div>
      {p.delta && (
        <span key={p.delta + p.squares} className={p.player === 0 ? 'delta' : 'delta db'} aria-hidden="true">
          {p.delta}
        </span>
      )}
    </div>
  );
}

export interface StatusBarProps {
  readonly players: readonly [PlayerStatus, PlayerStatus];
  readonly turn: TurnStatus;
  /** The AI is thinking: its card's eyes blink. */
  readonly thinking?: boolean;
}

export function StatusBar({ players, turn, thinking = false }: StatusBarProps) {
  const arrow = ['tarr', turn.toward === 1 && 'r', turn.toward === null && 'none'].filter(Boolean).join(' ');
  return (
    <section className="side" aria-label={plain('status.aria')}>
      <div className="score">
        <PlayerCard p={players[0]} thinking={thinking} />
        <div className="turn" aria-label={turn.aria} role="status">
          <span className="tlbl">{turn.label}</span>
          <span className="tnum">{turn.value}</span>
          <span className={arrow} aria-hidden="true">
            <Icon name="chevron" />
          </span>
        </div>
        <PlayerCard p={players[1]} thinking={thinking} />
      </div>
    </section>
  );
}

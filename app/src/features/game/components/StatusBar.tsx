import { plain, t } from '../../../copy';
import { Icon } from '../../../ui/Icon';
import type { PlayerStatus, TurnStatus } from '../model/status';
import '../styles/status.css';

function PlayerCard({ p }: { p: PlayerStatus }) {
  const side = p.player === 0 ? 'a' : 'b';
  const classes = ['pl', side, p.active && 'on', p.alarm && 'alarm'].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      <div className="ptop">
        <span className={`pip ${side}`} aria-hidden="true" />
        <span className="pname">{p.name}</span>
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

export function StatusBar({ players, turn }: { players: readonly [PlayerStatus, PlayerStatus]; turn: TurnStatus }) {
  const arrow = ['tarr', turn.toward === 1 && 'r', turn.toward === null && 'none'].filter(Boolean).join(' ');
  return (
    <section className="side" aria-label={plain('status.aria')}>
      <div className="score">
        <PlayerCard p={players[0]} />
        <div className="turn" aria-label={turn.aria} role="status">
          <span className="tlbl">{turn.label}</span>
          <span className="tnum">{turn.value}</span>
          <span className={arrow} aria-hidden="true">
            <Icon name="chevron" />
          </span>
        </div>
        <PlayerCard p={players[1]} />
      </div>
    </section>
  );
}

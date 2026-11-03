import { Fragment } from 'react';
import { playerName, t } from '../../../copy';
import { otherPlayer, squares, type GameState, type Player } from '../../../engine';
import { Icon } from '../../../ui/Icon';
import { RichText } from '../../../ui/RichText';

/** The moment a player is boxed in, before the results. */
export function BoxedInPanel({ game, onContinue }: { game: GameState; onContinue: () => void }) {
  const result = game.result!;
  const word = result.boxedWord !== undefined ? game.words[result.boxedWord]!.word.toUpperCase() : '';
  return (
    <div className="panel alert" role="alert">
      <div className="ph">
        <Icon name="lock" />
        <span>{t('boxed.title')}</span>
      </div>
      <p>
        <RichText text={t('boxed.body', { WORD: word })} />
      </p>
      <div className="prow">
        <div className="keyrow">
          <span className="lk">
            <i className="kw" />
            {t('boxed.key.inway')}
          </span>
          <span className="lk">
            <i className="kg" />
            {t('boxed.key.toosmall')}
          </span>
        </div>
        {/* The screen's accent is the winner's colour once the game is over. */}
        <button type="button" className="btn pri sm" onClick={onContinue}>
          {t('boxed.continue')}
        </button>
      </div>
    </div>
  );
}

function headline(game: GameState): { title: string; sub: string; score: string } {
  const result = game.result!;
  const winner = playerName(result.winner);
  const loser = playerName(otherPlayer(result.winner));
  const sa = squares(game, 0);
  const sb = squares(game, 1);
  switch (result.reason) {
    case 'boxed-in': {
      const word = result.boxedWord !== undefined ? game.words[result.boxedWord]!.word.toUpperCase() : '';
      return {
        title: t('over.boxed.title', { winner, loser }),
        sub: t('over.boxed.sub', { WORD: word, n: game.turn }),
        score: '',
      };
    }
    case 'gave-up':
      return { title: t('over.gaveup.title.pp', { loser }), sub: t('over.gaveup.sub.pp', { winner }), score: '' };
    case 'full-board':
      return sa === sb
        ? { title: t('over.full.title'), sub: t('over.full.sub'), score: `${sa} – ${sb}` }
        : { title: t('over.full.win.title', { player: winner }), sub: '', score: `${sa} – ${sb}` };
  }
}

/** Results: who won, a few stats, and a rematch. */
export function GameOverPanel({ game, onPlayAgain }: { game: GameState; onPlayAgain: () => void }) {
  const { title, sub, score } = headline(game);
  const winner = game.result!.winner;
  const words = (p: Player) => game.words.filter((w) => w.player === p).length;
  const rows: [string, number, number][] = [
    [t('over.stats.words'), words(0), words(1)],
    [t('over.stats.squares'), squares(game, 0), squares(game, 1)],
  ];
  if (game.result!.reason === 'full-board') rows.reverse();
  return (
    <div className="panel">
      <div className="ohead">
        <div className="otext">
          <span className={winner === 0 ? 'otitle a' : 'otitle b'}>{title}</span>
          {sub && <span className="osub">{sub}</span>}
        </div>
        {score && <span className="oscore">{score}</span>}
      </div>
      <div className="stats">
        <span />
        <span className="h">
          <span className="mini a" aria-hidden="true" />
          {playerName(0)}
        </span>
        <span className="h">
          <span className="mini b" aria-hidden="true" />
          {playerName(1)}
        </span>
        {rows.map(([label, a, b]) => (
          <Fragment key={label}>
            <span>{label}</span>
            <span className="v">{a}</span>
            <span className="v">{b}</span>
          </Fragment>
        ))}
      </div>
      <div className="orow">
        <button type="button" className="btn pri" onClick={onPlayAgain}>
          <Icon name="flip" />
          {t('over.again')}
        </button>
      </div>
    </div>
  );
}

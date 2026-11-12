import { Fragment, useEffect, useState } from 'react';
import { playerName, t } from '../../../copy';
import { otherPlayer, squares, type GameState, type Player } from '../../../engine';
import { aiParams, type AiMatch, type Match } from '../model/match';
import { Icon } from '../../../ui/Icon';
import { RichText } from '../../../ui/RichText';
import { shareText, type ShareOutcome } from '../../../platform/share';
import '../styles/panels.css';

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

function headline(game: GameState, match: Match): { title: string; sub: string; score: string } {
  if (match.mode === 'ai') return aiHeadline(game, match);
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

/** The vs-AI results, told to the person ("You boxed Rex in!"). */
function aiHeadline(game: GameState, match: AiMatch): { title: string; sub: string; score: string } {
  const result = game.result!;
  const params = aiParams(match);
  const won = result.winner === match.human;
  const sa = squares(game, 0);
  const sb = squares(game, 1);
  switch (result.reason) {
    case 'boxed-in': {
      const WORD = result.boxedWord !== undefined ? game.words[result.boxedWord]!.word.toUpperCase() : '';
      const n = game.turn;
      return won
        ? { title: t('cpu.over.won.title', params), sub: t('cpu.over.won.sub', { WORD, n }), score: '' }
        : { title: t('cpu.over.lost.title', params), sub: t('cpu.over.lost.sub', { WORD, n }), score: '' };
    }
    case 'gave-up':
      return { title: t('cpu.over.gaveup.title'), sub: t('cpu.over.gaveup.sub', params), score: '' };
    case 'full-board':
      return { title: won ? t('cpu.over.full.won') : t('cpu.over.full.lost', params), sub: '', score: `${sa} – ${sb}` };
  }
}

/** Results: who won, a few stats, and a rematch. */
export interface GameOverPanelProps {
  readonly game: GameState;
  /** Hints used by each player, when hints were on for this game. */
  readonly hintsUsed: readonly [number, number] | null;
  readonly match: Match;
  /** Play again (pass and play) or Rematch (vs AI). */
  readonly onPlayAgain: () => void;
  /** Vs AI: the person's wins against this opponent, including this game. */
  readonly aiWins?: number;
  /** Vs AI: open the setup sheet. */
  readonly onChangeOpponent?: () => void;
  /** Vs AI: back to the menu. */
  readonly onMenu?: () => void;
}


export function GameOverPanel({ game, hintsUsed, match, onPlayAgain, aiWins, onChangeOpponent, onMenu }: GameOverPanelProps) {
  const { title, sub, score } = headline(game, match);
  const winner = game.result!.winner;
  const words = (p: Player) => game.words.filter((w) => w.player === p).length;
  const rows: [string, number, number][] = [
    [t('over.stats.words'), words(0), words(1)],
    [t('over.stats.squares'), squares(game, 0), squares(game, 1)],
  ];
  if (game.result!.reason === 'full-board') rows.reverse();
  if (hintsUsed) rows.push([t('over.stats.hints'), hintsUsed[0], hintsUsed[1]]);
  return (
    <div className="panel">
      <div className="ohead">
        <div className="otext" role="status">
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
      {match.mode === 'ai' ? (
        <>
          {aiWins !== undefined && (
            <p className="reclabel">
              <Icon name="trophy" />
              <span>{aiWins > 0 ? t('cpu.record', { ...aiParams(match), n: aiWins }) : t('cpu.record.none', aiParams(match))}</span>
            </p>
          )}
          <div className="orow">
            <button type="button" className="btn sec" onClick={onChangeOpponent}>
              {t('cpu.over.change')}
            </button>
            <button type="button" className="btn pri" onClick={onPlayAgain}>
              <Icon name="flip" />
              {t('cpu.over.rematch')}
            </button>
          </div>
        </>
      ) : (
        <div className="orow">
          <button type="button" className="btn pri" onClick={onPlayAgain}>
            <Icon name="flip" />
            {t('over.again')}
          </button>
        </div>
      )}
      <EndLinks title={title} onMenu={onMenu} />
    </div>
  );
}

/** Share the result, and go back to the menu. */
function EndLinks({ title, onMenu }: { title: string; onMenu?: () => void }) {
  const [outcome, setOutcome] = useState<ShareOutcome | null>(null);
  useEffect(() => {
    if (outcome !== 'copied' && outcome !== 'failed') return;
    const id = setTimeout(() => setOutcome(null), 2000);
    return () => clearTimeout(id);
  }, [outcome]);
  const share = async () => {
    const text = t('over.share.text', { title: title.replace(/\*\*/g, '') });
    setOutcome(await shareText(text, location.origin));
  };
  const label = outcome === 'copied' ? t('over.share.copied') : outcome === 'failed' ? t('over.share.failed') : t('over.share');
  return (
    <div className="olinks">
      <button type="button" className="linkbtn" onClick={share} aria-live="polite">
        {label}
      </button>
      {onMenu && (
        <button type="button" className="linkbtn" onClick={onMenu}>
          {t('cpu.over.menu')}
        </button>
      )}
    </div>
  );
}

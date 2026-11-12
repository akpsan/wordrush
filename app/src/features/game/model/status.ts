/** The status bar: each player's words to play (1, 2 or 3+), squares and turn. */

import { aiLevelName, plain, t } from '../../../copy';
import type { Level } from '../../../ai';
import {
  legalMoves,
  moveContext,
  squares,
  waysOut,
  type GameState,
  type Lexicon,
  type Player,
} from '../../../engine';
import { humanOf, isAi, nameOf } from './match';
import type { Session } from './session';

export type RoomLevel = 'unknown' | 'cornered' | 'danger' | 'tight' | 'open';

export interface PlayerStatus {
  readonly player: Player;
  readonly name: string;
  /** The person's card in a vs-AI game ("You" tag). */
  readonly you: boolean;
  /** The AI's difficulty, on the AI's card. */
  readonly ai: { readonly level: Level; readonly levelName: string } | null;
  readonly active: boolean;
  /** Words to play, 0 to 3 (3 = "3+"). Null when not measured: before the first word, or for the winner once the game is over. */
  readonly ways: number | null;
  readonly level: RoomLevel;
  readonly label: string;
  readonly aria: string;
  /** Filled meter segments, 0 to 4. */
  readonly segments: number;
  readonly warn: boolean;
  readonly alarm: boolean;
  readonly squares: number;
  /** "+n" floating up after this player's last play. */
  readonly delta: string | null;
}

/** The distinct letters of a player's last word, in order. */
export function letterChoices(game: GameState, player: Player): string[] {
  const last = game.lastWord[player];
  if (last === null) return [];
  return [...new Set(game.words[last]!.word.split(''))];
}

export function waysOutFor(game: GameState, lex: Lexicon, player: Player): number {
  return waysOut(moveContext(game, player), lex);
}

/** Words a player could play now, counted up to 3 (3 means "3+"). 0 = boxed in. */
export function wordsFor(game: GameState, lex: Lexicon, player: Player): number {
  return Math.min(legalMoves(game, lex, player).length, 3);
}

function measuredWays(game: GameState, lex: Lexicon, player: Player): number | null {
  const { result } = game;
  if (!result) {
    // Before a player's first word, only the player about to start has anything to measure.
    const started = game.lastWord[player] !== null;
    return started || game.toMove === player ? wordsFor(game, lex, player) : null;
  }
  // Once it's over, only the boxed-in player's meter means anything.
  return result.reason === 'boxed-in' && result.winner !== player ? 0 : null;
}

const levelOf = (n: number | null): RoomLevel =>
  n === null ? 'unknown' : n === 0 ? 'cornered' : n === 1 ? 'danger' : n === 2 ? 'tight' : 'open';

function labelOf(n: number | null): string {
  if (n === null) return t('ways.unknown');
  if (n === 0) return t('ways.none');
  if (n === 1) return t('ways.one');
  return t('ways.many', { n: n >= 3 ? '3+' : n });
}

export function playerStatus(s: Session, lex: Lexicon, player: Player): PlayerStatus {
  const { game } = s;
  const ways = measuredWays(game, lex, player);
  const label = labelOf(ways);
  const last = s.lastPlay && game.words[s.lastPlay.wordIndex];
  const { match } = s;
  const name = nameOf(match, player);
  const ai = match.mode === 'ai' && isAi(match, player) ? { level: match.level, levelName: aiLevelName(match.level) } : null;
  return {
    player,
    name,
    you: humanOf(match) === player,
    ai,
    active: !game.result && game.toMove === player,
    ways,
    level: levelOf(ways),
    label,
    aria: ai
      ? plain('cpu.card.aria', { ai: name, level: ai.levelName, waysOut: label })
      : plain('ways.aria', { player: name, waysOut: label }),
    segments: ways === null ? 0 : ways >= 3 ? 4 : ways,
    warn: ways !== null && ways <= 1,
    alarm: ways === 1 && !game.result,
    squares: squares(game, player),
    delta: last && last.player === player ? t('squares.delta', { n: s.lastPlay!.gain }) : null,
  };
}

export interface TurnStatus {
  readonly label: string;
  readonly value: string;
  readonly aria: string;
  /** Which way the turn arrow points, or null once the game is over. */
  readonly toward: Player | null;
}

export function turnStatus(s: Session): TurnStatus {
  const { game } = s;
  if (game.result) {
    const [label, value] = t('turn.over').split(' · ');
    return { label: label ?? '', value: value ?? '', aria: plain('turn.over'), toward: null };
  }
  return {
    label: t('turn.label'),
    value: String(game.turn),
    aria: plain('turn.aria', { n: game.turn, player: nameOf(s.match, game.toMove) }),
    toward: game.toMove,
  };
}

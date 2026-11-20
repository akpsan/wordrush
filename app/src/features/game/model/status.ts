/**
 * The status bar: each player's words to play (1, 2 or 3+), squares and turn. A player whose words all
 * lead into a dead end (room 1 or 2, engine roomOf) reads "Dead end" instead of the word count.
 */

import { aiLevelName, plain, t } from '../../../copy';
import type { Level } from '../../../ai';
import {
  legalMoves,
  moveContext,
  roomOf,
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
  /** Words the player could still chain alone, when that's a dead end (1 or 2); null otherwise. */
  readonly deadEnd: number | null;
  readonly level: RoomLevel;
  readonly label: string;
  readonly aria: string;
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
  return [...new Set(game.words[last].word.split(''))];
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

/** Room per position and player, so typing (which re-renders the cards) doesn't search again. */
const roomCache = new WeakMap<GameState, [number | null | undefined, number | null | undefined]>();

/** The player's room when it's a dead end (1 or 2), else null. Only while the game is on and they've started. */
function deadEndFor(game: GameState, lex: Lexicon, player: Player, ways: number | null): number | null {
  if (game.result || ways === null || ways === 0 || game.lastWord[player] === null) return null;
  let cached = roomCache.get(game);
  if (!cached) roomCache.set(game, (cached = [undefined, undefined]));
  if (cached[player] === undefined) {
    const room = roomOf(game, lex, player);
    cached[player] = room < 3 ? room : null;
  }
  return cached[player] ?? null;
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
  const deadEnd = deadEndFor(game, lex, player, ways);
  // A dead end reads like having that many words left: room 1 warns like "1 word left!".
  const shown = deadEnd ?? ways;
  const label = deadEnd === null ? labelOf(ways) : deadEnd === 1 ? t('ways.deadend.one') : t('ways.deadend.two');
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
    deadEnd,
    level: levelOf(shown),
    label,
    aria: ai
      ? plain('cpu.card.aria', { ai: name, level: ai.levelName, waysOut: label })
      : plain('ways.aria', { player: name, waysOut: label }),
    warn: shown !== null && shown <= 1,
    // Only the player about to move gets the pulsing alarm; the other card keeps its quieter warning icon.
    alarm: shown === 1 && !game.result && game.toMove === player,
    squares: squares(game, player),
    delta: last && last.player === player ? t('squares.delta', { n: s.lastPlay.gain }) : null,
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

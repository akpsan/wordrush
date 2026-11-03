import { plain, t } from '../../../copy';
import { Icon } from '../../../ui/Icon';
import '../styles/entry.css';
import { RichText } from '../../../ui/RichText';
import type { EntryView } from '../model/entry';
import type { Feedback } from '../model/feedback';
import type { HintView } from '../model/hint';

const SLOTS = 5;

export interface EntryProps {
  readonly entry: EntryView;
  readonly feedback: Feedback;
  /** Changes on every failed play, to replay the shake. Null when there's no problem. */
  readonly problemId: number | null;
  /** Show "First word: 4 letters max, starting in the corner" (Blue's first turn). */
  readonly firstWordNote: boolean;
  /** The current hint, shown as a chip above the tiles. */
  readonly hint?: HintView | null;
}

function HintChip({ hint }: { hint: HintView }) {
  // The deck's "Hint {pattern} · {n} left", with the pattern drawn as tiles.
  const [before, after] = t('hint.chip', { pattern: '\u0000', n: hint.left }).split('\u0000');
  return (
    <p className="hintchip" role="status">
      <Icon name="bulb" />
      <span>{before}</span>
      <span className="htiles">
        {hint.tiles.map((tile, i) => (
          <i key={i} className={tile.revealed ? 'rev' : ''}>
            {tile.letter ?? '_'}
          </i>
        ))}
      </span>
      <span>{after}</span>
    </p>
  );
}

/** Which tile holds the shared (link) letter of the previewed spot. */
function linkSlot(entry: EntryView): number {
  const spot = entry.current;
  if (!spot) return -1;
  return spot.anchorAt === 'start' ? 0 : spot.word.length - 1;
}

export function Entry({ entry, feedback, problemId, firstWordNote, hint }: EntryProps) {
  const { typed, maxLen, ready } = entry;
  const link = linkSlot(entry);
  const slots = Array.from({ length: SLOTS }, (_, i) => {
    const ch = typed[i] ?? '';
    const cls = ['slot'];
    if (i >= maxLen) cls.push('cap');
    else if (ch) cls.push('f', problemId !== null ? 'bad' : ready ? 'ok' : '');
    else if (i === typed.length) cls.push('cur');
    if (ch && i === link) cls.push(ready ? 'anc' : 'anc weak');
    return { cls: cls.filter(Boolean).join(' '), ch };
  });

  const fbClass = feedback.tone === 'neutral' ? 'fb' : `fb ${feedback.tone}`;
  return (
    <div className="entrywrap">
      {/* The note line is always rendered, so the board doesn't change size when it goes away. */}
      {hint ? (
        <HintChip hint={hint} />
      ) : (
        <p className={firstWordNote ? 'tnote' : 'tnote off'} aria-hidden={!firstWordNote}>
          <Icon name="note" />
          <span>{t('first.note')}</span>
        </p>
      )}
      <div
        key={problemId ?? 'ok'}
        className={problemId !== null ? 'entry shake' : 'entry'}
        role="textbox"
        aria-readonly="true"
        aria-label={plain('entry.aria', { word: typed ? typed.toUpperCase() : plain('entry.aria.empty') })}
      >
        {slots.map((s, i) => (
          <span key={i} className={s.cls}>
            {s.ch.toUpperCase()}
          </span>
        ))}
      </div>
      <p className={fbClass} role="status">
        {feedback.tone === 'good' && <Icon name="check" />}
        {feedback.tone === 'err' && <Icon name="info" />}
        {feedback.tone === 'warn' && <Icon name="warn" />}
        {feedback.tone === 'steer' && <Icon name="note" />}
        {feedback.pip !== null && <span className={feedback.pip === 0 ? 'mini a' : 'mini b'} aria-hidden="true" />}
        <span>
          <RichText text={feedback.text} />
        </span>
      </p>
    </div>
  );
}

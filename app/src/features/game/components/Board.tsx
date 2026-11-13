import { plain } from '../../../copy';
import type { CellIndex, Geometry } from '../../../engine';
import { Icon } from '../../../ui/Icon';
import { hexLayout } from './hexLayout';
import type { CellView } from '../model/board';
import '../styles/board.css';

export interface BoardProps {
  readonly cells: readonly CellView[];
  readonly onFlip: () => void;
  readonly onFilter: (cell: CellIndex) => void;
  /** Any tap on the board (the AI's word appearing: finish it at once). */
  readonly onTap?: () => void;
  /** The board's shape. Square when left out (the tutorial and the menu). */
  readonly geo?: Geometry;
}

function CellContent({ cell }: { cell: CellView }) {
  return (
    <>
      <span className="l">{cell.letter}</span>
      {cell.mark && <span className="mk">{cell.mark}</span>}
      {cell.arrow && (
        <span className="ar" aria-hidden="true">
          {cell.arrow}
        </span>
      )}
      {cell.linkBadge && (
        <span className="gb">
          <Icon name="link" />
        </span>
      )}
    </>
  );
}

/** Cells you can act on (your letters, the preview) are buttons; the rest are labelled tiles. */
export function Board({ cells, onFlip, onFilter, onTap, geo }: BoardProps) {
  const hex = geo?.shape === 'hex' ? hexLayout(geo) : null;
  const shown = hex ? cells.filter((cell) => geo!.valid[cell.index]) : cells;
  return (
    <section className={hex ? 'boardwrap hexwrap' : 'boardwrap'} aria-label={plain('board.aria')} onClick={onTap}>
      <div className={hex ? 'board hex' : 'board'} style={hex?.style}>
        {hex && shown.map((cell) => <i key={`s${cell.index}`} className={`hexslot ${cell.className.replace(/^cell ?/, '')}`.trim()} style={hex.slot(cell.index)} aria-hidden="true" />)}
        {shown.map((cell) => {
          const anim = cell.delay ? { animationDelay: `${cell.delay}ms` } : undefined;
          const style = hex ? { ...hex.slot(cell.index), ...anim } : anim;
          if (!cell.tap) {
            return (
              <div key={cell.index} className={cell.className} style={style} role="img" aria-label={cell.label}>
                <CellContent cell={cell} />
              </div>
            );
          }
          const onClick = cell.tap === 'flip' ? onFlip : () => onFilter(cell.index);
          return (
            <button
              key={cell.index}
              type="button"
              className={cell.className}
              style={style}
              aria-label={cell.label}
              onClick={onClick}
              onMouseDown={(e) => e.preventDefault()}
            >
              <CellContent cell={cell} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

import { plain } from '../../../copy';
import type { CellIndex } from '../../../engine';
import { Icon } from '../../../ui/Icon';
import type { CellView } from '../model/board';
import '../styles/board.css';

export interface BoardProps {
  readonly cells: readonly CellView[];
  readonly onFlip: () => void;
  readonly onFilter: (cell: CellIndex) => void;
}

function CellContent({ cell }: { cell: CellView }) {
  return (
    <>
      <span className="l">{cell.letter}</span>
      {cell.mark && <span className="mk">{cell.mark}</span>}
      {cell.linkBadge && (
        <span className="gb">
          <Icon name="link" />
        </span>
      )}
    </>
  );
}

/** Cells you can act on (your letters, the preview) are buttons; the rest are labelled tiles. */
export function Board({ cells, onFlip, onFilter }: BoardProps) {
  return (
    <section className="boardwrap" aria-label={plain('board.aria')}>
      <div className="board">
        {cells.map((cell) => {
          const style = cell.delay ? { animationDelay: `${cell.delay}ms` } : undefined;
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

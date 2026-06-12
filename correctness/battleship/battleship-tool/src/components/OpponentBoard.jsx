import React from 'react';
import { COLS, GRID_SIZE } from '../constants';
import ShipGraphic from './ShipGraphic';

const PAD  = 10;
const HDR  = 28;
const CELL = 44;
const GAP  = 2;
const STEP = CELL + GAP;

function cellLeft(col) { return PAD + HDR + GAP + col * STEP; }
function cellTop(row)  { return PAD + HDR + GAP + row * STEP; }
function shipW(size)   { return CELL * size + GAP * (size - 1); }

const SIZES = { carrier: 5, battleship: 4, cruiser: 3, submarine: 3, destroyer: 2 };
function sizeOf(id) { return SIZES[id] ?? 1; }

function placementFromCells(cells) {
  const rows = cells.map(([r]) => r);
  const cols = cells.map(([, c]) => c);
  return {
    row: Math.min(...rows),
    col: Math.min(...cols),
    orientation: rows.every(r => r === rows[0]) ? 'H' : 'V',
  };
}

// &begin[FiringPhase]
// &begin[Animations]
function ShotMarker({ type }) {
  if (type === 'hit') return (
    <svg className="shot-hit-anim" viewBox="0 0 44 44" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <circle cx="22" cy="22" r="12" fill="#ef4444" opacity="0.85" />
      <line x1="16" y1="16" x2="28" y2="28" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="28" y1="16" x2="16" y2="28" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
  if (type === 'miss') return (
    <svg className="shot-miss-anim" viewBox="0 0 44 44" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <circle cx="22" cy="22" r="7" fill="#93c5fd" opacity="0.7" />
      <circle cx="22" cy="22" r="12" fill="none" stroke="#93c5fd" strokeWidth="1.5" opacity="0.4" />
      <circle cx="22" cy="22" r="17" fill="none" stroke="#93c5fd" strokeWidth="1" opacity="0.2" />
    </svg>
  );
  return null;
}
// &end[Animations]

export default function OpponentBoard({ myShots, sunkShips, isMyTurn, onFire, justSunkOffenseId }) {
  const sunkCellSet = new Set(sunkShips.flatMap(s => s.cells.map(([r, c]) => `${r}-${c}`)));

  return (
    <div className={`board-wrapper${isMyTurn ? ' my-turn' : ''}`} style={{ position: 'relative' }}>
      <div className="board-grid">
        <div className="board-corner" />
        {COLS.map(c => <div key={c} className="board-header">{c}</div>)}

        {Array.from({ length: GRID_SIZE }, (_, row) => (
          <React.Fragment key={row}>
            <div className="board-header">{row + 1}</div>
            {Array.from({ length: GRID_SIZE }, (_, col) => {
              const key    = `${row}-${col}`;
              const shot   = myShots[row][col];
              const isSunk = sunkCellSet.has(key);
              const canFire = isMyTurn && !shot;
              const cls = [
                'cell',
                canFire ? 'cell-targetable' : '',
                isSunk  ? 'cell-sunk'       : '',
              ].filter(Boolean).join(' ');

              return (
                <div
                  key={key}
                  className={cls}
                  style={{ position: 'relative' }}
                  onClick={() => canFire && onFire(row, col)}
                >
                  <ShotMarker type={shot} />
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* &begin[ShipDesign] */}
      {sunkShips.map(({ id, cells }) => {
        const { row, col, orientation } = placementFromCells(cells);
        const size = sizeOf(id);
        const isH  = orientation === 'H';
        return (
          <div
            key={id}
            // &begin[Animations]
            className={id === justSunkOffenseId ? 'ship-revealing' : ''}
            // &end[Animations]
            style={{
              position: 'absolute',
              left:    cellLeft(col),
              top:     cellTop(row),
              width:   isH ? shipW(size) : CELL,
              height:  isH ? CELL : shipW(size),
              zIndex:  2,
              padding: 3,
              boxSizing: 'border-box',
              pointerEvents: 'none',
              opacity: 0.6,
            }}
          >
            <ShipGraphic shipId={id} orientation={orientation} />
          </div>
        );
      })}
      {/* &end[ShipDesign] */}
    </div>
  );
}
// &end[FiringPhase]

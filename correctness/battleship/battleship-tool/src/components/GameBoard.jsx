import React from 'react';
import { COLS, GRID_SIZE } from '../constants';
import ShipGraphic from './ShipGraphic';

// Pixel layout constants — must match App.css board-wrapper/board-grid values
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

// &begin[GameBoard]
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

export default function GameBoard({
  grid,
  preview,
  onCellHover,
  onBoardLeave,
  onDragOver,
  onDrop,
  isPlacingMode,
  placedShips,
  incomingShots,
  justSunkDefenseId,
  onShipLiftDrag,
}) {
  const previewSet = new Set((preview?.cells ?? []).map(([r, c]) => `${r}-${c}`));
  const isDraggable = !!onShipLiftDrag;

  // Derive which defense ships are fully sunk from incoming shots
  // &begin[Animations]
  const sunkDefenseIds = (() => {
    if (!incomingShots) return new Set();
    const shipCells = {};
    for (let r = 0; r < GRID_SIZE; r++)
      for (let c = 0; c < GRID_SIZE; c++)
        if (grid[r][c]) {
          const id = grid[r][c];
          if (!shipCells[id]) shipCells[id] = [];
          shipCells[id].push([r, c]);
        }
    const sunk = new Set();
    for (const [id, cells] of Object.entries(shipCells))
      if (cells.every(([r, c]) => incomingShots[r][c] === 'hit')) sunk.add(id);
    return sunk;
  })();
  // &end[Animations]

  return (
    <div
      className={`board-wrapper${isPlacingMode ? ' placing-mode' : ''}`}
      style={{ position: 'relative' }}
      onMouseLeave={onBoardLeave}
    >
      <div className="board-grid">
        <div className="board-corner" />
        {COLS.map(c => <div key={c} className="board-header">{c}</div>)}

        {Array.from({ length: GRID_SIZE }, (_, row) => (
          <React.Fragment key={row}>
            <div className="board-header">{row + 1}</div>
            {Array.from({ length: GRID_SIZE }, (_, col) => {
              const key     = `${row}-${col}`;
              const shipId  = grid[row][col];
              const isPreview = previewSet.has(key);
              const shot    = incomingShots?.[row]?.[col] ?? null;
              const cls     = [
                'cell',
                shipId    ? 'cell-placed'        : '',
                isPreview ? (preview.valid ? 'cell-preview-valid' : 'cell-preview-invalid') : '',
              ].filter(Boolean).join(' ');

              return (
                <div
                  key={key}
                  className={cls}
                  style={{ position: 'relative' }}
                  onMouseEnter={() => onCellHover?.(row, col)}
                  onDragOver={e => { e.preventDefault(); onDragOver?.(row, col); }}
                  onDrop={e => { e.preventDefault(); onDrop?.(row, col); }}
                >
                  <ShotMarker type={shot} />
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* &begin[ShipDesign] */}
      {placedShips && Object.entries(placedShips).map(([id, { row, col, orientation }]) => {
        const size = sizeOf(id);
        const isH  = orientation === 'H';
        // &begin[Animations]
        const isSunk     = sunkDefenseIds.has(id);
        const isJustSunk = id === justSunkDefenseId;
        // &end[Animations]

        return (
          <div
            key={id}
            // &begin[Animations]
            className={isJustSunk ? 'ship-destroyed' : ''}
            // &end[Animations]
            style={{
              position: 'absolute',
              left:   cellLeft(col),
              top:    cellTop(row),
              width:  isH ? shipW(size) : CELL,
              height: isH ? CELL : shipW(size),
              zIndex: 2,
              padding: 3,
              boxSizing: 'border-box',
              cursor: isDraggable ? 'grab' : 'default',
              pointerEvents: isDraggable ? 'all' : 'none',
              // &begin[Animations]
              opacity: isSunk && !isJustSunk ? 0.35 : undefined,
              filter:  isSunk && !isJustSunk ? 'brightness(0.5) saturate(0.3) grayscale(0.5)' : undefined,
              // &end[Animations]
            }}
            draggable={isDraggable}
            onDragStart={isDraggable ? e => {
              e.dataTransfer.effectAllowed = 'move';
              onShipLiftDrag(id);
            } : undefined}
          >
            <ShipGraphic shipId={id} orientation={orientation} />
          </div>
        );
      })}
      {/* &end[ShipDesign] */}
    </div>
  );
}
// &end[GameBoard]

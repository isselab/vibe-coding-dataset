import { useEffect, useCallback } from 'react'
import { GRID_SIZE } from '../constants'
import { cellsForPlacement, canPlace } from '../gameLogic'
import ShipOverlay from './ShipOverlay'

const LETTERS = 'ABCDEFGHIJ'

function buildOccupiedMap(ships) {
  const map = {}
  for (const ship of ships) {
    for (const cell of ship.cells) {
      map[`${cell.row},${cell.col}`] = ship.id
    }
  }
  return map
}

function buildShotMap(shots) {
  const map = {}
  for (const s of shots) map[`${s.row},${s.col}`] = s
  return map
}

export default function Grid({
  placedShips = [],
  hoverCells = [],
  hoverValid = true,
  onCellClick,
  onCellHover,
  onMouseLeave,
  onRemoveShip,
  onDrop,
  setHorizontal,
  activeShip,
  shots = [],
  revealedShips = [],
  sinkingIds = new Set(),
  sunkShipIds = new Set(),
}) {
  const occupied = buildOccupiedMap(placedShips)
  const shotMap = buildShotMap(shots)
  const hoverSet = new Set(hoverCells.map(c => `${c.row},${c.col}`))

  const handleKeyDown = useCallback((e) => {
    if ((e.key === 'r' || e.key === 'R') && setHorizontal) setHorizontal(h => !h)
  }, [setHorizontal])

  useEffect(() => {
    if (!setHorizontal) return
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, setHorizontal])

  return (
    <div className="grid-wrapper" onMouseLeave={onMouseLeave}>
      <div className="grid-col-labels">
        <div className="grid-corner" />
        {Array.from({ length: GRID_SIZE }, (_, i) => (
          <div key={i} className="grid-label col-label">{i + 1}</div>
        ))}
      </div>

      {Array.from({ length: GRID_SIZE }, (_, row) => (
        <div key={row} className="grid-row">
          <div className="grid-label row-label">{LETTERS[row]}</div>
          {Array.from({ length: GRID_SIZE }, (_, col) => {
            const key = `${row},${col}`
            const shot = shotMap[key]
            const isHover = hoverSet.has(key)

            let cellClass = 'cell'
            if (occupied[key]) cellClass += ' occupied'
            if (isHover) cellClass += hoverValid ? ' hover-valid' : ' hover-invalid'
            if (shot) cellClass += shot.hit ? ' shot-hit' : ' shot-miss'
            if (shot?.fresh) cellClass += ' shot-fresh'

            return (
              <div
                key={col}
                className={cellClass}
                onClick={() => onCellClick?.(row, col)}
                onMouseEnter={() => onCellHover?.(row, col)}
                onDragOver={(e) => {
                  e.preventDefault()
                  if (activeShip) onCellHover?.(row, col)
                  e.dataTransfer.dropEffect = 'move'
                }}
                onDrop={(e) => { e.preventDefault(); onDrop?.(row, col) }}
              >
                {shot && <div className={`shot-marker ${shot.hit ? 'hit' : 'miss'}`} />}
              </div>
            )
          })}
        </div>
      ))}

      {placedShips.map(ship => (
        <ShipOverlay
          key={ship.id}
          ship={ship}
          onClick={onRemoveShip ? () => onRemoveShip(ship.id) : undefined}
          sinking={sunkShipIds.has(ship.id)}
        />
      ))}

      {revealedShips.map(ship => (
        <ShipOverlay
          key={`rev-${ship.id}`}
          ship={ship}
          sinking={sinkingIds.has(ship.id)}
        />
      ))}
    </div>
  )
}

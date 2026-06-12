import { CELL_SIZE, ROW_LABEL_WIDTH, COL_LABEL_HEIGHT } from '../constants'
import ShipSvg from './ShipSvg'

export default function ShipOverlay({ ship, onClick, sinking }) {
  const { id, cells, horizontal } = ship
  const minRow = Math.min(...cells.map(c => c.row))
  const minCol = Math.min(...cells.map(c => c.col))
  const length = cells.length

  const top = COL_LABEL_HEIGHT + minRow * CELL_SIZE
  const left = ROW_LABEL_WIDTH + minCol * CELL_SIZE
  const width = horizontal ? length * CELL_SIZE : CELL_SIZE
  const height = horizontal ? CELL_SIZE : length * CELL_SIZE

  return (
    <div
      className={`ship-overlay-wrap ${sinking ? 'ship-sinking' : ''}`}
      style={{
        position: 'absolute',
        top,
        left,
        width,
        height,
        pointerEvents: onClick ? 'auto' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClick}
      title={onClick ? 'Drag to reposition or click to remove' : undefined}
    >
      <div style={{
        width: horizontal ? '100%' : height,
        height: horizontal ? '100%' : width,
        transform: horizontal ? 'none' : 'rotate(90deg)',
        transformOrigin: 'center center',
        flexShrink: 0,
      }}>
        <ShipSvg shipId={id} />
      </div>
    </div>
  )
}

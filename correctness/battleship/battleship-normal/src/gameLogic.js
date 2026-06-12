import { GRID_SIZE } from './constants'

export function cellsForPlacement(row, col, length, horizontal) {
  const cells = []
  for (let i = 0; i < length; i++) {
    cells.push(horizontal ? { row, col: col + i } : { row: row + i, col })
  }
  return cells
}

export function isInBounds(cells) {
  return cells.every(
    ({ row, col }) => row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE
  )
}

export function isOverlapping(cells, placedShips) {
  const occupied = new Set(
    placedShips.flatMap(s => s.cells.map(c => `${c.row},${c.col}`))
  )
  return cells.some(c => occupied.has(`${c.row},${c.col}`))
}

export function canPlace(cells, placedShips) {
  return isInBounds(cells) && !isOverlapping(cells, placedShips)
}

import { useState, useCallback } from 'react'
import { SHIPS } from '../constants'
import { cellsForPlacement, canPlace } from '../gameLogic'
import Grid from '../components/Grid'
import ShipList from '../components/ShipList'

export default function PlacementScreen({ onDone, waitingForOpponent }) {
  const [placedShips, setPlacedShips] = useState([])
  const [selectedShipId, setSelectedShipId] = useState(SHIPS[0].id)
  const [horizontal, setHorizontal] = useState(true)
  const [dragShipId, setDragShipId] = useState(null)
  const [hoverCells, setHoverCells] = useState([])
  const [hoverValid, setHoverValid] = useState(true)

  const placedIds = new Set(placedShips.map(s => s.id))
  const activeShipId = dragShipId ?? selectedShipId
  const activeShip = SHIPS.find(s => s.id === activeShipId && !placedIds.has(activeShipId))
  const allPlaced = SHIPS.every(s => placedIds.has(s.id))

  const placeShip = useCallback((row, col, shipId) => {
    const ship = SHIPS.find(s => s.id === shipId)
    if (!ship || placedIds.has(shipId)) return
    const cells = cellsForPlacement(row, col, ship.length, horizontal)
    if (!canPlace(cells, placedShips)) return
    const next = [...placedShips, { id: ship.id, cells, horizontal }]
    setPlacedShips(next)
    const nextShip = SHIPS.find(s => !next.some(p => p.id === s.id))
    if (nextShip) setSelectedShipId(nextShip.id)
    setHoverCells([])
  }, [placedShips, placedIds, horizontal])

  const handleDrop = useCallback((row, col) => {
    const id = dragShipId ?? selectedShipId
    placeShip(row, col, id)
    setDragShipId(null)
    setHoverCells([])
  }, [dragShipId, selectedShipId, placeShip])

  const handleRemove = useCallback((shipId) => {
    setPlacedShips(prev => prev.filter(s => s.id !== shipId))
    setSelectedShipId(shipId)
    setHoverCells([])
  }, [])

  const handleReset = useCallback(() => {
    setPlacedShips([])
    setSelectedShipId(SHIPS[0].id)
    setHoverCells([])
  }, [])

  return (
    <div className="app">
      <h1>Place Your Fleet</h1>
      {waitingForOpponent && (
        <div className="placement-banner">Fleet locked — waiting for opponent…</div>
      )}
      <div className="layout">
        <div className="sidebar">
          <ShipList
            ships={SHIPS}
            placedIds={placedIds}
            selectedShipId={selectedShipId}
            onDragStart={(id) => { setDragShipId(id); setSelectedShipId(id) }}
            onDragEnd={() => { setDragShipId(null); setHoverCells([]) }}
          />
          <div className="controls">
            <button
              className={`orientation-btn ${horizontal ? 'active' : ''}`}
              onClick={() => setHorizontal(h => !h)}
            >
              {horizontal ? 'Horizontal' : 'Vertical'}
            </button>
            <span className="orientation-hint">Press R to rotate</span>
          </div>
          {allPlaced && !waitingForOpponent && (
            <button className="ready-btn" onClick={() => onDone(placedShips)}>
              Ready!
            </button>
          )}
          <button className="reset-btn" onClick={handleReset}>Reset</button>
        </div>

        <Grid
          placedShips={placedShips}
          hoverCells={dragShipId ? hoverCells : []}
          hoverValid={hoverValid}
          onCellHover={(row, col) => {
            if (!activeShip || waitingForOpponent) return
            const cells = cellsForPlacement(row, col, activeShip.length, horizontal)
            setHoverCells(cells)
            setHoverValid(canPlace(cells, placedShips))
          }}
          onMouseLeave={() => setHoverCells([])}
          onDrop={waitingForOpponent ? undefined : handleDrop}
          onRemoveShip={waitingForOpponent ? undefined : handleRemove}
          setHorizontal={setHorizontal}
          activeShip={activeShip}
        />
      </div>
    </div>
  )
}

import { useState, useCallback, useMemo } from 'react';
import { GRID_SIZE, SHIPS } from '../constants';

// &begin[ShipPlacement]
function createEmptyGrid() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

function getShipCells(row, col, size, orientation) {
  return Array.from({ length: size }, (_, i) =>
    orientation === 'H' ? [row, col + i] : [row + i, col]
  );
}

function isValidPlacement(grid, cells) {
  return cells.every(
    ([r, c]) => r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && !grid[r][c]
  );
}
// &end[ShipPlacement]

export function useBattleship() {
  // &begin[ShipPlacement]
  const [grid, setGrid] = useState(createEmptyGrid);
  const [placedShips, setPlacedShips] = useState({});
  const [hoverPos, setHoverPos] = useState(null);
  // &end[ShipPlacement]

  // &begin[DragAndDropPlacement]
  const [dragShipId, setDragShipId] = useState(null);
  // &end[DragAndDropPlacement]

  // &begin[ShipRotation]
  const [orientation, setOrientation] = useState('H');

  const toggleOrientation = useCallback(() => {
    setOrientation(prev => (prev === 'H' ? 'V' : 'H'));
  }, []);
  // &end[ShipRotation]

  // &begin[ShipPlacement]
  const placeShip = useCallback(
    (row, col, shipId, orient) => {
      const ship = SHIPS.find(s => s.id === shipId);
      if (!ship || placedShips[shipId]) return false;
      const cells = getShipCells(row, col, ship.size, orient);
      if (!isValidPlacement(grid, cells)) return false;
      setGrid(prev => {
        const next = prev.map(r => [...r]);
        cells.forEach(([r, c]) => { next[r][c] = shipId; });
        return next;
      });
      setPlacedShips(prev => ({ ...prev, [shipId]: { row, col, orientation: orient } }));
      return true;
    },
    [grid, placedShips]
  );

  const removeShip = useCallback(shipId => {
    setGrid(prev => {
      const next = prev.map(r => [...r]);
      for (let r = 0; r < GRID_SIZE; r++)
        for (let c = 0; c < GRID_SIZE; c++)
          if (next[r][c] === shipId) next[r][c] = null;
      return next;
    });
    setPlacedShips(prev => {
      const { [shipId]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const unplacedShips = useMemo(() => SHIPS.filter(s => !placedShips[s.id]), [placedShips]);
  const allPlaced = unplacedShips.length === 0;

  const preview = useMemo(() => {
    if (!hoverPos || !dragShipId) return null;
    const ship = SHIPS.find(s => s.id === dragShipId);
    if (!ship) return null;
    const cells = getShipCells(hoverPos.row, hoverPos.col, ship.size, orientation);
    return { cells, valid: isValidPlacement(grid, cells) };
  }, [hoverPos, dragShipId, orientation, grid]);

  const resetBoard = useCallback(() => {
    setGrid(createEmptyGrid());
    setPlacedShips({});
    setDragShipId(null);
    setHoverPos(null);
  }, []);
  // &end[ShipPlacement]

  // &begin[DragAndDropPlacement]
  const handleDragStart = useCallback(shipId => {
    setDragShipId(shipId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragShipId(null);
    setHoverPos(null);
  }, []);

  const handleDrop = useCallback(
    (row, col) => {
      if (!dragShipId) return;
      placeShip(row, col, dragShipId, orientation);
      setDragShipId(null);
      setHoverPos(null);
    },
    [dragShipId, orientation, placeShip]
  );

  const handleLiftDrag = useCallback(shipId => {
    removeShip(shipId);
    setDragShipId(shipId);
  }, [removeShip]);
  // &end[DragAndDropPlacement]

  return {
    grid,
    placedShips,
    unplacedShips,
    allPlaced,
    orientation,
    toggleOrientation,
    hoverPos,
    setHoverPos,
    dragShipId,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleLiftDrag,
    preview,
    resetBoard,
  };
}

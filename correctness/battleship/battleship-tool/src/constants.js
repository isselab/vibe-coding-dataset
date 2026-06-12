// &begin[GameBoard]
export const GRID_SIZE = 10;
export const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
// &end[GameBoard]

// &begin[Fleet]
export const SHIPS = [
  { id: 'carrier',    name: 'Carrier',    size: 5 },
  { id: 'battleship', name: 'Battleship', size: 4 },
  { id: 'cruiser',    name: 'Cruiser',    size: 3 },
  { id: 'submarine',  name: 'Submarine',  size: 3 },
  { id: 'destroyer',  name: 'Destroyer',  size: 2 },
];

export const SHIP_COLORS = {
  carrier:    '#2563eb',
  battleship: '#7c3aed',
  cruiser:    '#059669',
  submarine:  '#d97706',
  destroyer:  '#dc2626',
};
// &end[Fleet]

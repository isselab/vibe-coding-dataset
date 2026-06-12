import ShipGraphic from './ShipGraphic';

// &begin[Fleet]
function ShipItem({ ship, dragging, onDragStart, onDragEnd }) {
  return (
    <div
      className={`ship-item${dragging ? ' dragging' : ''}`}
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart(ship.id); }}
      onDragEnd={onDragEnd}
      style={{ cursor: 'grab' }}
    >
      <div className="ship-name">{ship.name} <span className="ship-size">×{ship.size}</span></div>
      <div className="ship-graphic-preview">
        <ShipGraphic shipId={ship.id} orientation="H" style={{ width: `${ship.size * 24}px`, height: '22px' }} />
      </div>
    </div>
  );
}
// &end[Fleet]

// &begin[Fleet]
export default function ShipPanel({
  unplacedShips,
  dragShipId,
  orientation,
  onDragStart,
  onDragEnd,
  onToggleOrientation,
  onReset,
  allPlaced,
}) {
  return (
    <div className="ship-panel">
      <h2>Your Fleet</h2>

      {/* &begin[ShipRotation] */}
      <button className="orientation-btn" onClick={onToggleOrientation} title="Press R to rotate">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y={orientation === 'H' ? 5 : 1} width={orientation === 'H' ? 12 : 4} height={orientation === 'H' ? 4 : 12} rx="1" fill="currentColor" opacity="0.8"/>
        </svg>
        {orientation === 'H' ? 'Horizontal' : 'Vertical'}
      </button>
      {/* &end[ShipRotation] */}

      <div className="ships-list">
        {allPlaced ? (
          <p className="all-placed-note">Fleet deployed!</p>
        ) : (
          unplacedShips.map(ship => (
            <ShipItem
              key={ship.id}
              ship={ship}
              dragging={dragShipId === ship.id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>

      <button className="reset-btn" onClick={onReset}>Reset Board</button>
    </div>
  );
}
// &end[Fleet]

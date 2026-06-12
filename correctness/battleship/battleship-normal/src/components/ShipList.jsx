export default function ShipList({ ships, placedIds, onDragStart, onDragEnd }) {
  return (
    <div className="ship-list">
      <h2>Fleet</h2>
      {ships.map(ship => {
        const placed = placedIds.has(ship.id)
        return (
          <div
            key={ship.id}
            className={`ship-item ${placed ? 'placed' : 'draggable'}`}
            draggable={!placed}
            onDragStart={() => !placed && onDragStart?.(ship.id)}
            onDragEnd={onDragEnd}
          >
            <span className="ship-name">{ship.name}</span>
            <div className="ship-blocks">
              {Array.from({ length: ship.length }, (_, i) => (
                <div key={i} className="ship-block" />
              ))}
            </div>
            {placed && <span className="placed-badge">✓</span>}
          </div>
        )
      })}
    </div>
  )
}

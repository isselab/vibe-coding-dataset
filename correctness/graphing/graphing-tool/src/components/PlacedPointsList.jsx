export function PlacedPointsList({ points, onRemove, onClearAll }) {
  return (
    <div className="data-table-card">
      <div className="data-table-header">
        <span>Placed Points</span>
        {points.length > 0 && (
          <button className="clear-btn" onClick={onClearAll}>Clear All</button>
        )}
      </div>
      {points.length === 0 ? (
        <p className="data-table-empty">Click the canvas to place points.</p>
      ) : (
        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr><th>x</th><th>y</th><th></th></tr>
            </thead>
            <tbody>
              {points.map(pt => (
                <tr key={pt.id}>
                  <td className="point-coord">{pt.x}</td>
                  <td className="point-coord">{pt.y}</td>
                  <td>
                    <button className="delete-btn" onClick={() => onRemove(pt.id)}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

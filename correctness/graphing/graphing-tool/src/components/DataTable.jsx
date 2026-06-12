export function DataTable({ points, onAdd, onRemove, onUpdate }) {
  return (
    <div className="data-table-card">
      <div className="data-table-header">
        <span>Data Points</span>
        <button className="add-row-btn" onClick={() => onAdd()}>+ Add Row</button>
      </div>
      {points.length === 0 ? (
        <p className="data-table-empty">Click the canvas to place points, or use + Add Row.</p>
      ) : (
        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>x</th>
                <th>y</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {points.map(pt => (
                <tr key={pt.id}>
                  <td>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="data-input"
                      value={pt.x}
                      onChange={e => onUpdate(pt.id, 'x', e.target.value)}
                      placeholder="0"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="data-input"
                      value={pt.y}
                      onChange={e => onUpdate(pt.id, 'y', e.target.value)}
                      placeholder="0"
                    />
                  </td>
                  <td>
                    <button className="delete-btn" onClick={() => onRemove(pt.id)} title="Remove">×</button>
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

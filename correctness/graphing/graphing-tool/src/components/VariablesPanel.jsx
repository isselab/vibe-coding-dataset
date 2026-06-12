export function VariablesPanel({ variables, onAdd, onRemove, onUpdate }) {
  return (
    <div className="variables-card">
      <div className="variables-header">
        <span>Variables</span>
        <button className="add-row-btn" onClick={onAdd}>+ Add</button>
      </div>
      {variables.length === 0 ? (
        <p className="variables-empty">Define variables to use in f(x), e.g. a = 2, k = 0.5</p>
      ) : (
        <div className="variables-list">
          {variables.map(v => (
            <div key={v.id} className="variable-row">
              <input
                type="text"
                className="var-name-input"
                value={v.name}
                onChange={e => onUpdate(v.id, 'name', e.target.value)}
                placeholder="name"
                spellCheck={false}
              />
              <span className="var-equals">=</span>
              <input
                type="text"
                inputMode="decimal"
                className="var-value-input"
                value={v.value}
                onChange={e => onUpdate(v.id, 'value', e.target.value)}
                placeholder="0"
              />
              <button className="delete-btn" onClick={() => onRemove(v.id)}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

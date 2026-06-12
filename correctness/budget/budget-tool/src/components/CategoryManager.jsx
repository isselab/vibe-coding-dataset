import { useState } from 'react'

export function CategoryManager({ categories, onAdd, onDelete, onSetLimit }) {
  const [name, setName] = useState('')
  // &begin[SpendLimit]
  const [pendingLimits, setPendingLimits] = useState({})
  // &end[SpendLimit]

  const handleAdd = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ id: crypto.randomUUID(), name: name.trim(), limit: null })
    setName('')
  }

  // &begin[SpendLimit]
  const handleLimitChange = (id, val) => {
    setPendingLimits((prev) => ({ ...prev, [id]: val }))
  }

  const handleLimitBlur = (id) => {
    const val = pendingLimits[id]
    if (val === undefined) return
    const num = parseFloat(val)
    onSetLimit(id, isNaN(num) || num <= 0 ? null : num)
  }
  // &end[SpendLimit]

  return (
    <div className="card">
      <h2>Categories</h2>
      <form onSubmit={handleAdd} className="inline-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          required
        />
        <button type="submit" className="btn-primary">Add</button>
      </form>
      {categories.length === 0 ? (
        <p className="empty-state">No categories yet.</p>
      ) : (
        <ul className="category-list">
          {categories.map((c) => {
            // &begin[SpendLimit]
            const displayVal =
              pendingLimits[c.id] !== undefined ? pendingLimits[c.id] : c.limit ?? ''
            // &end[SpendLimit]
            return (
              <li key={c.id} className="category-item">
                <span className="category-name">{c.name}</span>
                {/* &begin[SpendLimit] */}
                <label className="limit-label">
                  Monthly limit:
                  <input
                    type="number"
                    placeholder="None"
                    value={displayVal}
                    min="0.01"
                    step="0.01"
                    onChange={(e) => handleLimitChange(c.id, e.target.value)}
                    onBlur={() => handleLimitBlur(c.id)}
                    className="limit-input"
                  />
                </label>
                {/* &end[SpendLimit] */}
                <button
                  onClick={() => onDelete(c.id)}
                  className="btn-delete"
                  aria-label="Delete category"
                >
                  ×
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

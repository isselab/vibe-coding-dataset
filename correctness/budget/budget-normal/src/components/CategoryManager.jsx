import React, { useState } from 'react'

export default function CategoryManager({ categories, limits, onSetLimit, onRemoveLimit, onAddCategory }) {
  const [newCategory, setNewCategory] = useState('')
  const [editLimit, setEditLimit] = useState({})

  function submitCategory(e) {
    e.preventDefault()
    if (!newCategory.trim()) return
    onAddCategory(newCategory.trim())
    setNewCategory('')
  }

  function handleLimitChange(cat, val) {
    setEditLimit(prev => ({ ...prev, [cat]: val }))
  }

  function saveLimit(cat) {
    const val = editLimit[cat]
    if (val === '' || val === undefined) {
      onRemoveLimit(cat)
    } else {
      const n = parseFloat(val)
      if (!isNaN(n) && n > 0) onSetLimit(cat, n)
    }
    setEditLimit(prev => { const next = { ...prev }; delete next[cat]; return next })
  }

  return (
    <div className="category-manager">
      <h2>Category Budgets</h2>
      <p className="hint">Set a monthly spending limit per category. Leave blank to remove the limit.</p>

      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Monthly Limit</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => {
            const currentLimit = limits[cat]
            const editing = editLimit[cat] !== undefined
            const displayVal = editing ? editLimit[cat] : (currentLimit ?? '')
            return (
              <tr key={cat}>
                <td>{cat}</td>
                <td>
                  <input
                    type="number"
                    className="limit-input"
                    value={displayVal}
                    min="0.01"
                    step="0.01"
                    placeholder="No limit"
                    onChange={e => handleLimitChange(cat, e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveLimit(cat)}
                  />
                </td>
                <td>
                  <button
                    className="btn-primary btn-sm"
                    onClick={() => saveLimit(cat)}
                    disabled={!editing && currentLimit === undefined}
                  >
                    {editing ? 'Save' : currentLimit !== undefined ? 'Update' : 'Set'}
                  </button>
                  {currentLimit !== undefined && !editing && (
                    <button
                      className="btn-ghost btn-sm"
                      onClick={() => onRemoveLimit(cat)}
                      style={{ marginLeft: '0.5rem' }}
                    >
                      Clear
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <form className="add-category-form" onSubmit={submitCategory}>
        <h3>Add Custom Category</h3>
        <div className="form-row">
          <input
            type="text"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            placeholder="Category name"
            maxLength={50}
          />
          <button type="submit" className="btn-primary">Add</button>
        </div>
      </form>
    </div>
  )
}

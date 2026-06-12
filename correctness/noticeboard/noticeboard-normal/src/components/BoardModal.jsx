import { useState } from 'react'
import { THEMES } from '../themes'

export default function BoardModal({ board, onSave, onClose }) {
  const [name, setName] = useState(board?.name ?? '')
  const [theme, setTheme] = useState(board?.theme ?? 'cork')
  const isNew = !board

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSave(name.trim(), theme)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{isNew ? 'New Board' : 'Edit Board'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Board name"
              required
              autoFocus
            />
          </label>

          <label>Theme</label>
          <div className="theme-grid">
            {THEMES.map(t => (
              <button
                key={t.id}
                type="button"
                className={`theme-swatch ${theme === t.id ? 'active' : ''}`}
                style={{ background: t.previewBg, color: t.textColor }}
                onClick={() => setTheme(t.id)}
                title={t.label}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">
              {isNew ? 'Create' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

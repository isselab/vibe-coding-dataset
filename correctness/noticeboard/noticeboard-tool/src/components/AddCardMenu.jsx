import { useState, useEffect, useRef } from 'react'
import BoardSelector from './BoardSelector'
import './AddCardMenu.css'

const NOTE_COLORS = [
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Mint', value: '#bbf7d0' },
  { name: 'Blue', value: '#bfdbfe' },
  { name: 'Pink', value: '#fbcfe8' },
  { name: 'Peach', value: '#fed7aa' },
  { name: 'White', value: '#ffffff' },
]

// &begin[Themes]
const THEMES = [
  { id: 'cork',       name: 'Cork',       color: '#b8874a' },
  { id: 'chalkboard', name: 'Chalkboard', color: '#2e4b3e' },
  { id: 'linen',      name: 'Linen',      color: '#f0ebe0' },
  { id: 'ocean',      name: 'Ocean',      color: '#19385a' },
  { id: 'forest',     name: 'Forest',     color: '#294027' },
]
// &end[Themes]

export default function AddCardMenu({
  isAdmin, onAddCard, onShowLogin, onLogout,
  currentBoard, boards,
  onSelectBoard, onCreateBoard, onRenameBoard, onChangeTheme, onDeleteBoard,
}) {
  const [showColors, setShowColors] = useState(false)
  const [showThemes, setShowThemes] = useState(false)
  const colorsRef = useRef(null)
  const themesRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (colorsRef.current && !colorsRef.current.contains(e.target)) setShowColors(false)
      if (themesRef.current && !themesRef.current.contains(e.target)) setShowThemes(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="toolbar">
      <span className="toolbar-brand">Noticeboard</span>

      {/* &begin[MultiBoard] */}
      <div className="toolbar-center">
        <BoardSelector
          boards={boards}
          currentBoardId={currentBoard?.id}
          isAdmin={isAdmin}
          onSelect={onSelectBoard}
          onCreate={onCreateBoard}
          onRename={onRenameBoard}
          onDelete={onDeleteBoard}
        />
      </div>
      {/* &end[MultiBoard] */}

      <div className="toolbar-actions">
        {/* &begin[Themes] */}
        {isAdmin && currentBoard && (
          <div className="theme-btn-wrapper" ref={themesRef}>
            <button className="toolbar-btn" title="Change theme" onClick={() => setShowThemes(s => !s)}>
              Theme
            </button>
            {showThemes && (
              <div className="theme-picker">
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    className={`theme-option${currentBoard.theme === t.id ? ' active' : ''}`}
                    onClick={() => { onChangeTheme(currentBoard.id, t.id); setShowThemes(false) }}
                  >
                    <div className="theme-swatch" style={{ background: t.color }} />
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {/* &end[Themes] */}

        {/* &begin[CardManagement] */}
        {isAdmin && (
          <div className="note-btn-wrapper" ref={colorsRef}>
            <button className="toolbar-btn" onClick={() => setShowColors(s => !s)}>+ Card</button>
            {showColors && (
              <div className="color-picker">
                {NOTE_COLORS.map(({ name, value }) => (
                  <button key={value} className="color-swatch" style={{ background: value }} title={name}
                    onClick={() => { onAddCard(value); setShowColors(false) }} />
                ))}
              </div>
            )}
          </div>
        )}
        {/* &end[CardManagement] */}

        {/* &begin[AdminAuth] */}
        {isAdmin ? (
          <button className="toolbar-btn toolbar-btn-secondary" onClick={onLogout}>Exit Admin</button>
        ) : (
          <button className="toolbar-btn" onClick={onShowLogin}>Admin Login</button>
        )}
        {/* &end[AdminAuth] */}
      </div>
    </div>
  )
}

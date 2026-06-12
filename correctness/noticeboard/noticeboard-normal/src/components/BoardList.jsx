import { useState } from 'react'
import { THEMES, getTheme } from '../themes'
import BoardModal from './BoardModal'

export default function BoardList({ boards, isAdmin, onEnter, onLogin, onLogout, onCreateBoard, onUpdateBoard, onDeleteBoard }) {
  const [editingBoard, setEditingBoard] = useState(null) // null = closed, 'new' = create, board = edit
  const [confirmDelete, setConfirmDelete] = useState(null)

  function handleSave(name, theme) {
    if (editingBoard === 'new') {
      onCreateBoard(name, theme)
    } else {
      onUpdateBoard(editingBoard.id, { name, theme })
    }
    setEditingBoard(null)
  }

  function handleDelete(board) {
    if (confirmDelete?.id === board.id) {
      onDeleteBoard(board.id)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(board)
    }
  }

  return (
    <div className="board-list-page">
      <div className="board-list-header">
        <h1>Noticeboards</h1>
        <div className="header-actions">
          {isAdmin ? (
            <>
              <button className="btn-primary" onClick={() => setEditingBoard('new')}>+ New Board</button>
              <button className="btn-secondary" onClick={onLogout}>Log out</button>
            </>
          ) : (
            <button className="btn-secondary" onClick={onLogin}>🔒 Admin</button>
          )}
        </div>
      </div>

      {boards.length === 0 && (
        <div className="empty-state">
          {isAdmin
            ? 'No boards yet. Create one to get started.'
            : 'No boards yet.'}
        </div>
      )}

      <div className="board-grid">
        {boards.map(board => {
          const theme = getTheme(board.theme)
          const isConfirming = confirmDelete?.id === board.id
          return (
            <div key={board.id} className="board-tile" onClick={() => onEnter(board.id)}>
              <div
                className="board-tile-preview"
                style={{ background: theme.previewBg }}
              >
                <span className="board-tile-pin">📌</span>
              </div>
              <div className="board-tile-footer">
                <div className="board-tile-name">{board.name}</div>
                <div className="board-tile-theme">{theme.label}</div>
              </div>
              {isAdmin && (
                <div className="board-tile-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className="tile-btn"
                    title="Edit board"
                    onClick={() => setEditingBoard(board)}
                  >✏️</button>
                  <button
                    className={`tile-btn ${isConfirming ? 'danger' : ''}`}
                    title={isConfirming ? 'Click again to confirm' : 'Delete board'}
                    onClick={() => handleDelete(board)}
                    onBlur={() => setConfirmDelete(null)}
                  >
                    {isConfirming ? '⚠️' : '🗑️'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {editingBoard && (
        <BoardModal
          board={editingBoard === 'new' ? null : editingBoard}
          onSave={handleSave}
          onClose={() => setEditingBoard(null)}
        />
      )}
    </div>
  )
}

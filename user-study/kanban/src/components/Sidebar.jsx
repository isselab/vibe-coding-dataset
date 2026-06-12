import { useState } from 'react'

function Sidebar({ boards, selectedBoardId, onSelectBoard, onCreateBoard, onDeleteBoard, onRenameBoard }) {
  const [newName, setNewName] = useState('')
  // &begin[RenameBoard]
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')

  const handleRenameStart = (board) => {
    setRenamingId(board.id)
    setRenameValue(board.name)
  }

  const handleRenameCommit = () => {
    const trimmed = renameValue.trim()
    if (trimmed && renamingId) {
      onRenameBoard(renamingId, trimmed)
    }
    setRenamingId(null)
    setRenameValue('')
  }

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleRenameCommit() }
    if (e.key === 'Escape') { setRenamingId(null) }
  }
  // &end[RenameBoard]

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    onCreateBoard(trimmed)
    setNewName('')
  }

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Boards</h2>
      <ul className="sidebar-board-list">
        {boards.map(board => (
          <li
            key={board.id}
            className={`sidebar-board${board.id === selectedBoardId ? ' sidebar-board--active' : ''}`}
          >
            {/* &begin[RenameBoard] */}
            {renamingId === board.id ? (
              <input
                className="sidebar-board__rename-input"
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onBlur={handleRenameCommit}
                onKeyDown={handleRenameKeyDown}
                autoFocus
              />
            ) : (
              <>
                {/* &begin[SelectBoard] */}
                <button
                  className="sidebar-board-name"
                  onClick={() => onSelectBoard(board.id)}
                >
                  {board.name}
                </button>
                {/* &end[SelectBoard] */}
                <button
                  className="sidebar-board__rename-btn"
                  onClick={() => handleRenameStart(board)}
                  title="Rename board"
                >
                  ✎
                </button>
              </>
            )}
            {/* &end[RenameBoard] */}
            {/* &begin[DeleteBoard] */}
            <button
              className="delete-btn sidebar-board-delete"
              onClick={() => onDeleteBoard(board.id)}
              disabled={boards.length <= 1}
              title="Delete board"
            >
              ×
            </button>
            {/* &end[DeleteBoard] */}
          </li>
        ))}
      </ul>
      {/* &begin[CreateBoard] */}
      <form className="create-board-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="New board name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <button type="submit">+ Add</button>
      </form>
      {/* &end[CreateBoard] */}
    </aside>
  )
}

export default Sidebar

import { useState, useRef, useEffect } from 'react'
import './BoardSelector.css'

// &begin[MultiBoard]
export default function BoardSelector({ boards, currentBoardId, isAdmin, onSelect, onCreate, onRename, onDelete }) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const wrapperRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false); setEditingId(null); setShowCreate(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const currentBoard = boards.find(b => b.id === currentBoardId)

  const startEdit = (board, e) => {
    e.stopPropagation()
    setEditingId(board.id)
    setEditName(board.name)
  }

  const commitEdit = (id) => {
    if (editName.trim()) onRename(id, editName.trim())
    setEditingId(null)
  }

  const handleCreate = () => {
    if (!newName.trim()) return
    onCreate(newName.trim(), 'cork')
    setNewName(''); setShowCreate(false); setIsOpen(false)
  }

  return (
    <div className="board-selector" ref={wrapperRef}>
      <button className="board-selector-btn" onClick={() => setIsOpen(s => !s)}>
        <span>{currentBoard?.name || '—'}</span>
        <span className="board-selector-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="board-dropdown">
          {boards.map(board => (
            <div key={board.id} className={`board-item${board.id === currentBoardId ? ' active' : ''}`}>
              {editingId === board.id ? (
                <input
                  className="board-rename-input"
                  value={editName}
                  autoFocus
                  onChange={e => setEditName(e.target.value)}
                  onBlur={() => commitEdit(board.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitEdit(board.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <button className="board-name-btn" onClick={() => { onSelect(board.id); setIsOpen(false) }}>
                  {board.id === currentBoardId && <span className="board-check">✓</span>}
                  {board.name}
                </button>
              )}
              {isAdmin && editingId !== board.id && (
                <div className="board-item-actions">
                  <button title="Rename" onClick={(e) => startEdit(board, e)}>✏</button>
                  {boards.length > 1 && (
                    <button title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(board.id); setIsOpen(false) }}>🗑</button>
                  )}
                </div>
              )}
            </div>
          ))}
          {isAdmin && (
            <div className="board-create-section">
              {showCreate ? (
                <div className="board-create-form">
                  <input
                    value={newName}
                    autoFocus
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowCreate(false) }}
                    placeholder="Board name"
                  />
                  <button onClick={handleCreate}>Create</button>
                </div>
              ) : (
                <button className="board-create-btn" onClick={() => setShowCreate(true)}>+ New board</button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
// &end[MultiBoard]

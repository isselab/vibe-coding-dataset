import { useState } from 'react'

function TaskCard({ task, onDelete, onMoveTask, onUpdateTask }) {
  const [isDropTarget, setIsDropTarget] = useState(false)

  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', task.id)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDropTarget(true)
  }

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDropTarget(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDropTarget(false)
    const draggedId = e.dataTransfer.getData('taskId')
    if (draggedId && draggedId !== task.id) {
      onMoveTask(draggedId, task.status, task.id)
    }
  }

  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDesc, setEditDesc] = useState(task.description || '')

  const handleEditOpen = () => {
    setEditTitle(task.title)
    setEditDesc(task.description || '')
    setIsEditing(true)
  }

  const handleEditSave = () => {
    const trimmed = editTitle.trim()
    if (!trimmed) return
    onUpdateTask(task.id, { title: trimmed, description: editDesc.trim() })
    setIsEditing(false)
  }

  const handleEditCancel = () => {
    setIsEditing(false)
  }

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleEditSave() }
    if (e.key === 'Escape') handleEditCancel()
  }

  if (isEditing) {
    return (
      <div className="task-card task-card--editing">
        <div className="task-card__edit-form">
          <input
            className="task-card__edit-input"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            placeholder="Task title"
            autoFocus
          />
          <textarea
            className="task-card__edit-textarea"
            value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') handleEditCancel() }}
            placeholder="Description (optional)"
            rows={3}
          />
          <div className="task-card__edit-actions">
            <button className="task-card__edit-btn task-card__edit-btn--save" onClick={handleEditSave}>Save</button>
            <button className="task-card__edit-btn task-card__edit-btn--cancel" onClick={handleEditCancel}>Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`task-card${isDropTarget ? ' task-card--drop-target' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="task-card-header">
        <span className="task-id">#{task.id.slice(0, 8)}</span>
        <div className="task-card-actions">
          <button className="task-card__edit-btn--icon" onClick={handleEditOpen} title="Edit task">✎</button>
          <button className="delete-btn" onClick={() => onDelete(task.id)} title="Delete task">×</button>
        </div>
      </div>
      <h3 className="task-title">{task.title}</h3>
      {task.description && <p className="task-description">{task.description}</p>}
    </div>
  )
}

export default TaskCard

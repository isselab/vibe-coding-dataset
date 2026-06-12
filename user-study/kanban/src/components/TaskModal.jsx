import { useState, useEffect } from 'react'
import { getUrgency } from '../utils'

// &begin[TaskDeadline]
const formatDeadline = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
// &end[TaskDeadline]

// &begin[TaskModal]
function TaskModal({ task, onClose, onUpdateTask }) {
  // &begin[EditTask]
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDesc, setEditDesc] = useState(task.description || '')
  const [editPriority, setEditPriority] = useState(task.priority || 'medium') // &line[TaskPriority]
  const [editDeadline, setEditDeadline] = useState(task.deadline || '') // &line[TaskDeadline]

  const handleEditOpen = () => {
    setEditTitle(task.title)
    setEditDesc(task.description || '')
    setEditPriority(task.priority || 'medium') // &line[TaskPriority]
    setEditDeadline(task.deadline || '') // &line[TaskDeadline]
    setIsEditing(true)
  }

  const handleEditSave = () => {
    const trimmed = editTitle.trim()
    if (!trimmed) return
    onUpdateTask(task.id, {
      title: trimmed,
      description: editDesc.trim(),
      priority: editPriority, // &line[TaskPriority]
      deadline: editDeadline || null, // &line[TaskDeadline]
    })
    setIsEditing(false)
  }

  const handleEditCancel = () => setIsEditing(false)

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleEditSave() }
    if (e.key === 'Escape') handleEditCancel()
  }
  // &end[EditTask]

  // &begin[UrgencyIndicator]
  const urgency = getUrgency(task)
  const URGENCY_LABELS = { critical: 'Critical', high: 'High', normal: 'Normal' }
  // &end[UrgencyIndicator]

  // &begin[TaskDeadline]
  const today = new Date().toISOString().slice(0, 10)
  const isOverdue = task.deadline && task.deadline < today
  const isDueToday = task.deadline && task.deadline === today
  // &end[TaskDeadline]

  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <span className="task-id">#{task.id.slice(0, 8)}</span>
          <button className="modal-close" onClick={onClose} title="Close">×</button>
        </div>
        {/* &begin[EditTask] */}
        {isEditing && (
          <div className="modal-edit-form">
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
              rows={4}
            />
            {/* &begin[TaskPriority] */}
            <select
              className="task-card__edit-input"
              value={editPriority}
              onChange={e => setEditPriority(e.target.value)}
            >
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>
            {/* &end[TaskPriority] */}
            {/* &begin[TaskDeadline] */}
            <input
              className="task-card__edit-input task-card__edit-date"
              type="date"
              value={editDeadline}
              onChange={e => setEditDeadline(e.target.value)}
            />
            {/* &end[TaskDeadline] */}
            <div className="task-card__edit-actions">
              <button className="task-card__edit-btn task-card__edit-btn--save" onClick={handleEditSave}>Save</button>
              <button className="task-card__edit-btn task-card__edit-btn--cancel" onClick={handleEditCancel}>Cancel</button>
            </div>
          </div>
        )}
        {/* &end[EditTask] */}
        {!isEditing && (
          <div className="modal-body">
            <div className="modal-task-meta">
              {/* &begin[UrgencyIndicator] */}
              <span className={`urgency-badge urgency-badge--${urgency}`}>
                {URGENCY_LABELS[urgency]}
              </span>
              {/* &end[UrgencyIndicator] */}
              {/* &begin[TaskDeadline] */}
              {task.deadline && (
                <div className="task-deadline">
                  {isOverdue && <span className="task-deadline__overdue-badge">Overdue</span>}
                  <span className={`task-deadline__date${isDueToday ? ' task-deadline__date--today' : ''}`}>
                    {formatDeadline(task.deadline)}
                  </span>
                </div>
              )}
              {/* &end[TaskDeadline] */}
            </div>
            <h2 className="modal-task-title">{task.title}</h2>
            {task.description && <p className="modal-task-description">{task.description}</p>}
            <div className="modal-actions">
              {/* &begin[EditTask] */}
              <button className="task-card__edit-btn task-card__edit-btn--save" onClick={handleEditOpen}>Edit</button>
              {/* &end[EditTask] */}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
// &end[TaskModal]

export default TaskModal

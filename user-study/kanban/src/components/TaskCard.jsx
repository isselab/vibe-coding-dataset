import { useState } from 'react'
import { getUrgency } from '../utils'

// &begin[TaskCard]
function TaskCard({ task, onMoveTask, onOpenTask }) {
  // &begin[DragDrop]
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
  // &end[DragDrop]

  // &begin[UrgencyIndicator]
  const urgency = getUrgency(task)
  // &end[UrgencyIndicator]

  return (
    <div
      className={`task-card${isDropTarget ? ' task-card--drop-target' : ''}`}
      data-urgency={urgency}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => onOpenTask(task.id)} // &line[TaskModal]
    >
      {/* &begin[UrgencyIndicator] */}
      <div className="task-card-summary">
        <span className="task-id">#{task.id.slice(0, 8)}</span>
        {urgency !== 'normal' && (
          <span className={`urgency-badge urgency-badge--${urgency}`}>
            {urgency === 'critical' ? 'Critical' : 'High'}
          </span>
        )}
      </div>
      {/* &end[UrgencyIndicator] */}
      <h3 className="task-title">{task.title}</h3>
    </div>
  )
}
// &end[TaskCard]

export default TaskCard

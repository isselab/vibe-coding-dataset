import { useState } from 'react'
import TaskCard from './TaskCard'

// &begin[Columns]
function Column({ title, status, tasks, onDeleteTask, onMoveTask, onUpdateTask }) {
  // &begin[DragDrop]
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const taskId = e.dataTransfer.getData('taskId')
    onMoveTask(taskId, status)
  }
  // &end[DragDrop]

  return (
    <div
      className={`column${isDragOver ? ' drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h2 className="column-title">{title}</h2>
      <div className="column-tasks">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onDelete={onDeleteTask} onMoveTask={onMoveTask} onUpdateTask={onUpdateTask} />
        ))}
      </div>
    </div>
  )
}
// &end[Columns]

export default Column

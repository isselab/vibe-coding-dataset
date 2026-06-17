import Column from './Column'

const COLUMN_CONFIG = [
  { title: 'Backlog', status: 'backlog' },
  { title: 'In Progress', status: 'in-progress' },
  { title: 'Done', status: 'done' },
]

function Board({ tasks, onDeleteTask, onMoveTask, onUpdateTask }) {
  return (
    <div className="board">
      {COLUMN_CONFIG.map(col => (
        <Column
          key={col.status}
          title={col.title}
          status={col.status}
          tasks={tasks.filter(t => t.status === col.status)}
          onDeleteTask={onDeleteTask}
          onMoveTask={onMoveTask}
          onUpdateTask={onUpdateTask}
        />
      ))}
    </div>
  )
}

export default Board

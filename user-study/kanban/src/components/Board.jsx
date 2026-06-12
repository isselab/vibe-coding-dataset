import Column from './Column'

const COLUMN_CONFIG = [
  { title: 'Backlog', status: 'backlog' },
  { title: 'In Progress', status: 'in-progress' },
  { title: 'Done', status: 'done' },
]

function Board({ tasks, onMoveTask, onOpenTask }) {
  return (
    <div className="board">
      {COLUMN_CONFIG.map(col => (
        <Column
          key={col.status}
          title={col.title}
          status={col.status}
          tasks={tasks.filter(t => t.status === col.status)}
          onMoveTask={onMoveTask}
          onOpenTask={onOpenTask}
        />
      ))}
    </div>
  )
}

export default Board

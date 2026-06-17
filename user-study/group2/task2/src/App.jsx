import useLocalStorage from './hooks/useLocalStorage'
import Board from './components/Board'
import CreateTaskForm from './components/CreateTaskForm'
import Sidebar from './components/Sidebar'
import './App.css'

// &begin[KanbanBoard]
// &begin[Boards]
const INITIAL_BOARDS = [
  {
    id: 'board-1',
    name: 'My Board',
    tasks: [
      { id: 'a1b2c3d4', title: 'Design wireframes', description: 'Create low-fidelity mockups for the main user flows.', status: 'done' },
      { id: 'e5f6a7b8', title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment.', status: 'done' },
      { id: 'c9d0e1f2', title: 'Implement authentication', description: 'Add login and registration with JWT tokens.', status: 'in-progress' },
      { id: 'a3b4c5d6', title: 'Write API documentation', description: 'Document all REST endpoints using OpenAPI spec.', status: 'in-progress' },
      { id: 'e7f8a9b0', title: 'Add unit tests', description: 'Achieve 80% coverage for core business logic.', status: 'backlog' },
      { id: 'c1d2e3f4', title: 'Performance audit', description: 'Profile and optimise slow database queries.', status: 'backlog' },
      { id: 'a5b6c7d8', title: 'Accessibility review', description: 'Ensure WCAG 2.1 AA compliance across all pages.', status: 'backlog' },
    ],
  },
]
// &end[Boards]

function App() {
  // &begin[Boards]
  // &begin[Persistence]
  const [boards, setBoards] = useLocalStorage('kanban-boards', INITIAL_BOARDS)
  const [selectedBoardId, setSelectedBoardId] = useLocalStorage('kanban-selected-board', INITIAL_BOARDS[0].id)
  // &end[Persistence]
  const selectedBoard = boards.find(b => b.id === selectedBoardId) || boards[0]
  // &end[Boards]

  // &begin[CreateTask]
  const handleCreateTask = (title, description) => {
    setBoards(prev => prev.map(b =>
      b.id === selectedBoardId
        ? { ...b, tasks: [...b.tasks, { id: crypto.randomUUID(), title, description, status: 'backlog' }] }
        : b
    ))
  }
  // &end[CreateTask]

  // &begin[DeleteTask]
  const handleDeleteTask = (id) => {
    setBoards(prev => prev.map(b =>
      b.id === selectedBoardId
        ? { ...b, tasks: b.tasks.filter(task => task.id !== id) }
        : b
    ))
  }
  // &end[DeleteTask]

  // &begin[EditTask]
  const handleUpdateTask = (taskId, updates) => {
    setBoards(prev => prev.map(b =>
      b.id === selectedBoardId
        ? { ...b, tasks: b.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t) }
        : b
    ))
  }
  // &end[EditTask]

  // &begin[DragDrop]
  const handleMoveTask = (taskId, newStatus, targetTaskId) => {
    setBoards(prev => prev.map(b => {
      if (b.id !== selectedBoardId) return b
      const task = b.tasks.find(t => t.id === taskId)
      if (!task) return b
      const updated = { ...task, status: newStatus }
      const without = b.tasks.filter(t => t.id !== taskId)
      if (targetTaskId) {
        const targetIdx = without.findIndex(t => t.id === targetTaskId)
        if (targetIdx >= 0) {
          return { ...b, tasks: [...without.slice(0, targetIdx), updated, ...without.slice(targetIdx)] }
        }
      }
      return { ...b, tasks: [...without, updated] }
    }))
  }
  // &end[DragDrop]

  // &begin[CreateBoard]
  const handleCreateBoard = (name) => {
    const newBoard = { id: crypto.randomUUID(), name, tasks: [] }
    setBoards(prev => [...prev, newBoard])
    setSelectedBoardId(newBoard.id)
  }
  // &end[CreateBoard]

  // &begin[DeleteBoard]
  const handleDeleteBoard = (id) => {
    if (boards.length <= 1) return
    const remaining = boards.filter(b => b.id !== id)
    setBoards(remaining)
    if (selectedBoardId === id) setSelectedBoardId(remaining[0].id)
  }
  // &end[DeleteBoard]

  // &begin[SelectBoard]
  const handleSelectBoard = (id) => {
    setSelectedBoardId(id)
  }
  // &end[SelectBoard]

  // &begin[RenameBoard]
  const handleRenameBoard = (id, newName) => {
    const trimmed = newName.trim()
    if (!trimmed) return
    setBoards(prev => prev.map(b => b.id === id ? { ...b, name: trimmed } : b))
  }
  // &end[RenameBoard]

  return (
    <div className="app">
      <h1>Kanban Board</h1>
      <div className="app-body">
        <Sidebar
          boards={boards}
          selectedBoardId={selectedBoardId}
          onSelectBoard={handleSelectBoard}
          onCreateBoard={handleCreateBoard}
          onDeleteBoard={handleDeleteBoard}
          onRenameBoard={handleRenameBoard}
        />
        <main className="app-main">
          <CreateTaskForm onCreateTask={handleCreateTask} />
          <Board
            tasks={selectedBoard.tasks}
            onDeleteTask={handleDeleteTask}
            onMoveTask={handleMoveTask}
            onUpdateTask={handleUpdateTask}
          />
        </main>
      </div>
    </div>
  )
}

export default App
// &end[KanbanBoard]

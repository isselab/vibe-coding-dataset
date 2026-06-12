import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import Board from './components/Board'
import AdminLogin from './components/AdminLogin'

// &begin[Realtime]
function createSocket() {
  return io('/', { path: '/socket.io' })
}
// &end[Realtime]

// &begin[AdminAuth]
function getSessionId() {
  let id = localStorage.getItem('nb-session')
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('nb-session', id) }
  return id
}
// &end[AdminAuth]

export default function App() {
  // &begin[MultiBoard]
  const [boards, setBoards] = useState([])
  const [currentBoardId, setCurrentBoardId] = useState(null)
  const currentBoardIdRef = useRef(null)
  // &end[MultiBoard]

  // &begin[Realtime]
  const [cards, setCards] = useState([])
  const socketRef = useRef(null)

  useEffect(() => {
    const socket = createSocket()
    socketRef.current = socket

    // &begin[MultiBoard]
    socket.on('boards:list', (list) => {
      setBoards(list)
      const toJoin = currentBoardIdRef.current || list[0]?.id
      if (toJoin) socket.emit('board:join', toJoin, (res = {}) => {
        if (res.ok !== false) { currentBoardIdRef.current = toJoin; setCurrentBoardId(toJoin) }
      })
    })
    socket.on('boards:updated', setBoards)
    socket.on('board:init', (board) => {
      setCards(board.cards)
      setCurrentBoardId(board.id)
      currentBoardIdRef.current = board.id
    })
    socket.on('board:deleted', ({ boardId, fallbackId }) => {
      if (currentBoardIdRef.current === boardId && fallbackId) {
        socket.emit('board:join', fallbackId)
      }
    })
    // &end[MultiBoard]

    socket.on('card:added', (card) => setCards(prev => [...prev, card]))
    socket.on('card:updated', ({ id, updates }) =>
      setCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    )
    socket.on('card:deleted', (id) => setCards(prev => prev.filter(c => c.id !== id)))

    return () => socket.disconnect()
  }, [])
  // &end[Realtime]

  // &begin[AdminAuth]
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const sessionId = useRef(getSessionId()).current
  const adminPasswordRef = useRef(null)

  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return
    socket.on('connect', () => {
      if (adminPasswordRef.current) {
        socket.emit('admin:auth', { password: adminPasswordRef.current }, ({ ok }) => {
          if (!ok) { setIsAdmin(false); adminPasswordRef.current = null }
        })
      }
    })
  }, [])

  const handleLogin = (password) => new Promise((resolve) => {
    socketRef.current?.emit('admin:auth', { password }, ({ ok, error }) => {
      if (ok) { setIsAdmin(true); setShowLogin(false); adminPasswordRef.current = password }
      resolve({ ok, error })
    })
  })

  const handleLogout = () => { setIsAdmin(false); adminPasswordRef.current = null }
  // &end[AdminAuth]

  // &begin[MultiBoard]
  const joinBoard = (boardId) => {
    socketRef.current?.emit('board:join', boardId, (res = {}) => {
      if (res.ok !== false) { currentBoardIdRef.current = boardId; setCurrentBoardId(boardId) }
    })
  }
  const createBoard = (name, theme) => new Promise((resolve) => {
    socketRef.current?.emit('board:create', { name, theme }, (res) => {
      if (res?.ok) joinBoard(res.id)
      resolve(res)
    })
  })
  const renameBoard = (id, name) => socketRef.current?.emit('board:update', { id, name })
  const changeTheme = (id, theme) => socketRef.current?.emit('board:update', { id, theme })
  const deleteBoard = (id) => socketRef.current?.emit('board:delete', { id })
  // &end[MultiBoard]

  const emit = (event, data) => socketRef.current?.emit(event, data)
  const currentBoard = boards.find(b => b.id === currentBoardId) ?? null

  return (
    <>
      <Board
        cards={cards}
        setCards={setCards}
        isAdmin={isAdmin}
        sessionId={sessionId}
        currentBoard={currentBoard}
        boards={boards}
        emit={emit}
        onShowLogin={() => setShowLogin(true)}
        onLogout={handleLogout}
        onSelectBoard={joinBoard}
        onCreateBoard={createBoard}
        onRenameBoard={renameBoard}
        onChangeTheme={changeTheme}
        onDeleteBoard={deleteBoard}
      />
      {/* &begin[AdminAuth] */}
      {showLogin && (
        <AdminLogin onLogin={handleLogin} onClose={() => setShowLogin(false)} />
      )}
      {/* &end[AdminAuth] */}
    </>
  )
}

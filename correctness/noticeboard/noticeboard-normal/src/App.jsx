import { useState, useEffect, useCallback } from 'react'
import {
  getToken, clearToken,
  apiAddCard, apiUpdateCard, apiUploadImage, apiDeleteCard,
  apiCreateBoard, apiUpdateBoard, apiDeleteBoard,
  connectWebSocket,
} from './api'
import BoardList from './components/BoardList'
import Board from './components/Board'
import AdminLogin from './components/AdminLogin'
import './App.css'

function randomRotation() { return (Math.random() - 0.5) * 8 }
function randomPosition() {
  return {
    x: 80 + Math.random() * Math.max(100, window.innerWidth - 380),
    y: 60 + Math.random() * Math.max(100, window.innerHeight - 360),
  }
}

export default function App() {
  const [boards, setBoards] = useState([])
  const [cardsByBoard, setCardsByBoard] = useState({})
  const [isAdmin, setIsAdmin] = useState(!!getToken())
  const [showLogin, setShowLogin] = useState(false)
  const [currentBoardId, setCurrentBoardId] = useState(
    () => window.location.hash.slice(1) || null
  )

  // Sync URL hash → current board
  useEffect(() => {
    function onHashChange() {
      setCurrentBoardId(window.location.hash.slice(1) || null)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // WebSocket
  useEffect(() => {
    const ws = connectWebSocket(msg => {
      if (msg.type === 'init') {
        setBoards(msg.boards)
        const byBoard = {}
        for (const card of msg.cards) {
          if (!byBoard[card.boardId]) byBoard[card.boardId] = []
          byBoard[card.boardId].push(card)
        }
        setCardsByBoard(byBoard)
      } else if (msg.type === 'boards') {
        setBoards(msg.boards)
      } else if (msg.type === 'cards') {
        setCardsByBoard(prev => ({ ...prev, [msg.boardId]: msg.cards }))
      }
    })
    return () => ws.close()
  }, [])

  function navigateTo(boardId) {
    window.location.hash = boardId || ''
  }

  // ── Board operations ─────────────────────────────────────
  const handleCreateBoard = useCallback(async (name, theme) => {
    const board = await apiCreateBoard({ name, theme })
    navigateTo(board.id)
  }, [])

  const handleUpdateBoard = useCallback((id, patch) => apiUpdateBoard(id, patch), [])

  const handleDeleteBoard = useCallback(async (id) => {
    await apiDeleteBoard(id)
    if (currentBoardId === id) navigateTo(null)
  }, [currentBoardId])

  // ── Card operations ──────────────────────────────────────
  const handleAddCard = useCallback(async (boardId) => {
    const pos = randomPosition()
    await apiAddCard({ boardId, ...pos, rotation: randomRotation() })
  }, [])

  const handleUpdateCard = useCallback(async (id, patch) => {
    if (patch.imageFile) {
      const { imageFile, ...rest } = patch
      await apiUploadImage(id, imageFile)
      if (Object.keys(rest).length) await apiUpdateCard(id, rest)
    } else {
      await apiUpdateCard(id, patch)
    }
  }, [])

  const handleDeleteCard = useCallback(id => apiDeleteCard(id), [])

  const handleReact = useCallback((cardId, emoji, delta) => {
    apiUpdateCard(cardId, { reactionDelta: { emoji, delta } })
  }, [])

  function handleLogout() {
    clearToken()
    setIsAdmin(false)
  }

  const currentBoard = boards.find(b => b.id === currentBoardId) ?? null
  const currentCards = cardsByBoard[currentBoardId] ?? []

  return (
    <>
      {currentBoardId && currentBoard ? (
        <Board
          board={currentBoard}
          cards={currentCards}
          isAdmin={isAdmin}
          onBack={() => navigateTo(null)}
          onAddCard={() => handleAddCard(currentBoardId)}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
          onReact={handleReact}
          onLogout={handleLogout}
        />
      ) : (
        <BoardList
          boards={boards}
          isAdmin={isAdmin}
          onEnter={navigateTo}
          onLogin={() => setShowLogin(true)}
          onLogout={handleLogout}
          onCreateBoard={handleCreateBoard}
          onUpdateBoard={handleUpdateBoard}
          onDeleteBoard={handleDeleteBoard}
        />
      )}

      {showLogin && (
        <AdminLogin
          onSuccess={() => { setIsAdmin(true); setShowLogin(false) }}
          onClose={() => setShowLogin(false)}
        />
      )}
    </>
  )
}

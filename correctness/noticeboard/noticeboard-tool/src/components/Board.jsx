import { useRef, useEffect } from 'react'
import Card from './Card'
import AddCardMenu from './AddCardMenu'
import './Board.css'

export default function Board({
  cards, setCards, isAdmin, sessionId,
  currentBoard, boards, emit,
  onShowLogin, onLogout,
  onSelectBoard, onCreateBoard, onRenameBoard, onChangeTheme, onDeleteBoard,
}) {
  const boardId = currentBoard?.id

  // &begin[DragAndDrop]
  const dragRef = useRef(null)

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragRef.current) return
      const { cardId, offsetX, offsetY } = dragRef.current
      document.body.style.cursor = 'grabbing'
      setCards(prev => prev.map(c =>
        c.id === cardId ? { ...c, x: e.clientX - offsetX, y: e.clientY - offsetY } : c
      ))
    }
    const onMouseUp = (e) => {
      if (!dragRef.current) return
      const { cardId, offsetX, offsetY } = dragRef.current
      emit('card:update', { boardId, id: cardId, updates: { x: e.clientX - offsetX, y: e.clientY - offsetY } })
      dragRef.current = null
      document.body.style.cursor = ''
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [setCards, emit, boardId])

  const startDrag = (e, cardId) => {
    if (e.button !== 0 || !isAdmin) return
    const card = cards.find(c => c.id === cardId)
    if (!card) return
    dragRef.current = { cardId, offsetX: e.clientX - card.x, offsetY: e.clientY - card.y }
    setCards(prev => {
      const c = prev.find(c => c.id === cardId)
      return c ? [...prev.filter(c => c.id !== cardId), c] : prev
    })
    e.preventDefault()
  }
  // &end[DragAndDrop]

  // &begin[CardManagement]
  const addCard = (color) => {
    emit('card:add', {
      boardId,
      x: 80 + Math.random() * (window.innerWidth - 380),
      y: 80 + Math.random() * (window.innerHeight - 360),
      rotation: (Math.random() - 0.5) * 6,
      color, text: '', imageUrl: null,
    })
  }
  const updateCard = (id, updates) => emit('card:update', { boardId, id, updates })
  const removeCard = (id) => emit('card:delete', { boardId, id })
  // &end[CardManagement]

  // &begin[Reactions]
  const toggleReaction = (cardId, emoji) => emit('reaction:toggle', { boardId, cardId, emoji, sessionId })
  // &end[Reactions]

  // &begin[Themes]
  const themeClass = currentBoard?.theme ? `theme-${currentBoard.theme}` : 'theme-cork'
  // &end[Themes]

  return (
    <div className={`board ${themeClass}`}>
      {/* &line[CardManagement] */}
      <AddCardMenu
        isAdmin={isAdmin}
        onAddCard={addCard}
        onShowLogin={onShowLogin}
        onLogout={onLogout}
        currentBoard={currentBoard}
        boards={boards}
        onSelectBoard={onSelectBoard}
        onCreateBoard={onCreateBoard}
        onRenameBoard={onRenameBoard}
        onChangeTheme={onChangeTheme}
        onDeleteBoard={onDeleteBoard}
      />
      {cards.map(card => (
        <Card
          key={card.id}
          card={card}
          isAdmin={isAdmin}
          sessionId={sessionId}
          onMouseDown={(e) => startDrag(e, card.id)}
          onUpdate={(updates) => updateCard(card.id, updates)}
          onRemove={() => removeCard(card.id)}
          onReact={(emoji) => toggleReaction(card.id, emoji)}
        />
      ))}
    </div>
  )
}

import { useState, useCallback, useRef } from 'react'
import Card from './Card'

let nextZ = 100

export default function Board({ board, cards, isAdmin, onBack, onAddCard, onUpdateCard, onDeleteCard, onReact, onLogout }) {
  const [zMap, setZMap] = useState({})

  const handleFocus = useCallback((id) => {
    nextZ += 1
    setZMap(prev => ({ ...prev, [id]: nextZ }))
  }, [])

  return (
    <div className="board" data-theme={board.theme}>
      {cards.map(card => (
        <Card
          key={card.id}
          card={card}
          isAdmin={isAdmin}
          onUpdate={onUpdateCard}
          onDelete={onDeleteCard}
          onReact={onReact}
          zIndex={zMap[card.id] ?? 1}
          onFocus={() => handleFocus(card.id)}
        />
      ))}

      <div className="toolbar">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <span className="toolbar-title">{board.name}</span>
        {isAdmin && (
          <>
            <button className="btn-add" onClick={onAddCard}>📌 Add Card</button>
            <button className="btn-logout" onClick={onLogout}>Log out</button>
          </>
        )}
      </div>
    </div>
  )
}

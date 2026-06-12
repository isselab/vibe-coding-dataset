import { useState, useRef, useEffect } from 'react'
import Draggable from 'react-draggable'

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '👍', '🔥']

function getMyReactions() {
  try {
    return JSON.parse(localStorage.getItem('nb-my-reactions') || '{}')
  } catch { return {} }
}

function saveMyReactions(data) {
  localStorage.setItem('nb-my-reactions', JSON.stringify(data))
}

export default function Card({ card, isAdmin, onUpdate, onDelete, onReact, zIndex, onFocus }) {
  const nodeRef = useRef(null)
  const fileRef = useRef(null)
  const wasDragging = useRef(false)
  const [pos, setPos] = useState({ x: card.x, y: card.y })
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (!dragging) setPos({ x: card.x, y: card.y })
  }, [card.x, card.y, dragging])

  function handleReact(emoji) {
    const all = getMyReactions()
    const mine = new Set(all[card.id] || [])
    const already = mine.has(emoji)
    already ? mine.delete(emoji) : mine.add(emoji)
    all[card.id] = [...mine]
    saveMyReactions(all)
    onReact(card.id, emoji, already ? -1 : 1)
  }

  function handleImageClick() {
    if (isAdmin && !wasDragging.current) fileRef.current?.click()
  }

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    onUpdate(card.id, { imageFile: file })
    e.target.value = ''
  }

  const mine = new Set(getMyReactions()[card.id] || [])

  const cardBody = (
    <div className="card-rotate" style={{ transform: `rotate(${card.rotation}deg)` }}>
      <div className="pin" />
      <div className="card" style={{ background: card.imageUrl ? '#fafafa' : (card.color || '#fefce8') }}>

        {/* Image area — always rendered in admin so they can add a photo, hidden for visitors if empty */}
        {(card.imageUrl || isAdmin) && (
          <div
            className={`card-img-area ${card.imageUrl ? 'has-image' : ''} ${isAdmin ? 'clickable' : ''}`}
            onClick={handleImageClick}
            title={isAdmin ? (card.imageUrl ? 'Click to change photo' : 'Click to add photo') : undefined}
          >
            {card.imageUrl
              ? <img src={card.imageUrl} alt="" draggable={false} />
              : <div className="upload-hint"><span>📷</span><span>Add photo</span></div>
            }
          </div>
        )}

        {/* Text area */}
        {(isAdmin || card.text) && (
          <textarea
            className="card-text"
            value={card.text}
            placeholder={isAdmin ? 'Write something…' : ''}
            readOnly={!isAdmin}
            onChange={e => onUpdate(card.id, { text: e.target.value })}
          />
        )}

        {/* Color swatches — admin only, only when no image */}
        {isAdmin && !card.imageUrl && (
          <div className="color-row">
            {['#fefce8', '#dcfce7', '#dbeafe', '#fce7f3', '#ede9fe', '#ffedd5'].map(c => (
              <button
                key={c}
                className={`color-dot ${card.color === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => onUpdate(card.id, { color: c })}
              />
            ))}
          </div>
        )}

        {/* Reaction bar */}
        <div className="reaction-bar">
          {REACTION_EMOJIS.map(emoji => {
            const count = Math.max(0, card.reactions?.[emoji] || 0)
            return (
              <button
                key={emoji}
                className={`reaction-btn ${mine.has(emoji) ? 'reacted' : ''}`}
                onClick={() => handleReact(emoji)}
                title={`React with ${emoji}`}
              >
                <span className="reaction-emoji">{emoji}</span>
                {count > 0 && <span className="reaction-count">{count}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {isAdmin && (
        <>
          <button className="delete-btn" onClick={() => onDelete(card.id)}>×</button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden-input" onChange={handleFile} />
        </>
      )}
    </div>
  )

  if (!isAdmin) {
    return (
      <div
        className="card-outer"
        style={{ position: 'absolute', left: card.x, top: card.y, zIndex }}
        onMouseDown={onFocus}
      >
        {cardBody}
      </div>
    )
  }

  return (
    <Draggable
      nodeRef={nodeRef}
      position={pos}
      onStart={() => { setDragging(true); wasDragging.current = false; onFocus() }}
      onDrag={(_, d) => { wasDragging.current = true; setPos({ x: d.x, y: d.y }) }}
      onStop={(_, d) => {
        setDragging(false)
        onUpdate(card.id, { x: d.x, y: d.y })
        setTimeout(() => { wasDragging.current = false }, 0)
      }}
      cancel="textarea,input,button,.reaction-bar"
    >
      <div
        ref={nodeRef}
        className="card-outer"
        style={{ position: 'absolute', left: 0, top: 0, zIndex, cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={onFocus}
      >
        {cardBody}
      </div>
    </Draggable>
  )
}

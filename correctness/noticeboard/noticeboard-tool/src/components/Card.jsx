import { useState, useRef, useEffect } from 'react'
import './Card.css'

const CARD_COLORS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa', '#ffffff']
const REACTION_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🔥']

// &begin[Card]
export default function Card({ card, isAdmin, sessionId, onMouseDown, onUpdate, onRemove, onReact }) {
  const fileRef = useRef(null)
  const [showColorPicker, setShowColorPicker] = useState(false)

  // &begin[Card]
  // Local text avoids round-tripping every keystroke through the server
  const [localText, setLocalText] = useState(card.text || '')
  const textFocused = useRef(false)
  useEffect(() => {
    if (!textFocused.current) setLocalText(card.text || '')
  }, [card.text])
  // &end[Card]

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error()
      const { url } = await res.json()
      onUpdate({ imageUrl: url })
    } catch {
      alert('Image upload failed — is the server running?')
    }
    e.target.value = ''
  }

  const stopDrag = (e) => e.stopPropagation()

  return (
    <div
      className={`card${isAdmin ? ' card-admin' : ''}`}
      style={{ left: `${card.x}px`, top: `${card.y}px`, transform: `rotate(${card.rotation}deg)`, '--card-color': card.color }}
      onMouseDown={isAdmin ? onMouseDown : undefined}
    >
      <div className="card-pin" />

      {isAdmin && (
        <div className="card-admin-bar" onMouseDown={stopDrag}>
          <div className="card-color-trigger" onClick={() => setShowColorPicker(s => !s)}>
            <div className="card-color-preview" style={{ background: card.color }} />
            {showColorPicker && (
              <div className="card-color-picker">
                {CARD_COLORS.map(c => (
                  <button key={c} className="color-dot" style={{ background: c }}
                    onClick={(e) => { e.stopPropagation(); onUpdate({ color: c }); setShowColorPicker(false) }} />
                ))}
              </div>
            )}
          </div>
          <button className="card-delete-btn" onClick={onRemove}>×</button>
        </div>
      )}

      {isAdmin ? (
        <div className="card-image-admin" onMouseDown={stopDrag}>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
          {card.imageUrl ? (
            <div className="card-image-wrapper">
              <img src={card.imageUrl} alt="" draggable={false} />
              <div className="card-image-overlay">
                <button onClick={() => fileRef.current.click()}>Change</button>
                <button onClick={() => onUpdate({ imageUrl: null })}>Remove</button>
              </div>
            </div>
          ) : (
            <button className="card-upload-zone" onClick={() => fileRef.current.click()}>
              + Add image
            </button>
          )}
        </div>
      ) : (
        card.imageUrl && <img className="card-image" src={card.imageUrl} alt="" draggable={false} />
      )}

      {isAdmin ? (
        <textarea
          className="card-textarea"
          value={localText}
          onChange={e => setLocalText(e.target.value)}
          onFocus={() => { textFocused.current = true }}
          onBlur={() => { textFocused.current = false; if (localText !== card.text) onUpdate({ text: localText }) }}
          onMouseDown={stopDrag}
          placeholder="Write something..."
          autoFocus={!card.text && !card.imageUrl}
        />
      ) : (
        card.text && <p className="card-text">{card.text}</p>
      )}

      {/* &begin[Reactions] */}
      <CardReactions reactions={card.reactions} sessionId={sessionId} onReact={onReact} />
      {/* &end[Reactions] */}
    </div>
  )
}
// &end[Card]

// &begin[Reactions]
function CardReactions({ reactions, sessionId, onReact }) {
  const [showPicker, setShowPicker] = useState(false)
  const stopDrag = (e) => e.stopPropagation()

  const myReactions = new Set(
    Object.entries(reactions || {})
      .filter(([, data]) => data.sessions.includes(sessionId))
      .map(([emoji]) => emoji)
  )

  const existing = Object.entries(reactions || {}).filter(([, d]) => d.count > 0)

  return (
    <div className="card-reactions" onMouseDown={stopDrag}>
      {existing.map(([emoji, data]) => (
        <button
          key={emoji}
          className={`reaction-chip${myReactions.has(emoji) ? ' reacted' : ''}`}
          onClick={() => onReact(emoji)}
        >
          {emoji} <span>{data.count}</span>
        </button>
      ))}
      <div className="reaction-picker-wrap">
        <button className="reaction-add" onClick={() => setShowPicker(s => !s)}>
          {showPicker ? '×' : '＋'}
        </button>
        {showPicker && (
          <div className="reaction-picker">
            {REACTION_EMOJIS.map(emoji => (
              <button
                key={emoji}
                className={myReactions.has(emoji) ? 'reacted' : ''}
                onClick={() => { onReact(emoji); setShowPicker(false) }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
// &end[Reactions]

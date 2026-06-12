import { useState, useRef, useEffect, useCallback } from 'react'
import TimerCard from './TimerCard'
import StopwatchCard from './StopwatchCard'
import './App.css'

let nextId = 1

const IGNORE_KEYS = new Set([
  'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab',
  'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',
])

export default function App() {
  const [items, setItems] = useState([{ id: nextId++, type: 'timer' }])
  // bindings: { [key]: { id, action: 'primary' | 'secondary' } }
  const [bindings, setBindings] = useState({})
  // listening: { id, action } | null
  const [listening, setListening] = useState(null)

  const audioCtxRef = useRef(null)
  const cardRefs = useRef({})

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioCtxRef.current
  }

  const addTimer = () => setItems(prev => [...prev, { id: nextId++, type: 'timer' }])
  const addStopwatch = () => setItems(prev => [...prev, { id: nextId++, type: 'stopwatch' }])

  const removeItem = (id) => {
    delete cardRefs.current[id]
    setItems(prev => prev.filter(i => i.id !== id))
    setBindings(prev => Object.fromEntries(Object.entries(prev).filter(([, v]) => v.id !== id)))
    if (listening?.id === id) setListening(null)
  }

  const getBoundKey = (id, action) =>
    Object.entries(bindings).find(([, v]) => v.id === id && v.action === action)?.[0] ?? null

  const clearBind = useCallback((id, action) => {
    setBindings(prev =>
      Object.fromEntries(Object.entries(prev).filter(([, v]) => !(v.id === id && v.action === action)))
    )
  }, [])

  // Build the bind-props object for one action slot on one card
  const makeBindProps = (id, action) => ({
    boundKey: getBoundKey(id, action),
    isListening: listening?.id === id && listening?.action === action,
    onBind: () => setListening({ id, action }),
    onClear: () => clearBind(id, action),
  })

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (listening !== null) {
        if (e.key === 'Escape') { setListening(null); return }
        if (IGNORE_KEYS.has(e.key)) return
        e.preventDefault()
        const { id, action } = listening
        setBindings(prev => {
          // Remove any existing binding for this slot and for this key
          const next = Object.fromEntries(
            Object.entries(prev).filter(([k, v]) => !(v.id === id && v.action === action) && k !== e.key)
          )
          next[e.key] = { id, action }
          return next
        })
        setListening(null)
        return
      }

      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      const binding = bindings[e.key]
      if (binding != null && cardRefs.current[binding.id]) {
        e.preventDefault()
        if (binding.action === 'primary') cardRefs.current[binding.id].triggerPrimary()
        else cardRefs.current[binding.id].triggerSecondary()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [listening, bindings])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Timers</h1>
        <div className="header-actions">
          <button className="btn-add" onClick={addTimer}>+ Timer</button>
          <button className="btn-add sw-add" onClick={addStopwatch}>+ Stopwatch</button>
        </div>
      </header>

      {listening !== null && (
        <div className="listening-banner">
          Press any key to bind — <kbd>Esc</kbd> to cancel
        </div>
      )}

      <div className="timer-list">
        {items.map(item =>
          item.type === 'timer' ? (
            <TimerCard
              key={item.id}
              ref={el => { cardRefs.current[item.id] = el }}
              id={item.id}
              getAudioCtx={getAudioCtx}
              onRemove={removeItem}
              primaryBind={makeBindProps(item.id, 'primary')}
              secondaryBind={makeBindProps(item.id, 'secondary')}
            />
          ) : (
            <StopwatchCard
              key={item.id}
              ref={el => { cardRefs.current[item.id] = el }}
              id={item.id}
              onRemove={removeItem}
              primaryBind={makeBindProps(item.id, 'primary')}
              secondaryBind={makeBindProps(item.id, 'secondary')}
            />
          )
        )}
      </div>
    </div>
  )
}

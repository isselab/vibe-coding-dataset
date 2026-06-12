import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import KeyBind from './KeyBind'

function pad(n) {
  return String(n).padStart(2, '0')
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const cs = Math.floor((ms % 1000) / 10)
  const s = totalSeconds % 60
  const m = Math.floor(totalSeconds / 60) % 60
  const h = Math.floor(totalSeconds / 3600)
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}.${pad(cs)}`
}

const StopwatchCard = forwardRef(function StopwatchCard(
  { id, onRemove, primaryBind, secondaryBind },
  ref
) {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [label, setLabel] = useState('')
  const [laps, setLaps] = useState([])

  const startTimeRef = useRef(null)
  const accumulatedRef = useRef(0)
  const rafRef = useRef(null)
  const elapsedRef = useRef(0)

  const tick = useCallback(() => {
    const now = accumulatedRef.current + (Date.now() - startTimeRef.current)
    elapsedRef.current = now
    setElapsed(now)
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const handleStart = () => {
    startTimeRef.current = Date.now()
    setRunning(true)
    rafRef.current = requestAnimationFrame(tick)
  }

  const handlePause = () => {
    accumulatedRef.current += Date.now() - startTimeRef.current
    cancelAnimationFrame(rafRef.current)
    setRunning(false)
  }

  const handleReset = () => {
    cancelAnimationFrame(rafRef.current)
    accumulatedRef.current = 0
    elapsedRef.current = 0
    startTimeRef.current = null
    setElapsed(0)
    setRunning(false)
    setLaps([])
  }

  const handleLap = () => {
    const now = elapsedRef.current
    setLaps(prev => {
      const lastTotal = prev.length > 0 ? prev[prev.length - 1].total : 0
      return [...prev, { number: prev.length + 1, split: now - lastTotal, total: now }]
    })
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  // triggerPrimary: start / pause / resume
  const primaryRef = useRef(null)
  primaryRef.current = () => {
    if (running) handlePause()
    else handleStart()
  }

  // triggerSecondary: lap while running, reset while stopped
  const secondaryRef = useRef(null)
  secondaryRef.current = () => {
    if (running) handleLap()
    else handleReset()
  }

  useImperativeHandle(ref, () => ({
    triggerPrimary:   () => primaryRef.current(),
    triggerSecondary: () => secondaryRef.current(),
  }), [])

  const progress = (elapsed / 1000 % 60) / 60
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="timer-card stopwatch-card">
      <div className="card-header">
        <input
          className="label-input"
          placeholder="Stopwatch name..."
          value={label}
          onChange={e => setLabel(e.target.value)}
        />
        <KeyBind {...primaryBind} icon="▶" title="Start / Pause" />
        <KeyBind {...secondaryBind} icon="◎" title="Lap / Reset" />
        <button className="btn-remove" onClick={() => onRemove(id)} aria-label="Remove stopwatch">✕</button>
      </div>

      <div className="card-body">
        <div className="ring-wrap">
          <svg width="116" height="116" viewBox="0 0 116 116">
            <circle cx="58" cy="58" r={radius} className="ring-track" />
            <circle
              cx="58" cy="58" r={radius}
              className="ring-progress sw-ring"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 58 58)"
            />
          </svg>
          <div className="ring-label">
            <span className="time-text">{formatTime(elapsed)}</span>
          </div>
        </div>

        <div className="card-right">
          <div className="controls">
            {!running && (
              <button className="btn primary sw-btn" onClick={handleStart}>
                {elapsed === 0 ? 'Start' : 'Resume'}
              </button>
            )}
            {running && (
              <>
                <button className="btn secondary" onClick={handlePause}>Pause</button>
                <button className="btn ghost sw-lap" onClick={handleLap}>Lap</button>
              </>
            )}
            {elapsed > 0 && !running && (
              <button className="btn ghost" onClick={handleReset}>Reset</button>
            )}
          </div>
        </div>
      </div>

      {laps.length > 0 && (
        <div className="lap-list">
          <div className="lap-header">
            <span>Lap</span>
            <span>Split</span>
            <span>Total</span>
          </div>
          {[...laps].reverse().map(lap => (
            <div key={lap.number} className={`lap-row${lap.number === laps.length ? ' lap-latest' : ''}`}>
              <span className="lap-num">#{lap.number}</span>
              <span className="lap-split">{formatTime(lap.split)}</span>
              <span className="lap-total">{formatTime(lap.total)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

export default StopwatchCard

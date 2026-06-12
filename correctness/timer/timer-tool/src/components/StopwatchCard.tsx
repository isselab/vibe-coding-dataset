import { useState, useEffect, useCallback, useRef } from 'react'
import { useKeyBinding, formatKey } from '../hooks/useKeyBinding'

interface Props {
  id: string
  watchNumber: number
  onRemove: (id: string) => void
}

type Status = 'idle' | 'running' | 'paused'

// &begin[Laps]
interface Lap {
  number: number
  split: number  // elapsed since previous lap (ms)
  total: number  // cumulative elapsed (ms)
}
// &end[Laps]

// &begin[CountUp]
function formatElapsed(ms: number): string {
  const tenths = Math.floor(ms / 100) % 10
  const totalSecs = Math.floor(ms / 1000)
  const s = totalSecs % 60
  const m = Math.floor(totalSecs / 60) % 60
  const h = Math.floor(totalSecs / 3600)
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${tenths}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${tenths}`
}
// &end[CountUp]

export default function StopwatchCard({ id, watchNumber, onRemove }: Props) {
  // &begin[CountUp]
  const [elapsed, setElapsed] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const startTimeRef = useRef<number>(0)
  const baseElapsedRef = useRef<number>(0)
  // &end[CountUp]

  // &begin[Laps]
  const [laps, setLaps] = useState<Lap[]>([])
  const lastLapTimeRef = useRef<number>(0)
  // &end[Laps]

  // &begin[CountUp]
  useEffect(() => {
    if (status !== 'running') return
    startTimeRef.current = Date.now()
    const timerId = setInterval(() => {
      setElapsed(baseElapsedRef.current + (Date.now() - startTimeRef.current))
    }, 100)
    return () => clearInterval(timerId)
  }, [status])

  const handleStart = useCallback(() => setStatus('running'), [])

  const handlePause = useCallback(() => {
    baseElapsedRef.current += Date.now() - startTimeRef.current
    setElapsed(baseElapsedRef.current)
    setStatus('paused')
  }, [])

  const handleReset = useCallback(() => {
    baseElapsedRef.current = 0
    setElapsed(0)
    setStatus('idle')
    setLaps([])                  // &line[Laps]
    lastLapTimeRef.current = 0   // &line[Laps]
  }, [])
  // &end[CountUp]

  // &begin[Laps]
  const handleLap = useCallback(() => {
    const current = baseElapsedRef.current + (Date.now() - startTimeRef.current)
    const split = current - lastLapTimeRef.current
    lastLapTimeRef.current = current
    setLaps(prev => [...prev, { number: prev.length + 1, split, total: current }])
  }, [])
  // &end[Laps]

  // &begin[KeyBinding]
  const primaryAction = useCallback(() => {
    if (status === 'idle' || status === 'paused') handleStart()
    else if (status === 'running') handleLap()
  }, [status, handleStart, handleLap])

  const { boundKey, isListening, startListening, clearBinding } = useKeyBinding(primaryAction)
  // &end[KeyBinding]

  return (
    <div className="timer-card stopwatch-card">
      <button
        className="remove-btn"
        onClick={() => onRemove(id)}
        aria-label="Remove stopwatch"
      >
        ×
      </button>
      <div className="timer-number">Stopwatch {watchNumber}</div>

      {/* &begin[CountUp] */}
      <div className="time-display">{formatElapsed(elapsed)}</div>
      <div className="timer-actions">
        {(status === 'idle' || status === 'paused') && (
          <button className="btn start" onClick={handleStart}>
            {status === 'idle' ? 'Start' : 'Resume'}
          </button>
        )}
        {/* &begin[Laps] */}
        {status === 'running' && (
          <button className="btn start" onClick={handleLap}>
            Lap
          </button>
        )}
        {/* &end[Laps] */}
        {status === 'running' && (
          <button className="btn secondary" onClick={handlePause}>
            Pause
          </button>
        )}
        {status !== 'idle' && (
          <button className="btn ghost" onClick={handleReset}>
            Reset
          </button>
        )}
      </div>
      {/* &end[CountUp] */}

      {/* &begin[Laps] */}
      {laps.length > 0 && (
        <ol className="laps-list">
          {[...laps].reverse().map(lap => (
            <li key={lap.number} className="lap-item">
              <span className="lap-number">#{lap.number}</span>
              <span className="lap-split">{formatElapsed(lap.split)}</span>
              <span className="lap-total">{formatElapsed(lap.total)}</span>
            </li>
          ))}
        </ol>
      )}
      {/* &end[Laps] */}

      {/* &begin[KeyBinding] */}
      <div className="key-binding">
        {isListening ? (
          <span className="key-bind-btn listening">Press any key…</span>
        ) : boundKey ? (
          <span className="key-chip" onClick={startListening} role="button" tabIndex={0}>
            {formatKey(boundKey)}
            <button
              className="key-chip-clear"
              onClick={e => { e.stopPropagation(); clearBinding() }}
              aria-label="Remove key binding"
            >
              ×
            </button>
          </span>
        ) : (
          <button className="key-bind-btn" onClick={startListening}>Bind key</button>
        )}
      </div>
      {/* &end[KeyBinding] */}
    </div>
  )
}

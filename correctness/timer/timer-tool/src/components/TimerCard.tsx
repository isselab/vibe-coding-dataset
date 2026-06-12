import { useState, useEffect, useCallback } from 'react'
import { useAlarm } from '../hooks/useAlarm'
import { useKeyBinding, formatKey } from '../hooks/useKeyBinding'

interface Props {
  id: string
  timerNumber: number
  onRemove: (id: string) => void
}

type Status = 'idle' | 'running' | 'paused' | 'finished'

const DEFAULT_MINUTES = 5

// &begin[SetDuration]
function toSeconds(h: number, m: number, s: number): number {
  return h * 3600 + m * 60 + s
}
// &end[SetDuration]

// &begin[Countdown]
function formatTime(totalSecs: number): string {
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}
// &end[Countdown]

export default function TimerCard({ id, timerNumber, onRemove }: Props) {
  // &begin[SetDuration]
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES)
  const [seconds, setSeconds] = useState(0)
  const [totalDuration, setTotalDuration] = useState(DEFAULT_MINUTES * 60)
  // &end[SetDuration]

  // &begin[Countdown]
  const [remaining, setRemaining] = useState(DEFAULT_MINUTES * 60)
  const [status, setStatus] = useState<Status>('idle')
  // &end[Countdown]

  // &begin[Alarm]
  const { play: playAlarm, init: initAlarm } = useAlarm()
  // &end[Alarm]

  // &begin[Countdown]
  useEffect(() => {
    if (status !== 'running') return
    const timerId = setInterval(() => {
      setRemaining(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timerId)
  }, [status])

  useEffect(() => {
    if (status === 'running' && remaining === 0) {
      setStatus('finished')
    }
  }, [status, remaining])
  // &end[Countdown]

  // &begin[Alarm]
  useEffect(() => {
    if (status === 'finished') playAlarm()
  }, [status, playAlarm])
  // &end[Alarm]

  // &begin[SetDuration]
  const handleDurationInput = useCallback((h: number, m: number, s: number) => {
    setHours(h)
    setMinutes(m)
    setSeconds(s)
    setRemaining(toSeconds(h, m, s))
  }, [])

  const handleStart = useCallback(() => {
    const total = toSeconds(hours, minutes, seconds)
    if (total === 0) return
    initAlarm()
    setTotalDuration(total)
    setRemaining(total)
    setStatus('running')
  }, [hours, minutes, seconds, initAlarm])

  const handleReset = useCallback(() => {
    setStatus('idle')
    setRemaining(toSeconds(hours, minutes, seconds))
  }, [hours, minutes, seconds])
  // &end[SetDuration]

  // &begin[Countdown]
  const handlePause = useCallback(() => setStatus('paused'), [])
  const handleResume = useCallback(() => setStatus('running'), [])
  // &end[Countdown]

  // &begin[KeyBinding]
  const primaryAction = useCallback(() => {
    if (status === 'idle') handleStart()
    else if (status === 'running') handlePause()
    else if (status === 'paused') handleResume()
    else if (status === 'finished') handleReset()
  }, [status, handleStart, handlePause, handleResume, handleReset])

  const { boundKey, isListening, startListening, clearBinding } = useKeyBinding(primaryAction)
  // &end[KeyBinding]

  const progress = totalDuration > 0 ? (remaining / totalDuration) * 100 : 100

  return (
    <div className={`timer-card${status === 'finished' ? ' finished' : ''}`}>
      <button
        className="remove-btn"
        onClick={() => onRemove(id)}
        aria-label="Remove timer"
      >
        ×
      </button>

      <div className="timer-number">Timer {timerNumber}</div>

      {/* &begin[Countdown] */}
      <div className="time-display">{formatTime(remaining)}</div>
      {/* &end[Countdown] */}

      {/* &begin[Alarm] */}
      {status === 'finished' && <div className="alarm-badge">Time's up!</div>}
      {/* &end[Alarm] */}

      {/* &begin[SetDuration] */}
      {status === 'idle' && (
        <div className="duration-inputs">
          <label>
            <span>H</span>
            <input
              type="number"
              min={0}
              max={99}
              value={hours}
              onChange={e =>
                handleDurationInput(e.target.valueAsNumber || 0, minutes, seconds)
              }
            />
          </label>
          <span className="duration-sep">:</span>
          <label>
            <span>M</span>
            <input
              type="number"
              min={0}
              max={59}
              value={minutes}
              onChange={e =>
                handleDurationInput(hours, e.target.valueAsNumber || 0, seconds)
              }
            />
          </label>
          <span className="duration-sep">:</span>
          <label>
            <span>S</span>
            <input
              type="number"
              min={0}
              max={59}
              value={seconds}
              onChange={e =>
                handleDurationInput(hours, minutes, e.target.valueAsNumber || 0)
              }
            />
          </label>
        </div>
      )}
      {/* &end[SetDuration] */}

      <div className="timer-actions">
        {/* &begin[SetDuration] */}
        {status === 'idle' && (
          <button className="btn primary" onClick={handleStart}>
            Start
          </button>
        )}
        {/* &end[SetDuration] */}

        {/* &begin[Countdown] */}
        {status === 'running' && (
          <button className="btn secondary" onClick={handlePause}>
            Pause
          </button>
        )}
        {status === 'paused' && (
          <button className="btn primary" onClick={handleResume}>
            Resume
          </button>
        )}
        {/* &end[Countdown] */}

        {/* &begin[SetDuration] */}
        {(status === 'running' || status === 'paused' || status === 'finished') && (
          <button className="btn ghost" onClick={handleReset}>
            Reset
          </button>
        )}
        {/* &end[SetDuration] */}
      </div>

      {/* &begin[Countdown] */}
      {status !== 'idle' && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
      {/* &end[Countdown] */}

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

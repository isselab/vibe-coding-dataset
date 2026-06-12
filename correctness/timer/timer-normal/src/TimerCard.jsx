import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import KeyBind from './KeyBind'

function pad(n) {
  return String(n).padStart(2, '0')
}

function parseInput(h, m, s) {
  return (parseInt(h) || 0) * 3600 + (parseInt(m) || 0) * 60 + (parseInt(s) || 0)
}

function createAlarmSound(ctx) {
  const beep = (t, freq) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = freq
    osc.type = 'sine'
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.4, t + 0.01)
    gain.gain.linearRampToValueAtTime(0, t + 0.18)
    osc.start(t)
    osc.stop(t + 0.2)
  }
  const now = ctx.currentTime
  beep(now, 880); beep(now + 0.25, 1100)
  beep(now + 0.5, 880); beep(now + 0.75, 1100)
  beep(now + 1.0, 880); beep(now + 1.25, 1100)
}

const TimerCard = forwardRef(function TimerCard(
  { id, getAudioCtx, onRemove, primaryBind, secondaryBind },
  ref
) {
  const [label, setLabel] = useState('')
  const [hours, setHours] = useState('0')
  const [minutes, setMinutes] = useState('5')
  const [seconds, setSeconds] = useState('0')
  const [remaining, setRemaining] = useState(null)
  const [running, setRunning] = useState(false)
  const [alarming, setAlarming] = useState(false)

  const intervalRef = useRef(null)
  const alarmIntervalRef = useRef(null)
  const totalSetRef = useRef(0)

  const stopAlarm = useCallback(() => {
    clearInterval(alarmIntervalRef.current)
    setAlarming(false)
  }, [])

  const triggerAlarm = useCallback(() => {
    setAlarming(true)
    const ctx = getAudioCtx()
    createAlarmSound(ctx)
    alarmIntervalRef.current = setInterval(() => createAlarmSound(ctx), 1800)
  }, [getAudioCtx])

  const tick = useCallback(() => {
    setRemaining(prev => {
      if (prev <= 1) {
        clearInterval(intervalRef.current)
        setRunning(false)
        triggerAlarm()
        return 0
      }
      return prev - 1
    })
  }, [triggerAlarm])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, tick])

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current)
      clearInterval(alarmIntervalRef.current)
    }
  }, [])

  const handleStart = () => {
    if (alarming) { stopAlarm(); return }
    if (remaining === null || remaining === 0) {
      const total = parseInput(hours, minutes, seconds)
      if (total === 0) return
      totalSetRef.current = total
      setRemaining(total)
      setRunning(true)
    } else {
      setRunning(true)
    }
  }

  const handlePause = () => setRunning(false)

  const handleReset = () => {
    stopAlarm()
    setRunning(false)
    setRemaining(null)
  }

  // Fresh refs so useImperativeHandle needs no deps
  const primaryRef = useRef(null)
  primaryRef.current = () => {
    if (alarming) { stopAlarm(); return }
    if (running) { setRunning(false); return }
    handleStart()
  }

  const secondaryRef = useRef(null)
  secondaryRef.current = handleReset

  useImperativeHandle(ref, () => ({
    triggerPrimary:   () => primaryRef.current(),
    triggerSecondary: () => secondaryRef.current(),
  }), [])

  const totalSet = totalSetRef.current
  const displaySec = remaining !== null ? remaining : parseInput(hours, minutes, seconds)
  const h = Math.floor(displaySec / 3600)
  const m = Math.floor((displaySec % 3600) / 60)
  const s = displaySec % 60

  const progress = remaining !== null && totalSet > 0 ? remaining / totalSet : 1
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  const isIdle = !running && !alarming && remaining === null
  const isPaused = !running && !alarming && remaining !== null && remaining > 0

  return (
    <div className={`timer-card${alarming ? ' alarming' : ''}`}>
      <div className="card-header">
        <input
          className="label-input"
          placeholder="Timer name..."
          value={label}
          onChange={e => setLabel(e.target.value)}
        />
        <KeyBind {...primaryBind} icon="▶" title="Start / Pause" />
        <KeyBind {...secondaryBind} icon="↺" title="Reset" />
        <button className="btn-remove" onClick={() => onRemove(id)} aria-label="Remove timer">✕</button>
      </div>

      <div className="card-body">
        <div className="ring-wrap">
          <svg width="116" height="116" viewBox="0 0 116 116">
            <circle cx="58" cy="58" r={radius} className="ring-track" />
            <circle
              cx="58" cy="58" r={radius}
              className="ring-progress"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 58 58)"
            />
          </svg>
          <div className="ring-label">
            <span className="time-text">{pad(h)}:{pad(m)}:{pad(s)}</span>
          </div>
        </div>

        <div className="card-right">
          {alarming && <p className="alarm-badge">Time&apos;s up!</p>}

          {isIdle && (
            <div className="inputs">
              <label>
                <span>H</span>
                <input type="number" min="0" max="23" value={hours}
                  onChange={e => setHours(e.target.value)} />
              </label>
              <span className="colon">:</span>
              <label>
                <span>M</span>
                <input type="number" min="0" max="59" value={minutes}
                  onChange={e => setMinutes(e.target.value)} />
              </label>
              <span className="colon">:</span>
              <label>
                <span>S</span>
                <input type="number" min="0" max="59" value={seconds}
                  onChange={e => setSeconds(e.target.value)} />
              </label>
            </div>
          )}

          <div className="controls">
            {(isIdle || isPaused || alarming) && (
              <button className={`btn primary${alarming ? ' danger' : ''}`} onClick={handleStart}>
                {alarming ? 'Stop Alarm' : isPaused ? 'Resume' : 'Start'}
              </button>
            )}
            {running && (
              <button className="btn secondary" onClick={handlePause}>Pause</button>
            )}
            {!isIdle && (
              <button className="btn ghost" onClick={handleReset}>Reset</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

export default TimerCard

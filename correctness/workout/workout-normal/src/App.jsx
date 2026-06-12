import { useState } from 'react'
import './App.css'
import { StatsView } from './StatsView'
import { SEED_SESSIONS } from './seedData'

const TODAY = new Date().toISOString().split('T')[0]
const INTENSITY_LEVELS = ['Low', 'Moderate', 'High']

function newStrength() {
  return { id: crypto.randomUUID(), type: 'strength', name: '', sets: '', reps: '', weight: '' }
}

function newCardio() {
  return { id: crypto.randomUUID(), type: 'cardio', name: '', duration: '', distance: '', intensity: 'Moderate' }
}

// ── Form rows ────────────────────────────────────────────────────────────────

function StrengthRow({ ex, showLabels, onUpdate, onRemove, removable }) {
  const u = (field, val) => onUpdate(ex.id, field, val)
  return (
    <div className="exercise-row strength-row">
      <div className="form-group">
        {showLabels && <label>Exercise</label>}
        <input type="text" placeholder="Bench press" value={ex.name} onChange={e => u('name', e.target.value)} />
      </div>
      <div className="form-group">
        {showLabels && <label>Sets</label>}
        <input type="number" placeholder="3" min="1" value={ex.sets} onChange={e => u('sets', e.target.value)} />
      </div>
      <div className="form-group">
        {showLabels && <label>Reps</label>}
        <input type="number" placeholder="10" min="1" value={ex.reps} onChange={e => u('reps', e.target.value)} />
      </div>
      <div className="form-group">
        {showLabels && <label>Weight (kg)</label>}
        <input type="number" placeholder="60" min="0" step="0.5" value={ex.weight} onChange={e => u('weight', e.target.value)} />
      </div>
      <div className="form-group">
        {showLabels && <label className="sr-only">Remove</label>}
        <button className="btn-icon" onClick={() => onRemove(ex.id)} disabled={!removable} title="Remove">×</button>
      </div>
    </div>
  )
}

function CardioRow({ ex, showLabels, onUpdate, onRemove, removable }) {
  const u = (field, val) => onUpdate(ex.id, field, val)
  return (
    <div className="exercise-row cardio-row">
      <div className="form-group">
        {showLabels && <label>Exercise</label>}
        <input type="text" placeholder="Running" value={ex.name} onChange={e => u('name', e.target.value)} />
      </div>
      <div className="form-group">
        {showLabels && <label>Duration (min)</label>}
        <input type="number" placeholder="30" min="1" value={ex.duration} onChange={e => u('duration', e.target.value)} />
      </div>
      <div className="form-group">
        {showLabels && <label>Distance (km)</label>}
        <input type="number" placeholder="5" min="0" step="0.1" value={ex.distance} onChange={e => u('distance', e.target.value)} />
      </div>
      <div className="form-group">
        {showLabels && <label>Intensity</label>}
        <select value={ex.intensity} onChange={e => u('intensity', e.target.value)}>
          {INTENSITY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div className="form-group">
        {showLabels && <label className="sr-only">Remove</label>}
        <button className="btn-icon" onClick={() => onRemove(ex.id)} disabled={!removable} title="Remove">×</button>
      </div>
    </div>
  )
}

// ── Session form ─────────────────────────────────────────────────────────────

function SessionForm({ onSave }) {
  const [date, setDate] = useState(TODAY)
  const [title, setTitle] = useState('')
  const [strengthExs, setStrengthExs] = useState([newStrength()])
  const [cardioExs, setCardioExs] = useState([])

  function updateIn(setter, id, field, value) {
    setter(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  function removeFrom(setter, id) {
    setter(prev => prev.filter(e => e.id !== id))
  }

  function handleSave() {
    const strength = strengthExs.filter(e => e.name.trim())
    const cardio = cardioExs.filter(e => e.name.trim())
    if (!strength.length && !cardio.length) return
    onSave({ id: crypto.randomUUID(), date, title: title.trim(), exercises: [...strength, ...cardio] })
    setDate(TODAY)
    setTitle('')
    setStrengthExs([newStrength()])
    setCardioExs([])
  }

  const canSave = strengthExs.some(e => e.name.trim()) || cardioExs.some(e => e.name.trim())

  return (
    <div className="form-card">
      <h2>Log Session</h2>
      <div className="form-row">
        <div className="form-group">
          <label>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Title (optional)</label>
          <input type="text" placeholder="e.g. Push Day" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
      </div>

      {/* Strength section */}
      <div className="exercises-section">
        <div className="section-header strength-header">
          <span className="section-badge strength-badge">Strength</span>
        </div>
        {strengthExs.map((ex, i) => (
          <StrengthRow
            key={ex.id}
            ex={ex}
            showLabels={i === 0}
            onUpdate={(id, f, v) => updateIn(setStrengthExs, id, f, v)}
            onRemove={id => removeFrom(setStrengthExs, id)}
            removable={true}
          />
        ))}
        <button className="btn btn-add strength-add" onClick={() => setStrengthExs(p => [...p, newStrength()])}>
          + Add strength exercise
        </button>
      </div>

      {/* Cardio section */}
      <div className="exercises-section">
        <div className="section-header cardio-header">
          <span className="section-badge cardio-badge">Cardio</span>
        </div>
        {cardioExs.map((ex, i) => (
          <CardioRow
            key={ex.id}
            ex={ex}
            showLabels={i === 0}
            onUpdate={(id, f, v) => updateIn(setCardioExs, id, f, v)}
            onRemove={id => removeFrom(setCardioExs, id)}
            removable={true}
          />
        ))}
        <button className="btn btn-add cardio-add" onClick={() => setCardioExs(p => [...p, newCardio()])}>
          + Add cardio exercise
        </button>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" onClick={handleSave} disabled={!canSave}>
          Save session
        </button>
      </div>
    </div>
  )
}

// ── Session card ─────────────────────────────────────────────────────────────

const INTENSITY_COLOR = { Low: 'intensity-low', Moderate: 'intensity-moderate', High: 'intensity-high' }

function SessionCard({ session }) {
  const [open, setOpen] = useState(false)

  const strength = session.exercises.filter(e => e.type === 'strength')
  const cardio = session.exercises.filter(e => e.type === 'cardio')
  const label = session.title || 'Workout'
  const date = new Date(session.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })

  const parts = []
  if (strength.length) parts.push(`${strength.length} strength`)
  if (cardio.length) parts.push(`${cardio.length} cardio`)

  return (
    <div className="session-card">
      <div className="session-header" onClick={() => setOpen(o => !o)}>
        <div className="session-meta">
          <div className="session-title">{label}</div>
          <div className="session-date">{date}</div>
        </div>
        <span className="session-summary">{parts.join(' · ')}</span>
        <span className={`chevron${open ? ' open' : ''}`}>▼</span>
      </div>

      {open && (
        <div className="session-exercises">
          {strength.length > 0 && (
            <div className="exercise-group">
              <div className="group-label strength-label">Strength</div>
              <table className="exercise-table">
                <thead>
                  <tr>
                    <th>Exercise</th>
                    <th>Sets</th>
                    <th>Reps</th>
                    <th>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {strength.map(ex => (
                    <tr key={ex.id}>
                      <td>{ex.name}</td>
                      <td>{ex.sets || '—'}</td>
                      <td>{ex.reps || '—'}</td>
                      <td>{ex.weight ? `${ex.weight} kg` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {cardio.length > 0 && (
            <div className={`exercise-group${strength.length > 0 ? ' group-gap' : ''}`}>
              <div className="group-label cardio-label">Cardio</div>
              <table className="exercise-table">
                <thead>
                  <tr>
                    <th>Exercise</th>
                    <th>Duration</th>
                    <th>Distance</th>
                    <th>Intensity</th>
                  </tr>
                </thead>
                <tbody>
                  {cardio.map(ex => (
                    <tr key={ex.id}>
                      <td>{ex.name}</td>
                      <td>{ex.duration ? `${ex.duration} min` : '—'}</td>
                      <td>{ex.distance ? `${ex.distance} km` : '—'}</td>
                      <td>
                        <span className={`intensity-badge ${INTENSITY_COLOR[ex.intensity]}`}>
                          {ex.intensity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

function App() {
  const [sessions, setSessions] = useState(SEED_SESSIONS)
  const [tab, setTab] = useState('log')

  function addSession(session) {
    setSessions(prev => [session, ...prev].sort((a, b) => b.date.localeCompare(a.date)))
  }

  return (
    <>
      <header className="app-header">
        <h1>Workout Log</h1>
        <nav className="tab-bar">
          <button className={`tab${tab === 'log' ? ' tab-active' : ''}`} onClick={() => setTab('log')}>Log</button>
          <button className={`tab${tab === 'stats' ? ' tab-active' : ''}`} onClick={() => setTab('stats')}>Statistics</button>
        </nav>
      </header>

      {tab === 'log' && (
        <>
          <SessionForm onSave={addSession} />
          <h2>History</h2>
          {sessions.length === 0 ? (
            <p className="empty-state">No sessions yet. Log your first workout above.</p>
          ) : (
            <div className="session-list">
              {sessions.map(s => <SessionCard key={s.id} session={s} />)}
            </div>
          )}
        </>
      )}

      {tab === 'stats' && <StatsView sessions={sessions} />}
    </>
  )
}

export default App

import { useState } from 'react'
import ExerciseForm from './ExerciseForm'
import CardioForm from './CardioForm'
import './SessionLogger.css'

// &begin[SessionLogging]
function SessionLogger({ onSave }) {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [title, setTitle] = useState('')
  const [exercises, setExercises] = useState([])
  // &begin[CardioEntry]
  const [activeType, setActiveType] = useState('strength')
  // &end[CardioEntry]

  function addExercise(exercise) {
    setExercises(prev => [...prev, exercise])
  }

  function removeExercise(id) {
    setExercises(prev => prev.filter(e => e.id !== id))
  }

  function handleSave() {
    if (exercises.length === 0) return
    onSave({
      id: crypto.randomUUID(),
      date,
      title: title.trim() || null,
      exercises,
    })
    setDate(today)
    setTitle('')
    setExercises([])
  }

  return (
    <div className="session-logger">
      <section className="session-meta">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="date-input"
        />
        <input
          placeholder="Session title (optional)"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </section>

      <section className="exercises-section">
        <h2 className="section-label">Exercises</h2>
        {exercises.length > 0 && (
          <ul className="exercise-list">
            {exercises.map(ex => (
              <li key={ex.id} className={`exercise-item exercise-item--${ex.type}`}>
                {/* &begin[CardioEntry] */}
                <span className={`ex-badge ex-badge--${ex.type}`}>
                  {ex.type === 'cardio' ? 'Cardio' : 'Strength'}
                </span>
                {/* &end[CardioEntry] */}
                <span className="ex-name">{ex.name}</span>
                {/* &begin[StrengthEntry] */}
                {ex.type === 'strength' && (
                  <span className="ex-detail">
                    {ex.sets} × {ex.reps} reps
                    {ex.weight != null ? ` @ ${ex.weight} kg` : ''}
                  </span>
                )}
                {/* &end[StrengthEntry] */}
                {/* &begin[CardioEntry] */}
                {ex.type === 'cardio' && (
                  <span className="ex-detail">
                    {ex.duration} min
                    {ex.distance != null ? ` · ${ex.distance} km` : ''}
                    {` · ${ex.intensity}`}
                  </span>
                )}
                {/* &end[CardioEntry] */}
                <button className="remove-btn" onClick={() => removeExercise(ex.id)}>✕</button>
              </li>
            ))}
          </ul>
        )}

        {/* &begin[CardioEntry] */}
        <div className="type-tabs">
          <button
            className={`type-tab${activeType === 'strength' ? ' active strength' : ''}`}
            onClick={() => setActiveType('strength')}
          >
            Strength
          </button>
          <button
            className={`type-tab${activeType === 'cardio' ? ' active cardio' : ''}`}
            onClick={() => setActiveType('cardio')}
          >
            Cardio
          </button>
        </div>
        {/* &end[CardioEntry] */}

        {/* &begin[StrengthEntry] */}
        {activeType === 'strength' && <ExerciseForm onAdd={addExercise} />}
        {/* &end[StrengthEntry] */}
        {/* &begin[CardioEntry] */}
        {activeType === 'cardio' && <CardioForm onAdd={addExercise} />}
        {/* &end[CardioEntry] */}
      </section>

      <button
        className="save-btn"
        onClick={handleSave}
        disabled={exercises.length === 0}
      >
        Save Session
      </button>
    </div>
  )
}
// &end[SessionLogging]

export default SessionLogger

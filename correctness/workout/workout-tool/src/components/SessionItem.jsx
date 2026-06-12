import { useState } from 'react'
import './SessionItem.css'

// &begin[SessionDetail]
function SessionItem({ session }) {
  const [expanded, setExpanded] = useState(false)

  const formattedDate = new Date(session.date + 'T00:00:00').toLocaleDateString('en-SE', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const count = session.exercises.length

  return (
    <li className="session-item">
      <button className="session-header" onClick={() => setExpanded(e => !e)}>
        <div className="session-header-left">
          <span className="session-date">{formattedDate}</span>
          {session.title && <span className="session-title">{session.title}</span>}
          <span className="session-count">{count} exercise{count !== 1 ? 's' : ''}</span>
        </div>
        <span className="expand-icon">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <ul className="session-exercises">
          {session.exercises.map(ex => (
            <li key={ex.id} className={`session-exercise-row session-exercise-row--${ex.type ?? 'strength'}`}>
              {/* &begin[CardioEntry] */}
              <span className={`se-badge se-badge--${ex.type ?? 'strength'}`}>
                {ex.type === 'cardio' ? 'Cardio' : 'Strength'}
              </span>
              {/* &end[CardioEntry] */}
              <span className="se-name">{ex.name}</span>
              {/* &begin[StrengthEntry] */}
              {(ex.type === 'strength' || ex.type == null) && (
                <span className="se-detail">
                  {ex.sets} × {ex.reps} reps
                  {ex.weight != null ? ` @ ${ex.weight} kg` : ''}
                </span>
              )}
              {/* &end[StrengthEntry] */}
              {/* &begin[CardioEntry] */}
              {ex.type === 'cardio' && (
                <span className="se-detail">
                  {ex.duration} min
                  {ex.distance != null ? ` · ${ex.distance} km` : ''}
                  {` · ${ex.intensity}`}
                </span>
              )}
              {/* &end[CardioEntry] */}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
// &end[SessionDetail]

export default SessionItem

import SessionItem from './SessionItem'
import './SessionHistory.css'

// &begin[SessionHistory]
function SessionHistory({ sessions }) {
  if (sessions.length === 0) {
    return <p className="empty-history">No sessions logged yet.</p>
  }

  return (
    <div className="session-history">
      <h2 className="section-label">Past Sessions</h2>
      <ul className="history-list">
        {sessions.map(session => (
          // &begin[SessionDetail]
          <SessionItem key={session.id} session={session} />
          // &end[SessionDetail]
        ))}
      </ul>
    </div>
  )
}
// &end[SessionHistory]

export default SessionHistory

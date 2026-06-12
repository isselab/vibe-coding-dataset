import { useState } from 'react'
import SessionLogger from './components/SessionLogger'
import SessionHistory from './components/SessionHistory'
import Statistics from './components/Statistics'
import './App.css'

function App() {
  // &begin[SessionLogging]
  const [sessions, setSessions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('workout-sessions')) || []
    } catch {
      return []
    }
  })

  function saveSession(session) {
    const updated = [session, ...sessions]
    setSessions(updated)
    localStorage.setItem('workout-sessions', JSON.stringify(updated))
  }
  // &end[SessionLogging]

  // &begin[SessionHistory]
  const [view, setView] = useState('log')
  // &end[SessionHistory]

  return (
    <div className="app">
      <header className="app-header">
        <h1>Workout Tool</h1>
        {/* &begin[SessionHistory] */}
        <nav className="app-nav">
          <button
            className={view === 'log' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setView('log')}
          >
            Log
          </button>
          <button
            className={view === 'history' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setView('history')}
          >
            History
          </button>
          {/* &begin[Statistics] */}
          <button
            className={view === 'stats' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setView('stats')}
          >
            Stats
          </button>
          {/* &end[Statistics] */}
        </nav>
        {/* &end[SessionHistory] */}
      </header>

      {/* &begin[SessionLogging] */}
      {view === 'log' && <SessionLogger onSave={saveSession} />}
      {/* &end[SessionLogging] */}
      {/* &begin[SessionHistory] */}
      {view === 'history' && <SessionHistory sessions={sessions} />}
      {/* &end[SessionHistory] */}
      {/* &begin[Statistics] */}
      {view === 'stats' && <Statistics sessions={sessions} />}
      {/* &end[Statistics] */}
    </div>
  )
}

export default App

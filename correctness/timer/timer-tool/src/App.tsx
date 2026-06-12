import { useState, useCallback, useRef } from 'react'
import TimerCard from './components/TimerCard'
import StopwatchCard from './components/StopwatchCard'
import './App.css'

// &begin[TimerList]
interface TimerEntry {
  kind: 'timer'
  id: string
  timerNumber: number
}
// &end[TimerList]

// &begin[StopwatchList]
interface StopwatchEntry {
  kind: 'stopwatch'
  id: string
  watchNumber: number
}
// &end[StopwatchList]

type CardEntry = TimerEntry | StopwatchEntry

function App() {
  const [cards, setCards] = useState<CardEntry[]>([])

  // &begin[TimerList]
  const nextTimerNumber = useRef(1)
  const addTimer = useCallback(() => {
    setCards(prev => [
      ...prev,
      { kind: 'timer', id: crypto.randomUUID(), timerNumber: nextTimerNumber.current++ },
    ])
  }, [])
  // &end[TimerList]

  // &begin[StopwatchList]
  const nextWatchNumber = useRef(1)
  const addStopwatch = useCallback(() => {
    setCards(prev => [
      ...prev,
      { kind: 'stopwatch', id: crypto.randomUUID(), watchNumber: nextWatchNumber.current++ },
    ])
  }, [])
  // &end[StopwatchList]

  const removeCard = useCallback((id: string) => {
    setCards(prev => prev.filter(c => c.id !== id))
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Timers</h1>
        <div className="header-actions">
          {/* &begin[TimerList] */}
          <button className="add-btn" onClick={addTimer}>
            + Add Timer
          </button>
          {/* &end[TimerList] */}
          {/* &begin[StopwatchList] */}
          <button className="add-btn add-btn-green" onClick={addStopwatch}>
            + Add Stopwatch
          </button>
          {/* &end[StopwatchList] */}
        </div>
      </header>
      <main>
        {cards.length === 0 ? (
          <div className="empty-state">
            <p>Add a timer or stopwatch to get started.</p>
          </div>
        ) : (
          <div className="card-grid">
            {cards.map(card =>
              card.kind === 'timer' ? (
                <TimerCard
                  key={card.id}
                  id={card.id}
                  timerNumber={card.timerNumber}
                  onRemove={removeCard}
                />
              ) : (
                <StopwatchCard
                  key={card.id}
                  id={card.id}
                  watchNumber={card.watchNumber}
                  onRemove={removeCard}
                />
              )
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App

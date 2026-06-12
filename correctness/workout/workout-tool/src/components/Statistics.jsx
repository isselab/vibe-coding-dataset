import { useState, useMemo } from 'react'
import StatsFilter from './StatsFilter'
import StrengthChart from './StrengthChart'
import CardioChart from './CardioChart'
import './Statistics.css'

function Statistics({ sessions }) {
  // &begin[StatsFilter]
  const [activeType, setActiveType] = useState('strength')
  const [selectedExercise, setSelectedExercise] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filteredSessions = useMemo(() =>
    sessions.filter(s => {
      if (dateFrom && s.date < dateFrom) return false
      if (dateTo && s.date > dateTo) return false
      return true
    }),
  [sessions, dateFrom, dateTo])
  // &end[StatsFilter]

  // &begin[StrengthStats]
  const strengthNames = useMemo(() => {
    const names = new Set()
    sessions.forEach(s => s.exercises.forEach(e => {
      if (e.type === 'strength' || e.type == null) names.add(e.name)
    }))
    return [...names].sort()
  }, [sessions])

  const strengthData = useMemo(() => {
    if (!selectedExercise || activeType !== 'strength') return []
    return filteredSessions
      .flatMap(s => {
        const matches = s.exercises.filter(
          e => (e.type === 'strength' || e.type == null) && e.name === selectedExercise && e.weight != null
        )
        if (matches.length === 0) return []
        return [{ date: s.date, value: Math.max(...matches.map(e => e.weight)) }]
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredSessions, selectedExercise, activeType])
  // &end[StrengthStats]

  // &begin[CardioStats]
  const cardioNames = useMemo(() => {
    const names = new Set()
    sessions.forEach(s => s.exercises.forEach(e => {
      if (e.type === 'cardio') names.add(e.name)
    }))
    return [...names].sort()
  }, [sessions])

  const cardioData = useMemo(() => {
    if (!selectedExercise || activeType !== 'cardio') return []
    return filteredSessions
      .flatMap(s => {
        const matches = s.exercises.filter(
          e => e.type === 'cardio' && e.name === selectedExercise && e.distance > 0
        )
        if (matches.length === 0) return []
        const avgPace = matches.reduce((sum, e) => sum + e.duration / e.distance, 0) / matches.length
        return [{ date: s.date, value: Math.round(avgPace * 100) / 100 }]
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredSessions, selectedExercise, activeType])
  // &end[CardioStats]

  // &begin[StatsFilter]
  const exerciseNames = activeType === 'strength' ? strengthNames : cardioNames

  function handleTypeChange(type) {
    setActiveType(type)
    setSelectedExercise('')
  }
  // &end[StatsFilter]

  if (sessions.length === 0) {
    return <p className="chart-empty">Log some sessions first to see statistics.</p>
  }

  return (
    <div className="statistics">
      {/* &begin[StatsFilter] */}
      <StatsFilter
        activeType={activeType}
        onTypeChange={handleTypeChange}
        exerciseNames={exerciseNames}
        selectedExercise={selectedExercise}
        onSelectExercise={setSelectedExercise}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFrom={setDateFrom}
        onDateTo={setDateTo}
      />
      {/* &end[StatsFilter] */}
      {/* &begin[StrengthStats] */}
      {activeType === 'strength' && <StrengthChart data={strengthData} exerciseName={selectedExercise} />}
      {/* &end[StrengthStats] */}
      {/* &begin[CardioStats] */}
      {activeType === 'cardio' && <CardioChart data={cardioData} exerciseName={selectedExercise} />}
      {/* &end[CardioStats] */}
    </div>
  )
}

export default Statistics

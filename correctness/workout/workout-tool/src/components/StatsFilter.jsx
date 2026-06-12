import './StatsFilter.css'

// &begin[StatsFilter]
function StatsFilter({
  activeType, onTypeChange,
  exerciseNames, selectedExercise, onSelectExercise,
  dateFrom, dateTo, onDateFrom, onDateTo,
}) {
  return (
    <div className="stats-filter">
      <div className="filter-row">
        <div className="type-tabs">
          <button
            className={`type-tab${activeType === 'strength' ? ' active strength' : ''}`}
            onClick={() => onTypeChange('strength')}
          >
            Strength
          </button>
          <button
            className={`type-tab${activeType === 'cardio' ? ' active cardio' : ''}`}
            onClick={() => onTypeChange('cardio')}
          >
            Cardio
          </button>
        </div>
        <select
          className="exercise-select"
          value={selectedExercise}
          onChange={e => onSelectExercise(e.target.value)}
        >
          <option value="">Select exercise…</option>
          {exerciseNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>
      <div className="filter-row date-range">
        <label>From</label>
        <input type="date" value={dateFrom} onChange={e => onDateFrom(e.target.value)} />
        <label>To</label>
        <input type="date" value={dateTo} onChange={e => onDateTo(e.target.value)} />
      </div>
    </div>
  )
}
// &end[StatsFilter]

export default StatsFilter

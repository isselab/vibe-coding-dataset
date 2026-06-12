import { useState } from 'react'
import './CardioForm.css'

// &begin[CardioEntry]
function CardioForm({ onAdd }) {
  const [name, setName] = useState('')
  const [duration, setDuration] = useState('')
  const [distance, setDistance] = useState('')
  const [intensity, setIntensity] = useState('Moderate')

  function handleAdd() {
    if (!name.trim() || !duration) return
    onAdd({
      id: crypto.randomUUID(),
      type: 'cardio',
      name: name.trim(),
      duration: Number(duration),
      distance: distance ? Number(distance) : null,
      intensity,
    })
    setName('')
    setDuration('')
    setDistance('')
    setIntensity('Moderate')
  }

  return (
    <div className="cardio-form">
      <div className="cardio-form-row">
        <input
          className="cardio-name-input"
          placeholder="Exercise name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
      </div>
      <div className="cardio-form-row cardio-nums">
        <input
          type="number"
          placeholder="Duration (min)"
          min="1"
          value={duration}
          onChange={e => setDuration(e.target.value)}
        />
        <input
          type="number"
          placeholder="Distance (km)"
          min="0"
          step="0.1"
          value={distance}
          onChange={e => setDistance(e.target.value)}
        />
        <select
          value={intensity}
          onChange={e => setIntensity(e.target.value)}
          className="intensity-select"
        >
          <option>Low</option>
          <option>Moderate</option>
          <option>High</option>
        </select>
        <button
          className="add-cardio-btn"
          onClick={handleAdd}
          disabled={!name.trim() || !duration}
        >
          Add
        </button>
      </div>
    </div>
  )
}
// &end[CardioEntry]

export default CardioForm

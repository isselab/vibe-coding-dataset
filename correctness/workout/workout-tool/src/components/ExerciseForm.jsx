import { useState } from 'react'
import './ExerciseForm.css'

// &begin[StrengthEntry]
function ExerciseForm({ onAdd }) {
  const [name, setName] = useState('')
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')

  function handleAdd() {
    if (!name.trim() || !sets || !reps) return
    onAdd({
      id: crypto.randomUUID(),
      type: 'strength',
      name: name.trim(),
      sets: Number(sets),
      reps: Number(reps),
      weight: weight ? Number(weight) : null,
    })
    setName('')
    setSets('')
    setReps('')
    setWeight('')
  }

  return (
    <div className="exercise-form">
      <div className="exercise-form-row">
        <input
          className="exercise-name-input"
          placeholder="Exercise name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
      </div>
      <div className="exercise-form-row exercise-nums">
        <input
          type="number"
          placeholder="Sets"
          min="1"
          value={sets}
          onChange={e => setSets(e.target.value)}
        />
        <input
          type="number"
          placeholder="Reps"
          min="1"
          value={reps}
          onChange={e => setReps(e.target.value)}
        />
        <input
          type="number"
          placeholder="Weight (kg)"
          min="0"
          step="0.5"
          value={weight}
          onChange={e => setWeight(e.target.value)}
        />
        <button className="add-exercise-btn" onClick={handleAdd} disabled={!name.trim() || !sets || !reps}>
          Add
        </button>
      </div>
    </div>
  )
}
// &end[StrengthEntry]

export default ExerciseForm

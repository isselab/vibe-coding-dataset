import { useState } from 'react'

export function SavingGoals({ goals, onAdd, onDelete, onAddFunds }) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [deadline, setDeadline] = useState('')
  const [addingTo, setAddingTo] = useState(null)
  const [fundsAmt, setFundsAmt] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    onAdd({
      id: crypto.randomUUID(),
      name,
      target: parseFloat(target),
      saved: 0,
      deadline: deadline || null,
    })
    setName('')
    setTarget('')
    setDeadline('')
  }

  const handleAddFunds = (id) => {
    const amt = parseFloat(fundsAmt)
    if (!isNaN(amt) && amt > 0) {
      onAddFunds(id, amt)
      setAddingTo(null)
      setFundsAmt('')
    }
  }

  return (
    <div className="two-col-layout">
      <div className="left-panel">
        <div className="card">
          <h2>New Saving Goal</h2>
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label>Goal name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Emergency fund"
                required
              />
            </div>
            <div className="form-group">
              <label>Target amount</label>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label>Deadline (optional)</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary">Add Goal</button>
          </form>
        </div>
      </div>
      <div className="right-panel">
        {goals.length === 0 ? (
          <p className="empty-state">No saving goals yet.</p>
        ) : (
          <div className="goals-grid">
            {goals.map((g) => {
              const pct = Math.min(100, (g.saved / g.target) * 100)
              const done = g.saved >= g.target
              return (
                <div key={g.id} className={`card goal-card${done ? ' goal-done' : ''}`}>
                  <div className="goal-header">
                    <span className="goal-name">{g.name}</span>
                    <button onClick={() => onDelete(g.id)} className="btn-delete" aria-label="Delete goal">×</button>
                  </div>
                  <div className="goal-amounts">
                    <span className="goal-saved">{g.saved.toFixed(2)}</span>
                    <span className="goal-sep"> / </span>
                    <span className="goal-target">{g.target.toFixed(2)}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-bar" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="goal-footer">
                    <span className="goal-pct">{pct.toFixed(0)}% reached</span>
                    {g.deadline && <span className="goal-deadline">by {g.deadline}</span>}
                  </div>
                  {done ? (
                    <p className="goal-done-msg">Goal reached!</p>
                  ) : addingTo === g.id ? (
                    <div className="add-funds-row">
                      <input
                        type="number"
                        value={fundsAmt}
                        onChange={(e) => setFundsAmt(e.target.value)}
                        min="0.01"
                        step="0.01"
                        placeholder="Amount"
                        autoFocus
                      />
                      <button type="button" className="btn-primary" onClick={() => handleAddFunds(g.id)}>Add</button>
                      <button type="button" className="btn-secondary" onClick={() => setAddingTo(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => { setAddingTo(g.id); setFundsAmt('') }}
                    >
                      Add funds
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

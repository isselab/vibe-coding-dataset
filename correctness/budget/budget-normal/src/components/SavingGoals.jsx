import React, { useState } from 'react'

export default function SavingGoals({ goals, onAdd, onDelete, onContribute }) {
  const [form, setForm] = useState({ name: '', targetAmount: '', deadline: '', notes: '' })
  const [contributions, setContributions] = useState({})
  const [error, setError] = useState('')

  function setF(f, v) { setForm(prev => ({ ...prev, [f]: v })) }

  function submitGoal(e) {
    e.preventDefault()
    const target = parseFloat(form.targetAmount)
    if (!form.name.trim()) { setError('Name is required.'); return }
    if (isNaN(target) || target <= 0) { setError('Target amount must be positive.'); return }
    setError('')
    onAdd({ name: form.name.trim(), targetAmount: target, deadline: form.deadline || null, notes: form.notes.trim() })
    setForm({ name: '', targetAmount: '', deadline: '', notes: '' })
  }

  function submitContribution(goalId) {
    const amount = parseFloat(contributions[goalId] || '')
    if (isNaN(amount) || amount <= 0) return
    onContribute(goalId, amount)
    setContributions(prev => { const n = { ...prev }; delete n[goalId]; return n })
  }

  return (
    <div className="savings-goals">
      <form className="panel" onSubmit={submitGoal}>
        <h2>New Saving Goal</h2>
        {error && <div className="form-error">{error}</div>}
        <div className="form-row">
          <label>Goal Name
            <input type="text" value={form.name} onChange={e => setF('name', e.target.value)} placeholder="e.g. Emergency Fund" maxLength={80} />
          </label>
          <label>Target Amount
            <input type="number" value={form.targetAmount} onChange={e => setF('targetAmount', e.target.value)} min="0.01" step="0.01" placeholder="0.00" />
          </label>
        </div>
        <div className="form-row">
          <label>Deadline (optional)
            <input type="date" value={form.deadline} onChange={e => setF('deadline', e.target.value)} />
          </label>
          <label>Notes (optional)
            <input type="text" value={form.notes} onChange={e => setF('notes', e.target.value)} maxLength={200} placeholder="What is this for?" />
          </label>
        </div>
        <button type="submit" className="btn-primary">Create Goal</button>
      </form>

      {goals.length === 0
        ? <div className="panel"><p className="empty">No saving goals yet.</p></div>
        : (
          <div className="goals-grid">
            {goals.map(goal => {
              const pct = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100)
              const done = goal.savedAmount >= goal.targetAmount
              const daysLeft = goal.deadline
                ? Math.ceil((new Date(goal.deadline) - Date.now()) / 86400000)
                : null

              return (
                <div key={goal.id} className={`goal-card ${done ? 'done' : ''}`}>
                  <div className="goal-card-header">
                    <strong>{goal.name}</strong>
                    <button className="btn-delete" onClick={() => onDelete(goal.id)} aria-label="Delete goal">×</button>
                  </div>
                  {goal.notes && <p className="goal-notes">{goal.notes}</p>}
                  <div className="goal-amounts">
                    <span className="goal-saved">{fmt(goal.savedAmount)}</span>
                    <span className="goal-target">of {fmt(goal.targetAmount)}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${pct}%`, background: done ? 'var(--success)' : 'var(--accent)' }}
                    />
                  </div>
                  <div className="goal-meta">
                    <span>{pct.toFixed(0)}% complete</span>
                    {daysLeft !== null && (
                      <span className={daysLeft < 0 ? 'over-budget' : daysLeft < 30 ? 'text-warn' : 'text-muted'}>
                        {daysLeft < 0
                          ? `${Math.abs(daysLeft)}d overdue`
                          : `${daysLeft}d left`}
                      </span>
                    )}
                  </div>
                  {done
                    ? <div className="goal-done-label">Goal reached!</div>
                    : (
                      <div className="contribute-row">
                        <input
                          type="number"
                          className="contribute-input"
                          placeholder="Add funds"
                          min="0.01"
                          step="0.01"
                          value={contributions[goal.id] || ''}
                          onChange={e => setContributions(prev => ({ ...prev, [goal.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && submitContribution(goal.id)}
                        />
                        <button
                          type="button"
                          className="btn-primary btn-sm"
                          onClick={() => submitContribution(goal.id)}
                        >
                          Add
                        </button>
                      </div>
                    )}
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0)
}

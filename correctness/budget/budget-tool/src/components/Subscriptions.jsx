import { useState } from 'react'

const FREQUENCIES = ['weekly', 'monthly', 'yearly']

const EMPTY_FORM = {
  description: '',
  amount: '',
  category: '',
  frequency: 'monthly',
  startDate: new Date().toISOString().slice(0, 10),
}

export function Subscriptions({ recurring, categories, onAdd, onDelete, onToggle }) {
  const [form, setForm] = useState(EMPTY_FORM)

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd({
      id: crypto.randomUUID(),
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.category,
      type: 'expense',
      frequency: form.frequency,
      nextDue: form.startDate,
      active: true,
    })
    setForm(EMPTY_FORM)
  }

  const entries = recurring.filter((r) => r.type === 'expense')

  return (
    <div className="card recurring-card">
      <h2>Subscriptions &amp; Bills</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="e.g. Netflix"
            required
          />
        </div>
        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
            min="0.01"
            step="0.01"
            required
          />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select value={form.category} onChange={(e) => set('category', e.target.value)} required>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Frequency</label>
          <select value={form.frequency} onChange={(e) => set('frequency', e.target.value)}>
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Starting from</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => set('startDate', e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary">Add Subscription</button>
      </form>
      <div className="recurring-divider" />
      {entries.length === 0 ? (
        <p className="empty-state">No subscriptions yet.</p>
      ) : (
        <ul className="recurring-list">
          {entries.map((r) => (
            <li key={r.id} className={`recurring-item${r.active ? '' : ' paused'}`}>
              <div className="recurring-top">
                <span className="recurring-desc">{r.description}</span>
                <span className="type-badge expense">expense</span>
              </div>
              <div className="recurring-meta">
                <span>{r.amount.toFixed(2)} · {r.category} · {r.frequency}</span>
                <span className="recurring-next">Next: {r.nextDue}</span>
              </div>
              <div className="recurring-actions">
                <button
                  type="button"
                  className={`btn-secondary${r.active ? '' : ' btn-resume'}`}
                  onClick={() => onToggle(r.id)}
                >
                  {r.active ? 'Pause' : 'Resume'}
                </button>
                <button type="button" onClick={() => onDelete(r.id)} className="btn-delete">×</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

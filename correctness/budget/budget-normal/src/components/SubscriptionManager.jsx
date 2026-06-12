import React, { useState } from 'react'

const FREQUENCIES = ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']
const today = () => new Date().toISOString().slice(0, 10)

export default function SubscriptionManager({ categories, recurringItems, onAdd, onDelete }) {
  const expenseItems = recurringItems.filter(r => r.type === 'expense')
  const [form, setForm] = useState({
    description: '', amount: '', category: categories[0] || '',
    frequency: 'monthly', nextDate: today(), endDate: '',
  })
  const [error, setError] = useState('')

  function set(f, v) { setForm(prev => ({ ...prev, [f]: v })) }

  function submit(e) {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!form.description.trim()) { setError('Description is required.'); return }
    if (isNaN(amount) || amount <= 0) { setError('Amount must be positive.'); return }
    setError('')
    onAdd({
      description: form.description.trim(),
      amount,
      category: form.category,
      type: 'expense',
      frequency: form.frequency,
      nextDate: form.nextDate,
      endDate: form.endDate || null,
    })
    setForm(prev => ({ ...prev, description: '', amount: '' }))
  }

  return (
    <div className="recurring-section">
      <form className="panel" onSubmit={submit}>
        <h2>Add Subscription</h2>
        {error && <div className="form-error">{error}</div>}
        <div className="form-row">
          <label>Description
            <input type="text" value={form.description} onChange={e => set('description', e.target.value)} maxLength={120} placeholder="e.g. Netflix" />
          </label>
          <label>Amount
            <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} min="0.01" step="0.01" placeholder="0.00" />
          </label>
        </div>
        <div className="form-row">
          <label>Category
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>Frequency
            <select value={form.frequency} onChange={e => set('frequency', e.target.value)}>
              {FREQUENCIES.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>Start Date
            <input type="date" value={form.nextDate} onChange={e => set('nextDate', e.target.value)} />
          </label>
          <label>End Date (optional)
            <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
          </label>
        </div>
        <button type="submit" className="btn-primary">Add Subscription</button>
      </form>

      <div className="panel">
        <h2>Active Subscriptions</h2>
        {expenseItems.length === 0
          ? <p className="empty">No subscriptions set up.</p>
          : (
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="col-amount">Amount</th>
                  <th>Category</th>
                  <th>Frequency</th>
                  <th>Next Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenseItems.map(r => (
                  <tr key={r.id}>
                    <td>{r.description}</td>
                    <td className="col-amount">{fmt(r.amount)}</td>
                    <td><span className="category-badge">{r.category}</span></td>
                    <td>{r.frequency}</td>
                    <td className="col-date">{r.nextDate}</td>
                    <td><button className="btn-delete" onClick={() => onDelete(r.id)} aria-label="Delete">×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  )
}

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

import { useState } from 'react'

export function TransactionForm({ categories, onAdd }) {
  const [type, setType] = useState('expense')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))

  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd({
      id: crypto.randomUUID(),
      type,
      description,
      amount: parseFloat(amount),
      category,
      date,
    })
    setType('expense')
    setDescription('')
    setAmount('')
    setCategory('')
    setDate(new Date().toISOString().slice(0, 10))
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>Add Transaction</h2>
      <div className="form-group">
        <label>Type</label>
        <div className="type-toggle">
          <button
            type="button"
            className={type === 'expense' ? 'toggle-active' : ''}
            onClick={() => setType('expense')}
          >
            Expense
          </button>
          <button
            type="button"
            className={type === 'income' ? 'toggle-active' : ''}
            onClick={() => setType('income')}
          >
            Income
          </button>
        </div>
      </div>
      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Groceries"
          required
        />
      </div>
      <div className="form-group">
        <label>Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          min="0.01"
          step="0.01"
          required
        />
      </div>
      <div className="form-group">
        <label>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn-primary">Add Transaction</button>
    </form>
  )
}

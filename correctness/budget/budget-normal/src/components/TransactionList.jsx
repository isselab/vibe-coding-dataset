import React, { useState } from 'react'

export default function TransactionList({ transactions, onDelete }) {
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortDir, setSortDir] = useState('desc')

  const visible = transactions
    .filter(t => (!filter || t.category === filter) && (!typeFilter || t.type === typeFilter))
    .sort((a, b) => sortDir === 'desc'
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date)
    )

  const categories = [...new Set(transactions.map(t => t.category))].sort()

  return (
    <div className="transaction-list">
      <div className="list-header">
        <h2>Transactions</h2>
        <div className="list-controls">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            className="btn-ghost"
            onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
          >
            Date {sortDir === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </div>

      {visible.length === 0
        ? <p className="empty">No transactions found.</p>
        : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th className="col-amount">Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(t => (
                <tr key={t.id}>
                  <td className="col-date">{t.date.slice(0, 10)}</td>
                  <td>{t.description}</td>
                  <td><span className="category-badge">{t.category}</span></td>
                  <td><span className={`type-badge ${t.type}`}>{t.type}</span></td>
                  <td className={`col-amount ${t.type === 'income' ? 'income-amount' : ''}`}>
                    {t.type === 'income' ? '+' : ''}{fmt(t.amount)}
                  </td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => onDelete(t.id)}
                      aria-label="Delete transaction"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  )
}

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

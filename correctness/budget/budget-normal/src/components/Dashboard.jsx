import React from 'react'

export default function Dashboard({ transactions, limits, monthlySpending, monthlyIncome, warnings, goals }) {
  const now = new Date()
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const spending = monthlySpending(ym)
  const income = monthlyIncome(ym)

  const totalExpenses = Object.values(spending).reduce((s, v) => s + v, 0)
  const net = income - totalExpenses
  const totalLimit = Object.values(limits).reduce((s, v) => s + v, 0)
  const categoriesWithLimits = Object.keys(limits)
  const monthLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  const activeGoals = (goals ?? []).filter(g => g.savedAmount < g.targetAmount)

  return (
    <div className="dashboard">
      <h2>Dashboard — {monthLabel}</h2>

      {warnings.length > 0 && (
        <div className="warnings">
          <h3>Budget Exceeded</h3>
          {warnings.map(w => (
            <div key={w.category} className="warning-item">
              <span className="warning-icon">!</span>
              <strong>{w.category}</strong>: spent{' '}
              <span className="over-budget">{fmt(w.spent)}</span> of {fmt(w.limit)}
              {' '}({fmt(w.spent - w.limit)} over)
            </div>
          ))}
        </div>
      )}

      <div className="summary-cards">
        {income > 0 && (
          <div className="card">
            <div className="card-label">Income</div>
            <div className="card-value income-value">{fmt(income)}</div>
          </div>
        )}
        <div className="card">
          <div className="card-label">Expenses</div>
          <div className="card-value">{fmt(totalExpenses)}</div>
        </div>
        {income > 0 && (
          <div className="card">
            <div className="card-label">Net</div>
            <div className={`card-value ${net >= 0 ? 'income-value' : 'over-budget'}`}>{fmt(net)}</div>
          </div>
        )}
        {totalLimit > 0 && (
          <div className="card">
            <div className="card-label">Total Budget</div>
            <div className="card-value">{fmt(totalLimit)}</div>
          </div>
        )}
        <div className="card">
          <div className="card-label">Transactions</div>
          <div className="card-value">{transactions.filter(t => t.date.startsWith(ym)).length}</div>
        </div>
      </div>

      {categoriesWithLimits.length > 0 && (
        <div className="category-breakdown">
          <h3>Category Breakdown</h3>
          {categoriesWithLimits.map(cat => {
            const spent = spending[cat] || 0
            const limit = limits[cat]
            const pct = Math.min((spent / limit) * 100, 100)
            const over = spent > limit
            return (
              <div key={cat} className="breakdown-row">
                <div className="breakdown-header">
                  <span>{cat}</span>
                  <span className={over ? 'over-budget' : ''}>{fmt(spent)} / {fmt(limit)}</span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${over ? 'over' : pct > 80 ? 'warn' : ''}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeGoals.length > 0 && (
        <div className="category-breakdown">
          <h3>Saving Goals</h3>
          {activeGoals.map(g => {
            const pct = Math.min((g.savedAmount / g.targetAmount) * 100, 100)
            return (
              <div key={g.id} className="breakdown-row">
                <div className="breakdown-header">
                  <span>{g.name}</span>
                  <span>{fmt(g.savedAmount)} / {fmt(g.targetAmount)}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
                </div>
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

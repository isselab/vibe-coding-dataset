export function TransactionList({ transactions, onDelete }) {
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="card transaction-list">
      <h2>Transactions</h2>
      {sorted.length === 0 ? (
        <p className="empty-state">No transactions yet.</p>
      ) : (
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
            {sorted.map((t) => {
              const type = t.type ?? 'expense'
              return (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td>{t.description}</td>
                  <td>
                    {t.category
                      ? <span className="category-badge">{t.category}</span>
                      : <span className="category-badge uncategorized">—</span>}
                  </td>
                  <td><span className={`type-badge ${type}`}>{type}</span></td>
                  <td className={`col-amount ${type === 'income' ? 'income-amount' : 'expense-amount'}`}>
                    {type === 'income' ? '+' : '-'}{t.amount.toFixed(2)}
                  </td>
                  <td>
                    <button
                      onClick={() => onDelete(t.id)}
                      className="btn-delete"
                      aria-label="Delete transaction"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

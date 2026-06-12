export function SpendWarning({ warnings }) {
  if (warnings.length === 0) return null

  return (
    <div className="spend-warning">
      <strong>Spend limit exceeded this month:</strong>
      <ul>
        {warnings.map((w) => (
          <li key={w.category}>
            <span className="warning-category">{w.category}</span>
            &nbsp;— spent <strong>{w.spent.toFixed(2)}</strong> of limit{' '}
            <strong>{w.limit.toFixed(2)}</strong>
            {' '}(+{(w.spent - w.limit).toFixed(2)} over)
          </li>
        ))}
      </ul>
    </div>
  )
}

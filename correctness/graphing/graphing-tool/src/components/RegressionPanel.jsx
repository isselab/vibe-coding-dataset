const MIN_POINTS = { linear: 2, quadratic: 3, cubic: 4 }

export function RegressionPanel({
  placedCount, tableCount,
  regressionSource, onSourceChange,
  regressionType, onRegressionTypeChange,
  result,
}) {
  const activeCount = regressionSource === 'points' ? placedCount : tableCount
  const needsMore = regressionType && !result && activeCount < MIN_POINTS[regressionType]

  return (
    <div className="regression-card">
      <div className="regression-header">Regression</div>
      <div className="regression-body">
        <label className="regression-label">Data source</label>
        <div className="source-buttons">
          <button
            className={`source-btn${regressionSource === 'points' ? ' active' : ''}`}
            onClick={() => onSourceChange('points')}
          >
            Placed Points ({placedCount})
          </button>
          <button
            className={`source-btn${regressionSource === 'table' ? ' active' : ''}`}
            onClick={() => onSourceChange('table')}
          >
            Table ({tableCount})
          </button>
        </div>
        <label className="regression-label">Type</label>
        <select
          className="regression-select"
          value={regressionType ?? ''}
          onChange={e => onRegressionTypeChange(e.target.value || null)}
        >
          <option value="">None</option>
          <option value="linear">Linear (degree 1)</option>
          <option value="quadratic">Quadratic (degree 2)</option>
          <option value="cubic">Cubic (degree 3)</option>
        </select>
        {needsMore && (
          <p className="regression-hint">
            Need {MIN_POINTS[regressionType]} points ({activeCount} in selected source).
          </p>
        )}
        {result && (
          <div className="regression-result">
            <p className="regression-eq-label">Equation</p>
            <p className="regression-equation">{result.expression}</p>
            <p className="regression-r2">R² = {result.r2.toFixed(4)}</p>
          </div>
        )}
      </div>
    </div>
  )
}

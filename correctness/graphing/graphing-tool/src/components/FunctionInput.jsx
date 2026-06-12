import { useState, useCallback } from 'react'

export function FunctionInput({ defaultValue, onSubmit, error }) {
  const [value, setValue] = useState(defaultValue)

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    onSubmit(value.trim())
  }, [value, onSubmit])

  return (
    <div className="input-card">
      <form className="input-row" onSubmit={handleSubmit}>
        <span className="function-label">f(x) =</span>
        <input
          className="function-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. sin(x), x^2, cos(x)/x"
          spellCheck={false}
          autoComplete="off"
        />
        <button className="graph-button" type="submit">Graph</button>
      </form>
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}

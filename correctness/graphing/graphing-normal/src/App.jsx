import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { evaluate } from 'mathjs'
import { polyRegression, expRegression, logRegression, powerRegression } from './regression'
import './App.css'

const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#16a085']
const POINT_COLOR = '#2ecc71'
const REGR_COLOR  = '#9b59b6'

const REGR_TYPES = [
  { id: 'linear', label: 'Linear',      minPts: 2 },
  { id: 'quad',   label: 'Quadratic',   minPts: 3 },
  { id: 'cubic',  label: 'Cubic',       minPts: 4 },
  { id: 'exp',    label: 'Exponential', minPts: 2 },
  { id: 'log',    label: 'Logarithmic', minPts: 2 },
  { id: 'power',  label: 'Power',       minPts: 2 },
]

function runRegression(type, pts) {
  switch (type) {
    case 'linear': return polyRegression(pts, 1)
    case 'quad':   return polyRegression(pts, 2)
    case 'cubic':  return polyRegression(pts, 3)
    case 'exp':    return expRegression(pts)
    case 'log':    return logRegression(pts)
    case 'power':  return powerRegression(pts)
    default: return null
  }
}

function parseRows(rows) {
  return rows
    .filter(r => r.x !== '' && r.y !== '' && !isNaN(+r.x) && !isNaN(+r.y))
    .map(r => ({ x: +r.x, y: +r.y }))
}

function niceStep(range, targetCount) {
  const rough = range / targetCount
  const mag = Math.pow(10, Math.floor(Math.log10(rough)))
  const norm = rough / mag
  let nice
  if (norm < 1.5) nice = 1
  else if (norm < 3.5) nice = 2
  else if (norm < 7.5) nice = 5
  else nice = 10
  return nice * mag
}

function formatNum(n) {
  if (Math.abs(n) >= 10000 || (Math.abs(n) < 0.001 && n !== 0)) return n.toExponential(1)
  return parseFloat(n.toPrecision(4)).toString()
}

const RESERVED = new Set(['x', 'e', 'i', 'pi', 'Infinity', 'NaN', 'true', 'false'])

function isValidName(name) {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name) && !RESERVED.has(name)
}

// Evaluates each variable's value in order so later vars can reference earlier ones.
function buildScope(variables) {
  const scope = {}
  for (const v of variables) {
    if (!v.name || !v.value.trim() || !isValidName(v.name)) continue
    try {
      const val = evaluate(v.value, { ...scope })
      if (typeof val === 'number' && isFinite(val)) scope[v.name] = val
    } catch {}
  }
  return scope
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

function GraphCanvas({ functions, points, regrResult, scope, xMin, xMax, yMin, yMax, onCanvasClick }) {
  const canvasRef = useRef(null)
  const [size, setSize] = useState([900, 600])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect()
      const w = Math.round(rect.width)
      const h = Math.round(rect.height)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        setSize([w, h])
      }
    })
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    if (width === 0 || height === 0) return

    const toX = x => ((x - xMin) / (xMax - xMin)) * width
    const toY = y => ((yMax - y) / (yMax - yMin)) * height

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#0f0f1a'
    ctx.fillRect(0, 0, width, height)

    const stepX = niceStep(xMax - xMin, 10)
    const stepY = niceStep(yMax - yMin, 8)

    ctx.strokeStyle = '#1e1e3a'
    ctx.lineWidth = 1
    for (let x = Math.ceil(xMin / stepX) * stepX; x <= xMax; x += stepX) {
      const cx = toX(x); ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, height); ctx.stroke()
    }
    for (let y = Math.ceil(yMin / stepY) * stepY; y <= yMax; y += stepY) {
      const cy = toY(y); ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(width, cy); ctx.stroke()
    }

    ctx.strokeStyle = '#3a3a6a'
    ctx.lineWidth = 1.5
    const cx0 = toX(0), cy0 = toY(0)
    ctx.beginPath(); ctx.moveTo(cx0, 0); ctx.lineTo(cx0, height); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, cy0); ctx.lineTo(width, cy0); ctx.stroke()

    ctx.fillStyle = '#555580'
    ctx.font = '11px monospace'
    ctx.textAlign = 'center'
    for (let x = Math.ceil(xMin / stepX) * stepX; x <= xMax; x += stepX) {
      if (Math.abs(x) < stepX * 0.01) continue
      ctx.fillText(formatNum(x), toX(x), Math.min(Math.max(cy0 + 14, 14), height - 4))
    }
    ctx.textAlign = 'right'
    for (let y = Math.ceil(yMin / stepY) * stepY; y <= yMax; y += stepY) {
      if (Math.abs(y) < stepY * 0.01) continue
      ctx.fillText(formatNum(y), Math.min(Math.max(cx0 - 4, 4), width - 4), toY(y) + 4)
    }

    function plotCurve(expr, color, lineWidth, dashed) {
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.setLineDash(dashed ? [8, 5] : [])
      ctx.beginPath()
      let down = false
      const steps = width * 2
      for (let i = 0; i <= steps; i++) {
        const x = xMin + (i / steps) * (xMax - xMin)
        let y
        try {
          y = evaluate(expr, { ...scope, x })
          if (typeof y !== 'number' || !isFinite(y)) throw new Error()
        } catch { down = false; continue }
        if (!down) { ctx.moveTo(toX(x), toY(y)); down = true }
        else ctx.lineTo(toX(x), toY(y))
      }
      ctx.stroke()
      ctx.setLineDash([])
    }

    functions.forEach(({ expr, color, visible }) => {
      if (!visible || !expr.trim()) return
      plotCurve(expr, color, 2.5, false)
    })

    if (regrResult?.expr) {
      plotCurve(regrResult.expr, REGR_COLOR, 2.2, true)
    }

    if (points.length) {
      ctx.fillStyle = POINT_COLOR
      ctx.strokeStyle = '#0f0f1a'
      ctx.lineWidth = 1.5
      for (const p of points) {
        ctx.beginPath()
        ctx.arc(toX(p.x), toY(p.y), 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }
    }
  }, [functions, points, regrResult, scope, xMin, xMax, yMin, yMax, size])

  useEffect(() => { draw() }, [draw])

  function handleClick(e) {
    if (!onCanvasClick) return
    const rect = canvasRef.current.getBoundingClientRect()
    const gx = xMin + ((e.clientX - rect.left) / rect.width) * (xMax - xMin)
    const gy = yMax - ((e.clientY - rect.top) / rect.height) * (yMax - yMin)
    onCanvasClick(parseFloat(gx.toPrecision(4)), parseFloat(gy.toPrecision(4)))
  }

  return (
    <canvas
      ref={canvasRef}
      className={`graph-canvas${onCanvasClick ? ' clickable' : ''}`}
      onClick={handleClick}
    />
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState('functions')

  // Functions
  const [functions, setFunctions] = useState([
    { id: 1, expr: 'sin(x)', color: COLORS[0], visible: true },
    { id: 2, expr: '', color: COLORS[1], visible: true },
  ])
  const [nextFnId, setNextFnId] = useState(3)
  const [fnErrors, setFnErrors] = useState({})

  // Variables
  const [variables, setVariables] = useState([{ id: 1, name: 'a', value: '1' }])
  const [nextVarId, setNextVarId] = useState(2)
  const scope = useMemo(() => buildScope(variables), [variables])

  // Points (shown on graph, click-to-add)
  const [points, setPoints] = useState([])
  const [nextPtId, setNextPtId] = useState(1)
  const [newX, setNewX] = useState('')
  const [newY, setNewY] = useState('')

  // Table (data only, not on graph)
  const [tableRows, setTableRows] = useState([{ id: 1, x: '', y: '' }])
  const [nextRowId, setNextRowId] = useState(2)

  // Regression
  const [regr, setRegr] = useState({ source: 'points', type: 'linear', result: null, error: null })

  // View range
  const [xMin, setXMin] = useState(-10)
  const [xMax, setXMax] = useState(10)
  const [yMin, setYMin] = useState(-6)
  const [yMax, setYMax] = useState(6)

  // ── Function ops ──
  function updateExpr(id, expr) {
    setFunctions(fns => fns.map(f => f.id === id ? { ...f, expr } : f))
    if (expr.trim()) {
      try { evaluate(expr, { ...scope, x: 1 }); setFnErrors(e => ({ ...e, [id]: null })) }
      catch { setFnErrors(e => ({ ...e, [id]: 'Invalid' })) }
    } else {
      setFnErrors(e => ({ ...e, [id]: null }))
    }
  }
  function toggleFn(id) { setFunctions(fns => fns.map(f => f.id === id ? { ...f, visible: !f.visible } : f)) }
  function removeFn(id) { setFunctions(fns => fns.filter(f => f.id !== id)) }
  function addFn(expr = '', color = null) {
    const id = nextFnId
    setFunctions(fns => [...fns, { id, expr, color: color ?? COLORS[(id - 1) % COLORS.length], visible: true }])
    setNextFnId(n => n + 1)
  }

  // ── Variable ops ──
  function addVar() {
    const id = nextVarId
    setVariables(vs => [...vs, { id, name: '', value: '' }])
    setNextVarId(n => n + 1)
  }
  function removeVar(id) { setVariables(vs => vs.filter(v => v.id !== id)) }
  function updateVar(id, field, value) {
    setVariables(vs => vs.map(v => v.id === id ? { ...v, [field]: value } : v))
  }

  // ── Point ops ──
  function addPoint(x, y) {
    setPoints(pts => [...pts, { id: nextPtId, x, y }])
    setNextPtId(n => n + 1)
    setRegr(r => ({ ...r, result: null, error: null }))
  }

  function addPointManual() {
    const x = parseFloat(newX), y = parseFloat(newY)
    if (isNaN(x) || isNaN(y)) return
    addPoint(x, y)
    setNewX(''); setNewY('')
  }

  function removePoint(id) {
    setPoints(pts => pts.filter(p => p.id !== id))
    setRegr(r => ({ ...r, result: null, error: null }))
  }

  // ── Table ops ──
  function addRow() {
    setTableRows(rows => [...rows, { id: nextRowId, x: '', y: '' }])
    setNextRowId(n => n + 1)
  }

  function removeRow(id) {
    setTableRows(rows => {
      const next = rows.filter(r => r.id !== id)
      return next.length ? next : [{ id: nextRowId, x: '', y: '' }]
    })
    setNextRowId(n => n + 1)
    setRegr(r => ({ ...r, result: null, error: null }))
  }

  function updateRow(id, field, value) {
    setTableRows(rows => rows.map(r => r.id === id ? { ...r, [field]: value } : r))
    setRegr(r => ({ ...r, result: null, error: null }))
  }

  // ── Regression ──
  function fitRegression() {
    const srcData = regr.source === 'points'
      ? points.map(p => ({ x: p.x, y: p.y }))
      : parseRows(tableRows)
    const result = runRegression(regr.type, srcData)
    setRegr(r => ({
      ...r,
      result: result ?? null,
      error: result ? null : 'Not enough valid data for this regression type.',
    }))
  }

  const regrTypeInfo = REGR_TYPES.find(t => t.id === regr.type)
  const srcData = regr.source === 'points'
    ? points
    : parseRows(tableRows)
  const canFit = srcData.length >= (regrTypeInfo?.minPts ?? 2)

  function handleRange(field, val) {
    const n = parseFloat(val); if (isNaN(n)) return
    if (field === 'xMin') setXMin(n)
    if (field === 'xMax') setXMax(n)
    if (field === 'yMin') setYMin(n)
    if (field === 'yMax') setYMax(n)
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="title">Graphing<br />Calculator</h1>

        <div className="tabs">
          <button className={`tab-btn${tab === 'functions' ? ' active' : ''}`} onClick={() => setTab('functions')}>Functions</button>
          <button className={`tab-btn${tab === 'data' ? ' active' : ''}`} onClick={() => setTab('data')}>Data</button>
        </div>

        {/* ── Functions tab ── */}
        {tab === 'functions' && (
          <>
            <section className="functions-section">
              {functions.map(fn => (
                <div key={fn.id} className="fn-row">
                  <button
                    className="color-dot"
                    style={{ background: fn.color, opacity: fn.visible ? 1 : 0.35 }}
                    onClick={() => toggleFn(fn.id)}
                    title="Toggle visibility"
                  />
                  <div className="fn-input-wrap">
                    <span className="fn-label">y =</span>
                    <input
                      className={`fn-input${fnErrors[fn.id] ? ' error' : ''}`}
                      value={fn.expr}
                      onChange={e => updateExpr(fn.id, e.target.value)}
                      placeholder="e.g. x^2, sin(x)"
                      spellCheck={false}
                    />
                    {fnErrors[fn.id] && <span className="error-msg">{fnErrors[fn.id]}</span>}
                  </div>
                  <button className="remove-btn" onClick={() => removeFn(fn.id)}>×</button>
                </div>
              ))}
              <button className="add-btn" onClick={() => addFn()}>+ Add function</button>
            </section>

            <section className="vars-section">
              <h2 className="section-title">Variables</h2>
              {variables.map(v => {
                const nameErr = v.name && !isValidName(v.name)
                let valueErr = false
                if (v.value.trim()) {
                  try { evaluate(v.value, { ...scope }) }
                  catch { valueErr = true }
                }
                const resolved = isValidName(v.name) && v.name in scope
                  ? scope[v.name] : null
                return (
                  <div key={v.id} className="var-row">
                    <input
                      className={`var-name-input${nameErr ? ' error' : ''}`}
                      value={v.name}
                      onChange={e => updateVar(v.id, 'name', e.target.value)}
                      placeholder="name"
                      spellCheck={false}
                    />
                    <span className="var-eq">=</span>
                    <input
                      className={`var-value-input${valueErr ? ' error' : ''}`}
                      value={v.value}
                      onChange={e => updateVar(v.id, 'value', e.target.value)}
                      placeholder="expr"
                      spellCheck={false}
                    />
                    {resolved !== null && (
                      <span className="var-resolved">≈{formatNum(resolved)}</span>
                    )}
                    <button className="remove-btn" onClick={() => removeVar(v.id)}>×</button>
                  </div>
                )
              })}
              <button className="add-btn" onClick={addVar}>+ Add variable</button>
            </section>

            <section className="range-section">
              <h2 className="section-title">View range</h2>
              <div className="range-grid">
                <label>x min<input type="number" value={xMin} onChange={e => handleRange('xMin', e.target.value)} /></label>
                <label>x max<input type="number" value={xMax} onChange={e => handleRange('xMax', e.target.value)} /></label>
                <label>y min<input type="number" value={yMin} onChange={e => handleRange('yMin', e.target.value)} /></label>
                <label>y max<input type="number" value={yMax} onChange={e => handleRange('yMax', e.target.value)} /></label>
              </div>
              <button className="reset-btn" onClick={() => { setXMin(-10); setXMax(10); setYMin(-6); setYMax(6) }}>
                Reset view
              </button>
            </section>

            <section className="help-section">
              <h2 className="section-title">Syntax</h2>
              <ul className="help-list">
                <li><code>x^2</code> power</li>
                <li><code>sqrt(x)</code></li>
                <li><code>sin(x)</code> <code>cos(x)</code> <code>tan(x)</code></li>
                <li><code>log(x)</code> natural log</li>
                <li><code>abs(x)</code></li>
                <li><code>pi</code> <code>e</code></li>
              </ul>
            </section>
          </>
        )}

        {/* ── Data tab ── */}
        {tab === 'data' && (
          <div className="data-tab">

            {/* Points */}
            <section className="data-section">
              <h2 className="section-title">
                Points
                <span className="section-sub"> — click graph to place</span>
              </h2>

              {points.length > 0 && (
                <ul className="point-list">
                  {points.map(p => (
                    <li key={p.id} className="point-chip">
                      <span className="pt-dot" style={{ background: POINT_COLOR }} />
                      <span className="pt-coords">({p.x}, {p.y})</span>
                      <button className="pt-remove" onClick={() => removePoint(p.id)}>×</button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="add-point-form">
                <input
                  className="pt-coord-input"
                  value={newX}
                  onChange={e => setNewX(e.target.value)}
                  placeholder="x"
                  onKeyDown={e => e.key === 'Enter' && addPointManual()}
                />
                <input
                  className="pt-coord-input"
                  value={newY}
                  onChange={e => setNewY(e.target.value)}
                  placeholder="y"
                  onKeyDown={e => e.key === 'Enter' && addPointManual()}
                />
                <button className="add-pt-btn" onClick={addPointManual}>Add</button>
              </div>

              {points.length > 0 && (
                <button className="clear-btn" onClick={() => { setPoints([]); setRegr(r => ({ ...r, result: null })) }}>
                  Clear all
                </button>
              )}
            </section>

            {/* Table */}
            <section className="data-section">
              <h2 className="section-title">Table</h2>
              <table className="ds-table">
                <thead><tr><th>x</th><th>y</th><th /></tr></thead>
                <tbody>
                  {tableRows.map(row => (
                    <tr key={row.id}>
                      <td><input className="pt-input" value={row.x} onChange={e => updateRow(row.id, 'x', e.target.value)} placeholder="x" /></td>
                      <td><input className="pt-input" value={row.y} onChange={e => updateRow(row.id, 'y', e.target.value)} placeholder="y" /></td>
                      <td><button className="pt-remove" onClick={() => removeRow(row.id)}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="add-row-btn" onClick={addRow}>+ row</button>
            </section>

            {/* Regression */}
            <section className="data-section">
              <h2 className="section-title">Regression</h2>

              <div className="regr-source">
                <label className={`radio-label${regr.source === 'points' ? ' selected' : ''}`}>
                  <input type="radio" name="regr-src" value="points" checked={regr.source === 'points'} onChange={() => setRegr(r => ({ ...r, source: 'points', result: null, error: null }))} />
                  Points ({points.length})
                </label>
                <label className={`radio-label${regr.source === 'table' ? ' selected' : ''}`}>
                  <input type="radio" name="regr-src" value="table" checked={regr.source === 'table'} onChange={() => setRegr(r => ({ ...r, source: 'table', result: null, error: null }))} />
                  Table ({parseRows(tableRows).length})
                </label>
              </div>

              <div className="regr-controls">
                <select
                  className="regr-select"
                  value={regr.type}
                  onChange={e => setRegr(r => ({ ...r, type: e.target.value, result: null, error: null }))}
                >
                  {REGR_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
                <button className="fit-btn" onClick={fitRegression} disabled={!canFit}>Fit</button>
              </div>

              {!canFit && srcData.length > 0 && (
                <p className="regr-hint">Need {regrTypeInfo?.minPts} points for {regrTypeInfo?.label.toLowerCase()}</p>
              )}

              {regr.error && <p className="regr-error">{regr.error}</p>}

              {regr.result && (
                <div className="regr-result">
                  <div className="regr-expr">y = {regr.result.expr}</div>
                  <div className="regr-r2">R² = {regr.result.r2.toFixed(4)}</div>
                  <button className="send-fn-btn" onClick={() => { addFn(regr.result.expr, REGR_COLOR); setTab('functions') }}>
                    → Add to functions
                  </button>
                </div>
              )}
            </section>

          </div>
        )}
      </aside>

      <main className="canvas-area">
        <GraphCanvas
          functions={functions}
          points={points}
          regrResult={regr.result}
          scope={scope}
          xMin={xMin} xMax={xMax}
          yMin={yMin} yMax={yMax}
          onCanvasClick={tab === 'data' ? addPoint : null}
        />
      </main>
    </div>
  )
}

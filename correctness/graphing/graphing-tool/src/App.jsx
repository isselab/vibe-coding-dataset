import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { GraphCanvas } from './components/GraphCanvas'
import { FunctionInput } from './components/FunctionInput'
import { DataTable } from './components/DataTable'
import { PlacedPointsList } from './components/PlacedPointsList'
import { RegressionPanel } from './components/RegressionPanel'
import { VariablesPanel } from './components/VariablesPanel'
import { evaluateExpression } from './utils/evaluate'
import { polynomialRegression } from './utils/regression'

// &line[ViewportControl]
const DEFAULT_VIEWPORT = { xMin: -10, xMax: 10, yMin: -6.5, yMax: 6.5 }

// &line[Regression]
const DEGREE_MAP = { linear: 1, quadratic: 2, cubic: 3 }

export default function App() {
  const nextId = useRef(1)

  // &begin[FunctionInput]
  const [expression, setExpression] = useState('sin(x)')
  const [error, setError] = useState('')
  // &end[FunctionInput]

  // &line[ViewportControl]
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT)

  // &begin[Variables]
  const [variables, setVariables] = useState([])

  const addVariable = useCallback(() => {
    setVariables(prev => [...prev, { id: nextId.current++, name: '', value: '' }])
  }, [])
  const removeVariable = useCallback((id) => {
    setVariables(prev => prev.filter(v => v.id !== id))
  }, [])
  const updateVariable = useCallback((id, field, value) => {
    setVariables(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v))
  }, [])

  const variableScope = useMemo(() => {
    const scope = {}
    for (const v of variables) {
      if (v.name && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(v.name) && v.name !== 'x') {
        const num = parseFloat(v.value)
        if (isFinite(num)) scope[v.name] = num
      }
    }
    return scope
  }, [variables])
  // &end[Variables]

  // &begin[FunctionInput]
  const handleSubmit = useCallback((value) => {
    try {
      evaluateExpression(value, 0, variableScope)
      setExpression(value)
      setError('')
    } catch (e) {
      setError(e.message || 'Invalid expression')
    }
  }, [variableScope])

  // &begin[Variables]
  useEffect(() => {
    if (!expression) return
    try {
      evaluateExpression(expression, 0, variableScope)
      setError('')
    } catch (e) {
      setError(e.message || 'Invalid expression')
    }
  }, [variableScope])
  // &end[Variables]
  // &end[FunctionInput]

  // &begin[DataPoints]
  const [placedPoints, setPlacedPoints] = useState([])

  const addPlacedPoint = useCallback((x, y) => {
    setPlacedPoints(prev => [...prev, { id: nextId.current++, x, y }])
  }, [])
  const removePlacedPoint = useCallback((id) => {
    setPlacedPoints(prev => prev.filter(p => p.id !== id))
  }, [])
  const clearPlacedPoints = useCallback(() => setPlacedPoints([]), [])
  // &end[DataPoints]

  // &begin[DataTable]
  const [tableRows, setTableRows] = useState([])

  const addTableRow = useCallback((x = '', y = '') => {
    setTableRows(prev => [...prev, { id: nextId.current++, x: String(x), y: String(y) }])
  }, [])
  const removeTableRow = useCallback((id) => {
    setTableRows(prev => prev.filter(p => p.id !== id))
  }, [])
  const updateTableRow = useCallback((id, field, value) => {
    setTableRows(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }, [])

  const validTablePoints = useMemo(() =>
    tableRows
      .map(p => ({ x: parseFloat(p.x), y: parseFloat(p.y) }))
      .filter(p => isFinite(p.x) && isFinite(p.y)),
    [tableRows]
  )
  // &end[DataTable]

  // &begin[Regression]
  const [regressionType, setRegressionType] = useState(null)
  const [regressionSource, setRegressionSource] = useState('points')

  const regressionInputPoints = useMemo(() => {
    const source = regressionSource === 'points' ? placedPoints : validTablePoints
    return source.map(({ x, y }) => ({ x, y }))
  }, [regressionSource, placedPoints, validTablePoints])

  const regressionResult = useMemo(() => {
    if (!regressionType || regressionInputPoints.length < 2) return null
    return polynomialRegression(regressionInputPoints, DEGREE_MAP[regressionType])
  }, [regressionInputPoints, regressionType])

  const regressionFn = useMemo(() => {
    if (!regressionResult) return null
    const { coefficients } = regressionResult
    return (x) => coefficients.reduce((sum, c, i) => sum + c * x ** i, 0)
  }, [regressionResult])
  // &end[Regression]

  return (
    <div className="app">
      <h1 className="app-title">Graphing Calculator</h1>
      <FunctionInput defaultValue="sin(x)" onSubmit={handleSubmit} error={error} />
      <VariablesPanel
        variables={variables}
        onAdd={addVariable}
        onRemove={removeVariable}
        onUpdate={updateVariable}
      />
      <div className="canvas-card">
        <GraphCanvas
          expression={expression}
          viewport={viewport}
          onViewportChange={setViewport}
          dataPoints={placedPoints}
          onAddPoint={addPlacedPoint}
          regressionFn={regressionFn}
          variableScope={variableScope}
        />
        <p className="hint-text">Click to add point &middot; Scroll to zoom &middot; Drag to pan</p>
      </div>
      <div className="data-section">
        <PlacedPointsList
          points={placedPoints}
          onRemove={removePlacedPoint}
          onClearAll={clearPlacedPoints}
        />
        <RegressionPanel
          placedCount={placedPoints.length}
          tableCount={validTablePoints.length}
          regressionSource={regressionSource}
          onSourceChange={setRegressionSource}
          regressionType={regressionType}
          onRegressionTypeChange={setRegressionType}
          result={regressionResult}
        />
      </div>
      <DataTable
        points={tableRows}
        onAdd={addTableRow}
        onRemove={removeTableRow}
        onUpdate={updateTableRow}
      />
    </div>
  )
}

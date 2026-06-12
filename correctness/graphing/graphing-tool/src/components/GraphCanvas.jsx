import { useRef, useEffect, useCallback, useState } from 'react'
import { evaluateExpression } from '../utils/evaluate'

const GRID_COLOR = '#e2e8f0'
const AXIS_COLOR = '#475569'
const LABEL_COLOR = '#64748b'
const FUNCTION_COLOR = '#2563eb'
const REGRESSION_COLOR = '#e85d04'
const POINT_COLOR = '#e85d04'

export function GraphCanvas({
  expression, viewport, onViewportChange,
  dataPoints = [], onAddPoint, regressionFn,
  variableScope = {},
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 520 })
  const isPanning = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const mouseDownPos = useRef(null) // &line[DataPoints]

  // &begin[ViewportControl]
  const [isDragging, setIsDragging] = useState(false)
  // &end[ViewportControl]

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(([entry]) => {
      const w = Math.floor(entry.contentRect.width)
      setCanvasSize({ width: w, height: Math.floor(w * 0.65) })
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const mathToCanvas = useCallback((mathX, mathY) => {
    const { width, height } = canvasSize
    return {
      x: ((mathX - viewport.xMin) / (viewport.xMax - viewport.xMin)) * width,
      y: height - ((mathY - viewport.yMin) / (viewport.yMax - viewport.yMin)) * height,
    }
  }, [viewport, canvasSize])

  const canvasToMath = useCallback((canvasX, canvasY) => {
    const { width, height } = canvasSize
    return {
      x: viewport.xMin + (canvasX / width) * (viewport.xMax - viewport.xMin),
      y: viewport.yMin + ((height - canvasY) / height) * (viewport.yMax - viewport.yMin),
    }
  }, [viewport, canvasSize])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { width, height } = canvasSize

    ctx.clearRect(0, 0, width, height)

    // &begin[CoordinateGrid]
    const xRange = viewport.xMax - viewport.xMin
    const yRange = viewport.yMax - viewport.yMin
    const gridStep = niceStep(Math.max(xRange, yRange) / 12)

    ctx.lineWidth = 1
    ctx.strokeStyle = GRID_COLOR

    const xStart = Math.ceil(viewport.xMin / gridStep) * gridStep
    for (let gx = xStart; gx <= viewport.xMax + gridStep * 0.01; gx += gridStep) {
      const { x: cx } = mathToCanvas(gx, 0)
      ctx.beginPath()
      ctx.moveTo(cx, 0)
      ctx.lineTo(cx, height)
      ctx.stroke()
    }

    const yStart = Math.ceil(viewport.yMin / gridStep) * gridStep
    for (let gy = yStart; gy <= viewport.yMax + gridStep * 0.01; gy += gridStep) {
      const { y: cy } = mathToCanvas(0, gy)
      ctx.beginPath()
      ctx.moveTo(0, cy)
      ctx.lineTo(width, cy)
      ctx.stroke()
    }

    ctx.lineWidth = 2
    ctx.strokeStyle = AXIS_COLOR

    const { x: axisX, y: axisY } = mathToCanvas(0, 0)

    if (axisX >= 0 && axisX <= width) {
      ctx.beginPath()
      ctx.moveTo(axisX, 0)
      ctx.lineTo(axisX, height)
      ctx.stroke()
    }

    if (axisY >= 0 && axisY <= height) {
      ctx.beginPath()
      ctx.moveTo(0, axisY)
      ctx.lineTo(width, axisY)
      ctx.stroke()
    }

    ctx.fillStyle = LABEL_COLOR
    ctx.font = '11px monospace'

    const labelAxisY = Math.min(Math.max(axisY, 16), height - 6)
    const labelAxisX = Math.min(Math.max(axisX, 30), width - 10)

    ctx.textAlign = 'center'
    for (let gx = xStart; gx <= viewport.xMax + gridStep * 0.01; gx += gridStep) {
      if (Math.abs(gx) < gridStep * 0.01) continue
      const { x: cx } = mathToCanvas(gx, 0)
      ctx.fillText(fmtLabel(gx), cx, labelAxisY + 14)
    }

    ctx.textAlign = 'right'
    for (let gy = yStart; gy <= viewport.yMax + gridStep * 0.01; gy += gridStep) {
      if (Math.abs(gy) < gridStep * 0.01) continue
      const { y: cy } = mathToCanvas(0, gy)
      ctx.fillText(fmtLabel(gy), labelAxisX - 4, cy + 4)
    }
    // &end[CoordinateGrid]

    // &begin[Regression]
    if (regressionFn) {
      ctx.strokeStyle = REGRESSION_COLOR
      ctx.lineWidth = 2
      ctx.setLineDash([7, 4])
      ctx.beginPath()
      let penDown = false
      let prevCy = 0
      for (let px = 0; px < width; px++) {
        const { x: mathX } = canvasToMath(px, 0)
        const mathY = regressionFn(mathX)
        if (!isFinite(mathY) || isNaN(mathY)) { penDown = false; continue }
        const { y: cy } = mathToCanvas(mathX, mathY)
        if (penDown && Math.abs(cy - prevCy) > height * 1.5) penDown = false
        if (!penDown) { ctx.moveTo(px, cy); penDown = true } else ctx.lineTo(px, cy)
        prevCy = cy
      }
      ctx.stroke()
      ctx.setLineDash([])
    }
    // &end[Regression]

    // &begin[FunctionPlot]
    if (expression) {
      ctx.strokeStyle = FUNCTION_COLOR
      ctx.lineWidth = 2.5
      ctx.beginPath()

      let penDown = false
      let prevCy = 0

      for (let px = 0; px < width; px++) {
        const { x: mathX } = canvasToMath(px, 0)
        let mathY
        try {
          mathY = evaluateExpression(expression, mathX, variableScope) // &line[Variables]
        } catch {
          penDown = false
          continue
        }

        if (!isFinite(mathY) || isNaN(mathY)) {
          penDown = false
          continue
        }

        const { y: cy } = mathToCanvas(mathX, mathY)

        if (penDown && Math.abs(cy - prevCy) > height * 1.5) {
          penDown = false
        }

        if (!penDown) {
          ctx.moveTo(px, cy)
          penDown = true
        } else {
          ctx.lineTo(px, cy)
        }
        prevCy = cy
      }
      ctx.stroke()
    }
    // &end[FunctionPlot]

    // &begin[DataPoints]
    for (const { x: mx, y: my } of dataPoints) {
      const { x: cx, y: cy } = mathToCanvas(mx, my)
      ctx.beginPath()
      ctx.arc(cx, cy, 5, 0, Math.PI * 2)
      ctx.fillStyle = POINT_COLOR
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
    // &end[DataPoints]

  }, [expression, viewport, canvasSize, mathToCanvas, canvasToMath, dataPoints, regressionFn, variableScope])

  // &begin[ViewportControl]
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const mouseCanvasX = (e.clientX - rect.left) * scaleX
    const mouseCanvasY = (e.clientY - rect.top) * scaleY
    const { x: mathX, y: mathY } = canvasToMath(mouseCanvasX, mouseCanvasY)
    const factor = e.deltaY > 0 ? 1.15 : 1 / 1.15
    onViewportChange({
      xMin: mathX + (viewport.xMin - mathX) * factor,
      xMax: mathX + (viewport.xMax - mathX) * factor,
      yMin: mathY + (viewport.yMin - mathY) * factor,
      yMax: mathY + (viewport.yMax - mathY) * factor,
    })
  }, [viewport, canvasToMath, onViewportChange])

  const handleMouseDown = useCallback((e) => {
    isPanning.current = true
    setIsDragging(true)
    lastPos.current = { x: e.clientX, y: e.clientY }
    mouseDownPos.current = { x: e.clientX, y: e.clientY } // &line[DataPoints]
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isPanning.current) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const dx = (e.clientX - lastPos.current.x) * scaleX
    const dy = (e.clientY - lastPos.current.y) * scaleY
    lastPos.current = { x: e.clientX, y: e.clientY }

    const xRange = viewport.xMax - viewport.xMin
    const yRange = viewport.yMax - viewport.yMin
    const dMathX = -(dx / canvasSize.width) * xRange
    const dMathY = (dy / canvasSize.height) * yRange

    onViewportChange({
      xMin: viewport.xMin + dMathX,
      xMax: viewport.xMax + dMathX,
      yMin: viewport.yMin + dMathY,
      yMax: viewport.yMax + dMathY,
    })
  }, [viewport, canvasSize, onViewportChange])
  // &end[ViewportControl]

  // &begin[DataPoints]
  const handleMouseUp = useCallback((e) => {
    if (isPanning.current && mouseDownPos.current && onAddPoint) {
      const dx = e.clientX - mouseDownPos.current.x
      const dy = e.clientY - mouseDownPos.current.y
      if (Math.sqrt(dx * dx + dy * dy) < 5) {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const { x: mathX, y: mathY } = canvasToMath(
          (e.clientX - rect.left) * scaleX,
          (e.clientY - rect.top) * scaleY
        )
        onAddPoint(parseFloat(mathX.toPrecision(5)), parseFloat(mathY.toPrecision(5)))
      }
    }
    isPanning.current = false // &line[ViewportControl]
    setIsDragging(false) // &line[ViewportControl]
    mouseDownPos.current = null
  }, [canvasToMath, onAddPoint])
  // &end[DataPoints]

  // &begin[ViewportControl]
  const handleMouseLeave = useCallback(() => {
    isPanning.current = false
    setIsDragging(false)
    mouseDownPos.current = null
  }, [])
  // &end[ViewportControl]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ display: 'block', width: '100%', cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  )
}

function niceStep(roughStep) {
  if (roughStep <= 0) return 1
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)))
  const residual = roughStep / magnitude
  if (residual < 1.5) return magnitude
  if (residual < 3.5) return 2 * magnitude
  if (residual < 7.5) return 5 * magnitude
  return 10 * magnitude
}

function fmtLabel(value) {
  if (Math.abs(value) >= 10000 || (Math.abs(value) < 0.001 && value !== 0)) {
    return value.toExponential(1)
  }
  return parseFloat(value.toPrecision(4)).toString()
}

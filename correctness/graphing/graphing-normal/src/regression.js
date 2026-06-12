import { lusolve } from 'mathjs'

function fmt(n) {
  return parseFloat(n.toPrecision(5))
}

function r2(points, predict) {
  const yMean = points.reduce((s, p) => s + p.y, 0) / points.length
  const ssTot = points.reduce((s, p) => s + (p.y - yMean) ** 2, 0)
  const ssRes = points.reduce((s, p) => s + (p.y - predict(p.x)) ** 2, 0)
  if (ssTot === 0) return 1
  return Math.max(0, Math.min(1, 1 - ssRes / ssTot))
}

function buildPolyExpr(coeffs) {
  const terms = []
  for (let i = coeffs.length - 1; i >= 0; i--) {
    const c = coeffs[i]
    if (Math.abs(c) < 1e-10) continue
    const cf = fmt(c)
    if (i === 0) terms.push(`${cf}`)
    else if (i === 1) terms.push(`(${cf}) * x`)
    else terms.push(`(${cf}) * x^${i}`)
  }
  if (!terms.length) return '0'
  return terms.join(' + ').replace(/\+ \(-/g, '- (')
}

function solveLS(A, b) {
  try {
    const sol = lusolve(A, b)
    // lusolve may return DenseMatrix or nested arrays
    return Array.from({ length: sol.length }, (_, i) => {
      const v = sol[i]
      return Array.isArray(v) ? v[0] : +v
    })
  } catch {
    return null
  }
}

export function polyRegression(points, degree) {
  if (points.length < degree + 1) return null
  const n = degree + 1
  const pw = new Array(2 * degree + 1).fill(0)
  const rhs = new Array(n).fill(0)
  for (const { x, y } of points) {
    for (let i = 0; i <= 2 * degree; i++) pw[i] += x ** i
    for (let i = 0; i < n; i++) rhs[i] += y * x ** i
  }
  const A = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => pw[i + j])
  )
  const coeffs = solveLS(A, rhs)
  if (!coeffs) return null
  const expr = buildPolyExpr(coeffs)
  const r2val = r2(points, x => coeffs.reduce((s, c, i) => s + c * x ** i, 0))
  return { expr, r2: r2val }
}

export function expRegression(points) {
  const valid = points.filter(p => p.y > 0)
  if (valid.length < 2) return null
  const lx = valid.map(p => p.x)
  const ly = valid.map(p => Math.log(p.y))
  const n = valid.length
  const sx = lx.reduce((s, v) => s + v, 0)
  const sy = ly.reduce((s, v) => s + v, 0)
  const sxx = lx.reduce((s, v) => s + v * v, 0)
  const sxy = lx.reduce((s, v, i) => s + v * ly[i], 0)
  const denom = n * sxx - sx * sx
  if (Math.abs(denom) < 1e-12) return null
  const b = (n * sxy - sx * sy) / denom
  const a = Math.exp((sy - b * sx) / n)
  const expr = `(${fmt(a)}) * exp((${fmt(b)}) * x)`
  const r2val = r2(valid, x => a * Math.exp(b * x))
  return { expr, r2: r2val }
}

export function logRegression(points) {
  const valid = points.filter(p => p.x > 0)
  if (valid.length < 2) return null
  const lx = valid.map(p => Math.log(p.x))
  const ys = valid.map(p => p.y)
  const n = valid.length
  const sx = lx.reduce((s, v) => s + v, 0)
  const sy = ys.reduce((s, v) => s + v, 0)
  const sxx = lx.reduce((s, v) => s + v * v, 0)
  const sxy = lx.reduce((s, v, i) => s + v * ys[i], 0)
  const denom = n * sxx - sx * sx
  if (Math.abs(denom) < 1e-12) return null
  const b = (n * sxy - sx * sy) / denom
  const a = (sy - b * sx) / n
  const expr = `(${fmt(a)}) + (${fmt(b)}) * log(x)`.replace('+ (-', '- (')
  const r2val = r2(valid, x => a + b * Math.log(x))
  return { expr, r2: r2val }
}

export function powerRegression(points) {
  const valid = points.filter(p => p.x > 0 && p.y > 0)
  if (valid.length < 2) return null
  const lx = valid.map(p => Math.log(p.x))
  const ly = valid.map(p => Math.log(p.y))
  const n = valid.length
  const sx = lx.reduce((s, v) => s + v, 0)
  const sy = ly.reduce((s, v) => s + v, 0)
  const sxx = lx.reduce((s, v) => s + v * v, 0)
  const sxy = lx.reduce((s, v, i) => s + v * ly[i], 0)
  const denom = n * sxx - sx * sx
  if (Math.abs(denom) < 1e-12) return null
  const b = (n * sxy - sx * sy) / denom
  const a = Math.exp((sy - b * sx) / n)
  const expr = `(${fmt(a)}) * x^(${fmt(b)})`
  const r2val = r2(valid, x => a * x ** b)
  return { expr, r2: r2val }
}

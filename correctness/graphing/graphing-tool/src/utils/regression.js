function gaussianElimination(A, b) {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])
  for (let col = 0; col < n; col++) {
    let maxRow = col
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row
    }
    ;[M[col], M[maxRow]] = [M[maxRow], M[col]]
    if (Math.abs(M[col][col]) < 1e-12) return null
    for (let row = 0; row < n; row++) {
      if (row === col) continue
      const f = M[row][col] / M[col][col]
      for (let k = col; k <= n; k++) M[row][k] -= f * M[col][k]
    }
  }
  return M.map((row, i) => row[n] / row[i])
}

export function polynomialRegression(points, degree) {
  const n = points.length
  if (n < degree + 1) return null
  const d = degree + 1
  const XtX = Array.from({ length: d }, () => Array(d).fill(0))
  const Xty = Array(d).fill(0)
  for (const { x, y } of points) {
    const xpow = Array.from({ length: 2 * d }, (_, i) => x ** i)
    for (let i = 0; i < d; i++) {
      Xty[i] += xpow[i] * y
      for (let j = 0; j < d; j++) XtX[i][j] += xpow[i + j]
    }
  }
  const coeffs = gaussianElimination(XtX, Xty)
  if (!coeffs) return null
  const fn = x => coeffs.reduce((sum, c, i) => sum + c * x ** i, 0)
  const meanY = points.reduce((s, p) => s + p.y, 0) / n
  const ssTot = points.reduce((s, p) => s + (p.y - meanY) ** 2, 0)
  const ssRes = points.reduce((s, p) => s + (p.y - fn(p.x)) ** 2, 0)
  const r2 = ssTot < 1e-10 ? 1 : 1 - ssRes / ssTot
  return { coefficients: coeffs, expression: toExpression(coeffs), r2 }
}

function toExpression(coeffs) {
  const terms = []
  for (let i = coeffs.length - 1; i >= 0; i--) {
    const c = coeffs[i]
    if (Math.abs(c) < 1e-10) continue
    const abs = Math.abs(parseFloat(c.toPrecision(6)))
    const termStr = i === 0 ? `${abs}` : i === 1 ? `${abs} * x` : `${abs} * x^${i}`
    terms.push({ neg: c < 0, term: termStr })
  }
  if (terms.length === 0) return '0'
  return terms
    .map(({ neg, term }, idx) => (idx === 0 ? (neg ? `-${term}` : term) : (neg ? `- ${term}` : `+ ${term}`)))
    .join(' ')
}

import { compile } from 'mathjs'

const cache = new Map()

export function evaluateExpression(expr, x, variables = {}) {
  if (!cache.has(expr)) {
    cache.set(expr, compile(expr))
  }
  return Number(cache.get(expr).evaluate({ x, ...variables }))
}

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'budget-tracker-data'

const DEFAULT_CATEGORIES = [
  'Housing', 'Food', 'Transport', 'Entertainment',
  'Health', 'Shopping', 'Utilities', 'Savings', 'Other',
]

function advanceDate(dateStr, frequency) {
  const d = new Date(dateStr + 'T00:00:00')
  switch (frequency) {
    case 'daily':     d.setDate(d.getDate() + 1);          break
    case 'weekly':    d.setDate(d.getDate() + 7);          break
    case 'biweekly':  d.setDate(d.getDate() + 14);         break
    case 'monthly':   d.setMonth(d.getMonth() + 1);        break
    case 'quarterly': d.setMonth(d.getMonth() + 3);        break
    case 'yearly':    d.setFullYear(d.getFullYear() + 1);  break
  }
  return d.toISOString().slice(0, 10)
}

// Materialise any due recurring items into transactions.
// Returns updated recurringItems array and new transactions array.
function applyRecurring(transactions, recurringItems) {
  const today = new Date().toISOString().slice(0, 10)
  const existingIds = new Set(transactions.map(t => t.id))
  const newTransactions = []

  const updated = recurringItems.map(item => {
    let nextDate = item.nextDate
    let iterations = 0
    while (nextDate <= today && (!item.endDate || nextDate <= item.endDate) && iterations < 1000) {
      const id = `rec-${item.id}-${nextDate}`
      if (!existingIds.has(id)) {
        newTransactions.push({
          id,
          description: item.description,
          amount: item.amount,
          category: item.category,
          type: item.type,
          date: nextDate + 'T00:00:00',
          recurringId: item.id,
        })
        existingIds.add(id)
      }
      nextDate = advanceDate(nextDate, item.frequency)
      iterations++
    }
    return { ...item, nextDate }
  })

  return { recurringItems: updated, newTransactions }
}

function initialState() {
  let saved = null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) saved = JSON.parse(raw)
  } catch { /* ignore */ }

  const base = {
    // Migrate old transactions: default missing type to 'expense'
    transactions: (saved?.transactions ?? []).map(t => ({ type: 'expense', ...t })),
    categories: saved?.categories ?? DEFAULT_CATEGORIES,
    limits: saved?.limits ?? {},
    goals: saved?.goals ?? [],
    recurringItems: saved?.recurringItems ?? [],
  }

  if (!base.recurringItems.length) return base

  const { recurringItems, newTransactions } = applyRecurring(base.transactions, base.recurringItems)
  return {
    ...base,
    recurringItems,
    transactions: [...newTransactions, ...base.transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
  }
}

export function useBudget() {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // Transactions
  function addTransaction(tx) {
    setState(prev => ({
      ...prev,
      transactions: [
        { type: 'expense', ...tx, id: crypto.randomUUID(), date: tx.date || new Date().toISOString() },
        ...prev.transactions,
      ],
    }))
  }

  function importTransactions(list) {
    setState(prev => {
      const ids = new Set(prev.transactions.map(t => t.id))
      const fresh = list.filter(t => !ids.has(t.id))
      return {
        ...prev,
        transactions: [...fresh, ...prev.transactions]
          .sort((a, b) => new Date(b.date) - new Date(a.date)),
      }
    })
  }

  function deleteTransaction(id) {
    setState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }))
  }

  // Categories / limits
  function addCategory(name) {
    const n = name.trim()
    if (!n || state.categories.includes(n)) return
    setState(prev => ({ ...prev, categories: [...prev.categories, n] }))
  }

  function setCategoryLimit(category, amount) {
    setState(prev => ({ ...prev, limits: { ...prev.limits, [category]: Number(amount) } }))
  }

  function removeCategoryLimit(category) {
    setState(prev => {
      const l = { ...prev.limits }
      delete l[category]
      return { ...prev, limits: l }
    })
  }

  // Goals
  function addGoal(goal) {
    setState(prev => ({
      ...prev,
      goals: [...prev.goals, { savedAmount: 0, ...goal, id: crypto.randomUUID() }],
    }))
  }

  function updateGoal(id, updates) {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, ...updates } : g),
    }))
  }

  function deleteGoal(id) {
    setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }))
  }

  function contributeToGoal(id, amount) {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g =>
        g.id === id ? { ...g, savedAmount: (g.savedAmount || 0) + Number(amount) } : g
      ),
    }))
  }

  // Recurring
  function addRecurring(item) {
    setState(prev => {
      const newItem = { ...item, id: crypto.randomUUID() }
      const { recurringItems, newTransactions } = applyRecurring(prev.transactions, [newItem])
      return {
        ...prev,
        recurringItems: [...prev.recurringItems, recurringItems[0]],
        transactions: [...newTransactions, ...prev.transactions]
          .sort((a, b) => new Date(b.date) - new Date(a.date)),
      }
    })
  }

  function deleteRecurring(id) {
    setState(prev => ({
      ...prev,
      recurringItems: prev.recurringItems.filter(r => r.id !== id),
    }))
  }

  // Analytics
  function monthlySpending(yearMonth) {
    const s = {}
    for (const t of state.transactions) {
      if (t.type === 'income' || !t.date.startsWith(yearMonth)) continue
      s[t.category] = (s[t.category] || 0) + t.amount
    }
    return s
  }

  function monthlyIncome(yearMonth) {
    return state.transactions
      .filter(t => t.type === 'income' && t.date.startsWith(yearMonth))
      .reduce((s, t) => s + t.amount, 0)
  }

  function currentMonthWarnings() {
    const now = new Date()
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const spending = monthlySpending(ym)
    return Object.entries(state.limits)
      .filter(([cat, limit]) => (spending[cat] || 0) > limit)
      .map(([cat, limit]) => ({ category: cat, spent: spending[cat], limit }))
  }

  return {
    transactions: state.transactions,
    categories: state.categories,
    limits: state.limits,
    goals: state.goals,
    recurringItems: state.recurringItems,
    addTransaction,
    importTransactions,
    deleteTransaction,
    addCategory,
    setCategoryLimit,
    removeCategoryLimit,
    addGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
    addRecurring,
    deleteRecurring,
    monthlySpending,
    monthlyIncome,
    currentMonthWarnings,
  }
}

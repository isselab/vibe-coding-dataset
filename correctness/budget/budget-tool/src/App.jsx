import { useEffect, useRef, useState } from 'react'
import { useStorage } from './hooks/useStorage'
import { TransactionForm } from './components/TransactionForm'
import { TransactionList } from './components/TransactionList'
import { CategoryManager } from './components/CategoryManager'
import { SpendWarning } from './components/SpendWarning'
import { Salary } from './components/Salary'
import { Subscriptions } from './components/Subscriptions'
import { SavingGoals } from './components/SavingGoals'
import { CurrencyConverter } from './components/CurrencyConverter'
import './index.css'

// &begin[DataPersistence]
const TRANSACTIONS_KEY = 'bt_transactions'
const CATEGORIES_KEY = 'bt_categories'
const RECURRING_KEY = 'bt_recurring'
const GOALS_KEY = 'bt_goals'
// &end[DataPersistence]

function currentMonthPrefix() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// &begin[Salary]
function advanceDate(dateStr, frequency) {
  const d = new Date(dateStr + 'T00:00:00')
  if (frequency === 'weekly') d.setDate(d.getDate() + 7)
  else if (frequency === 'monthly') d.setMonth(d.getMonth() + 1)
  else if (frequency === 'yearly') d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}
// &end[Salary]

const TABS = ['transactions', 'recurring', 'goals']

export default function App() {
  // &begin[BudgetTracker]
  const [activeTab, setActiveTab] = useState('transactions')
  // &end[BudgetTracker]

  // &begin[DataPersistence]
  const [transactions, setTransactions] = useStorage(TRANSACTIONS_KEY, [])
  const [categories, setCategories] = useStorage(CATEGORIES_KEY, [])
  const [recurring, setRecurring] = useStorage(RECURRING_KEY, [])
  const [goals, setGoals] = useStorage(GOALS_KEY, [])
  // &end[DataPersistence]

  // &begin[Salary]
  const [appliedCount, setAppliedCount] = useState(0)
  const processedRef = useRef(false)
  useEffect(() => {
    if (processedRef.current) return
    processedRef.current = true
    const today = new Date().toISOString().slice(0, 10)
    const newTransactions = []
    const updatedRecurring = recurring.map((r) => {
      if (!r.active || r.nextDue > today) return r
      let nextDue = r.nextDue
      while (nextDue <= today) {
        newTransactions.push({
          id: crypto.randomUUID(),
          description: r.description,
          amount: r.amount,
          category: r.category,
          type: r.type,
          date: nextDue,
        })
        nextDue = advanceDate(nextDue, r.frequency)
      }
      return { ...r, nextDue }
    })
    if (newTransactions.length > 0) {
      setTransactions((prev) => [...prev, ...newTransactions])
      setRecurring(updatedRecurring)
      setAppliedCount(newTransactions.length)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // &end[Salary]

  // &begin[AddTransaction]
  const addTransaction = (t) => setTransactions((prev) => [...prev, t])
  // &end[AddTransaction]

  // &begin[TransactionList]
  const deleteTransaction = (id) =>
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  // &end[TransactionList]

  // &begin[Categories]
  const addCategory = (c) => setCategories((prev) => [...prev, c])
  const deleteCategory = (id) => {
    const cat = categories.find((c) => c.id === id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
    if (cat) setTransactions((prev) => prev.filter((t) => t.category !== cat.name))
  }
  // &end[Categories]

  // &begin[SpendLimit]
  const setLimit = (id, limit) =>
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, limit } : c)))
  // &end[SpendLimit]

  // &begin[SpendLimitWarning]
  const monthPrefix = currentMonthPrefix()
  const warnings = categories
    .filter((c) => c.limit != null)
    .map((c) => {
      const spent = transactions
        .filter((t) => t.category === c.name && t.date.startsWith(monthPrefix) && (t.type ?? 'expense') === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      return { category: c.name, spent, limit: c.limit }
    })
    .filter((w) => w.spent > w.limit)
  // &end[SpendLimitWarning]

  // &begin[Salary]
  const addRecurring = (r) => setRecurring((prev) => [...prev, r])
  const deleteRecurring = (id) => setRecurring((prev) => prev.filter((r) => r.id !== id))
  const toggleRecurring = (id) =>
    setRecurring((prev) => prev.map((r) => r.id === id ? { ...r, active: !r.active } : r))
  // &end[Salary]

  // &begin[SavingGoals]
  const addGoal = (g) => setGoals((prev) => [...prev, g])
  const deleteGoal = (id) => setGoals((prev) => prev.filter((g) => g.id !== id))
  const addFundsToGoal = (id, amount) =>
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, saved: g.saved + amount } : g))
  // &end[SavingGoals]

  return (
    <div className="app">
      <header className="app-header">
        <h1>Budget Tracker</h1>
        {/* &begin[BudgetTracker] */}
        <nav className="tab-nav">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`tab-btn${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
        {/* &end[BudgetTracker] */}
      </header>

      {/* &line[SpendLimitWarning] */}
      <SpendWarning warnings={warnings} />

      {/* &begin[Salary] */}
      {appliedCount > 0 && (
        <div className="applied-banner">
          {appliedCount} recurring transaction{appliedCount !== 1 ? 's' : ''} applied automatically.
          <button className="banner-dismiss" onClick={() => setAppliedCount(0)}>×</button>
        </div>
      )}
      {/* &end[Salary] */}

      <main className="app-main">
        {/* &begin[Transactions] */}
        {activeTab === 'transactions' && (
          <div className="two-col-layout">
            <aside className="left-panel">
              {/* &line[Categories] */}
              <CategoryManager categories={categories} onAdd={addCategory} onDelete={deleteCategory} onSetLimit={setLimit} />
              {/* &line[CurrencyConverter] */}
              <CurrencyConverter />
              {/* &line[AddTransaction] */}
              <TransactionForm categories={categories} onAdd={addTransaction} />
            </aside>
            <section className="right-panel">
              {/* &line[TransactionList] */}
              <TransactionList transactions={transactions} onDelete={deleteTransaction} />
            </section>
          </div>
        )}
        {/* &end[Transactions] */}

        {activeTab === 'recurring' && (
          <div className="recurring-layout">
            {/* &line[Salary] */}
            <Salary
              recurring={recurring}
              categories={categories}
              onAdd={addRecurring}
              onDelete={deleteRecurring}
              onToggle={toggleRecurring}
            />
            {/* &line[Subscriptions] */}
            <Subscriptions
              recurring={recurring}
              categories={categories}
              onAdd={addRecurring}
              onDelete={deleteRecurring}
              onToggle={toggleRecurring}
            />
          </div>
        )}

        {/* &line[SavingGoals] */}
        {activeTab === 'goals' && (
          <SavingGoals goals={goals} onAdd={addGoal} onDelete={deleteGoal} onAddFunds={addFundsToGoal} />
        )}
      </main>
    </div>
  )
}

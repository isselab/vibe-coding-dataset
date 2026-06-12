import React, { useState } from 'react'
import { useBudget } from './hooks/useBudget'
import Dashboard from './components/Dashboard'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import CategoryManager from './components/CategoryManager'
import SalaryManager from './components/SalaryManager'
import SubscriptionManager from './components/SubscriptionManager'
import SavingGoals from './components/SavingGoals'

const TABS = ['Dashboard', 'Transactions', 'Recurring', 'Goals', 'Categories']

export default function App() {
  const [tab, setTab] = useState('Dashboard')
  const b = useBudget()
  const warnings = b.currentMonthWarnings()

  return (
    <div className="app">
      <header className="app-header">
        <h1>Budget Tracker</h1>
        {warnings.length > 0 && (
          <span className="header-warning">
            {warnings.length} limit{warnings.length > 1 ? 's' : ''} exceeded
          </span>
        )}
      </header>

      <nav className="tab-nav">
        {TABS.map(t => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
            {t === 'Dashboard' && warnings.length > 0 && (
              <span className="badge">{warnings.length}</span>
            )}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {tab === 'Dashboard' && (
          <Dashboard
            transactions={b.transactions}
            limits={b.limits}
            monthlySpending={b.monthlySpending}
            monthlyIncome={b.monthlyIncome}
            warnings={warnings}
            goals={b.goals}
          />
        )}
        {tab === 'Transactions' && (
          <>
            <TransactionForm categories={b.categories} onAdd={b.addTransaction} />
            <TransactionList transactions={b.transactions} onDelete={b.deleteTransaction} />
          </>
        )}
        {tab === 'Recurring' && (
          <>
            <SalaryManager
              categories={b.categories}
              recurringItems={b.recurringItems}
              onAdd={b.addRecurring}
              onDelete={b.deleteRecurring}
            />
            <SubscriptionManager
              categories={b.categories}
              recurringItems={b.recurringItems}
              onAdd={b.addRecurring}
              onDelete={b.deleteRecurring}
            />
          </>
        )}
        {tab === 'Goals' && (
          <SavingGoals
            goals={b.goals}
            onAdd={b.addGoal}
            onDelete={b.deleteGoal}
            onContribute={b.contributeToGoal}
          />
        )}
        {tab === 'Categories' && (
          <CategoryManager
            categories={b.categories}
            limits={b.limits}
            onSetLimit={b.setCategoryLimit}
            onRemoveLimit={b.removeCategoryLimit}
            onAddCategory={b.addCategory}
          />
        )}
      </main>
    </div>
  )
}

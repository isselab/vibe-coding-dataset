import React, { useState, useEffect } from 'react'

const today = () => new Date().toISOString().slice(0, 10)

const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'SEK', 'NOK', 'DKK', 'CHF',
  'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL', 'MXN',
  'SGD', 'HKD', 'PLN', 'CZK', 'HUF', 'NZD', 'ZAR', 'TRY',
]

export default function TransactionForm({ categories, onAdd }) {
  const [form, setForm] = useState({
    description: '', amount: '', category: categories[0] || '',
    date: today(), type: 'expense',
  })
  const [error, setError] = useState('')

  // FX converter state
  const [showFx, setShowFx] = useState(false)
  const [foreignAmount, setForeignAmount] = useState('')
  const [fromCurrency, setFromCurrency] = useState('EUR')
  const [toCurrency, setToCurrency] = useState('USD')
  const [rates, setRates] = useState(null)
  const [fxLoading, setFxLoading] = useState(false)
  const [fxError, setFxError] = useState('')

  useEffect(() => {
    if (!showFx) return
    setFxLoading(true)
    setFxError('')
    fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`)
      .then(r => r.json())
      .then(data => {
        if (data.result !== 'success') throw new Error()
        setRates(data.rates)
        setFxLoading(false)
      })
      .catch(() => {
        setFxError('Could not load rates.')
        setFxLoading(false)
      })
  }, [showFx, fromCurrency])

  const parsedForeign = parseFloat(foreignAmount)
  const convertedValue = rates && !isNaN(parsedForeign) && parsedForeign > 0
    ? (parsedForeign * (rates[toCurrency] ?? 0)).toFixed(2)
    : null

  function useConverted() {
    if (!convertedValue) return
    setForm(prev => ({ ...prev, amount: convertedValue }))
    setShowFx(false)
    setForeignAmount('')
  }

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function submit(e) {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!form.description.trim()) { setError('Description is required.'); return }
    if (isNaN(amount) || amount <= 0) { setError('Amount must be a positive number.'); return }
    if (!form.category) { setError('Select a category.'); return }
    setError('')
    onAdd({
      description: form.description.trim(),
      amount,
      category: form.category,
      date: form.date + 'T00:00:00',
      type: form.type,
    })
    setForm(prev => ({ ...prev, description: '', amount: '' }))
  }

  return (
    <form className="transaction-form" onSubmit={submit}>
      <div className="form-header-row">
        <h2>Add Transaction</h2>
        <div className="type-toggle">
          <button type="button" className={form.type === 'expense' ? 'active expense' : ''} onClick={() => set('type', 'expense')}>Expense</button>
          <button type="button" className={form.type === 'income' ? 'active income' : ''} onClick={() => set('type', 'income')}>Income</button>
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}

      <div className="form-row">
        <label>
          Description
          <input type="text" value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Grocery run" maxLength={120} />
        </label>
        <label>
          Amount
          <div className="amount-field-wrap">
            <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" min="0.01" step="0.01" />
            <button
              type="button"
              className={`btn-ghost btn-sm convert-toggle${showFx ? ' open' : ''}`}
              onClick={() => setShowFx(s => !s)}
              title="Convert from a foreign currency"
            >
              FX
            </button>
          </div>
        </label>
      </div>

      {showFx && (
        <div className="currency-helper">
          <div className="converter-inline">
            <label>Foreign amount
              <input type="number" value={foreignAmount} onChange={e => setForeignAmount(e.target.value)} placeholder="0.00" min="0" step="any" autoFocus />
            </label>
            <label>From
              <select value={fromCurrency} onChange={e => setFromCurrency(e.target.value)}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label>To
              <select value={toCurrency} onChange={e => setToCurrency(e.target.value)}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <div className="converter-result">
              {fxLoading && <span className="hint">Loading...</span>}
              {fxError && <span className="fx-error">{fxError}</span>}
              {!fxLoading && convertedValue && (
                <>
                  <span className="converted-display">
                    = {parseFloat(convertedValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}
                  </span>
                  <button type="button" className="btn-primary btn-sm" onClick={useConverted}>Use</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="form-row">
        <label>
          Category
          <select value={form.category} onChange={e => set('category', e.target.value)}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>
          Date
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </label>
      </div>
      <button type="submit" className="btn-primary">Add Transaction</button>
    </form>
  )
}

import { useState } from 'react'

const CURRENCIES = [
  'AED','AUD','BGN','BRL','CAD','CHF','CNY','CZK','DKK',
  'EUR','GBP','HKD','HUF','IDR','ILS','INR','ISK','JPY',
  'KRW','MXN','MYR','NOK','NZD','PHP','PLN','RON','SEK',
  'SGD','THB','TRY','USD','ZAR',
]

export function CurrencyConverter() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('EUR')
  const [result, setResult] = useState(null)
  const [rate, setRate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const convert = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(
        `https://api.frankfurter.app/latest?from=${from}&to=${to}&amount=${encodeURIComponent(amount)}`
      )
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()
      setResult(data.rates[to])
      setRate(data.rates[to] / parseFloat(amount))
    } catch {
      setError('Could not fetch exchange rates. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const swap = () => {
    setFrom(to)
    setTo(from)
    setResult(null)
    setRate(null)
  }

  return (
    <div className="card currency-converter">
      <h2>Currency Converter</h2>
      <div className="converter-row">
        <div className="form-group converter-amount">
          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            step="any"
          />
        </div>
        <div className="form-group converter-select">
          <label>From</label>
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button type="button" className="btn-swap" onClick={swap} title="Swap currencies">⇄</button>
        <div className="form-group converter-select">
          <label>To</label>
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <button className="btn-primary" onClick={convert} disabled={loading || !amount}>
        {loading ? 'Converting...' : 'Convert'}
      </button>
      {error && <p className="converter-error">{error}</p>}
      {result !== null && (
        <div className="converter-result">
          <div className="result-line">
            <span className="result-from">{parseFloat(amount).toFixed(2)} {from}</span>
            <span className="result-eq">=</span>
            <span className="result-to">{result.toFixed(2)} {to}</span>
          </div>
          <p className="result-rate">1 {from} = {rate?.toFixed(6)} {to}</p>
        </div>
      )}
    </div>
  )
}

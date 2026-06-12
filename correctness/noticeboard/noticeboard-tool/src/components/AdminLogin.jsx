import { useState, useEffect } from 'react'
import './AdminLogin.css'

// &begin[AdminAuth]
export default function AdminLogin({ onLogin, onClose }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { ok, error } = await onLogin(password)
    if (!ok) { setError(error || 'Wrong password'); setLoading(false) }
  }

  return (
    <div className="login-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="login-dialog">
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
          />
          {error && <p className="login-error">{error}</p>}
          <div className="login-actions">
            <button type="button" className="login-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="login-submit" disabled={loading || !password}>
              {loading ? '...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
// &end[AdminAuth]

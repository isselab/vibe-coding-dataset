import { useState, useMemo } from 'react'
import {
  ResponsiveContainer, LineChart, Line,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts'

const COLORS = ['#fb923c', '#38bdf8', '#4ade80', '#c084fc', '#f472b6', '#facc15', '#34d399']

const fmtDate = str =>
  new Date(str + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

function getNames(sessions, type) {
  return [...new Set(
    sessions.flatMap(s =>
      s.exercises.filter(e => e.type === type && e.name.trim()).map(e => e.name)
    )
  )].sort()
}

function filterByDate(sessions, from, to) {
  return sessions.filter(s => (!from || s.date >= from) && (!to || s.date <= to))
}

function buildStrengthData(sessions, from, to, nameFilter) {
  const dateMap = new Map()
  filterByDate(sessions, from, to).forEach(session => {
    session.exercises
      .filter(e => e.type === 'strength' && e.name.trim() && e.weight)
      .filter(e => !nameFilter || e.name === nameFilter)
      .forEach(e => {
        if (!dateMap.has(session.date)) dateMap.set(session.date, {})
        const entry = dateMap.get(session.date)
        const w = parseFloat(e.weight)
        entry[e.name] = Math.max(entry[e.name] ?? 0, w)
      })
  })
  return [...dateMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }))
}

function buildCardioData(sessions, from, to, nameFilter) {
  const dateMap = new Map()
  filterByDate(sessions, from, to).forEach(session => {
    session.exercises
      .filter(e => e.type === 'cardio' && e.name.trim() && e.duration && parseFloat(e.distance) > 0)
      .filter(e => !nameFilter || e.name === nameFilter)
      .forEach(e => {
        if (!dateMap.has(session.date)) dateMap.set(session.date, {})
        const entry = dateMap.get(session.date)
        const pace = parseFloat(e.duration) / parseFloat(e.distance)
        if (!entry[e.name]) {
          entry[e.name] = { sum: pace, count: 1 }
        } else {
          entry[e.name].sum += pace
          entry[e.name].count += 1
        }
      })
  })
  return [...dateMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => {
      const point = { date }
      for (const [name, { sum, count }] of Object.entries(vals))
        point[name] = Math.round((sum / count) * 10) / 10
      return point
    })
}

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: 8, color: '#e8e8e8', fontSize: 13,
  },
  labelStyle: { color: '#888', marginBottom: 4 },
  cursor: { stroke: '#2a2a2a' },
}

function Chart({ data, lines, unit, emptyMsg }) {
  if (data.length === 0 || lines.length === 0) {
    return <div className="chart-empty"><p>{emptyMsg}</p></div>
  }
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 6, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#242424" />
          <XAxis
            dataKey="date" tickFormatter={fmtDate}
            tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={v => `${v}${unit}`} width={52}
          />
          <Tooltip
            {...TOOLTIP_STYLE}
            labelFormatter={fmtDate}
            formatter={(v, name) => [`${v}${unit}`, name]}
          />
          {lines.length > 1 && (
            <Legend wrapperStyle={{ fontSize: 12, color: '#666', paddingTop: 10 }} />
          )}
          {lines.map((name, i) => (
            <Line
              key={name} type="monotone" dataKey={name}
              stroke={COLORS[i % COLORS.length]} strokeWidth={2}
              dot={{ r: 3, fill: COLORS[i % COLORS.length], strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function StatsSection({ accent, badge, title, unit, names, data, emptyMsg }) {
  const [nameFilter, setNameFilter] = useState('')

  const lines = useMemo(() => {
    const pool = nameFilter ? [nameFilter] : names
    return pool.filter(n => data.some(d => d[n] != null))
  }, [nameFilter, names, data])

  return (
    <div className="stats-section">
      <div className="stats-section-head">
        <span className={`section-badge ${accent}-badge`}>{badge}</span>
        <span className="stats-section-title">{title}</span>
        {names.length > 0 && (
          <select
            className="filter-select"
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
          >
            <option value="">All exercises</option>
            {names.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        )}
      </div>
      <Chart data={data} lines={lines} unit={unit} emptyMsg={emptyMsg} />
    </div>
  )
}

export function StatsView({ sessions }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const strengthNames = useMemo(() => getNames(sessions, 'strength'), [sessions])
  const cardioNames   = useMemo(() => getNames(sessions, 'cardio'),   [sessions])

  const strengthData = useMemo(() => buildStrengthData(sessions, from, to, ''), [sessions, from, to])
  const cardioData   = useMemo(() => buildCardioData(sessions, from, to, ''),   [sessions, from, to])

  // Per-section name filters are owned inside StatsSection, but we need to
  // re-derive filtered data when nameFilter changes — so pass build fns down.
  // Simpler: lift name filter up here so we can re-compute data.

  return (
    <div className="stats-view">
      <div className="stats-filters">
        <div className="form-group">
          <label>From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div className="form-group">
          <label>To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        {(from || to) && (
          <button className="btn btn-ghost clear-btn" onClick={() => { setFrom(''); setTo('') }}>
            Clear
          </button>
        )}
      </div>

      <StrengthSection sessions={sessions} from={from} to={to} names={strengthNames} />
      <CardioSection   sessions={sessions} from={from} to={to} names={cardioNames} />
    </div>
  )
}

function StrengthSection({ sessions, from, to, names }) {
  const [nameFilter, setNameFilter] = useState('')
  const data = useMemo(
    () => buildStrengthData(sessions, from, to, nameFilter),
    [sessions, from, to, nameFilter]
  )
  const lines = useMemo(
    () => (nameFilter ? [nameFilter] : names).filter(n => data.some(d => d[n] != null)),
    [nameFilter, names, data]
  )
  return (
    <div className="stats-section">
      <div className="stats-section-head">
        <span className="section-badge strength-badge">Strength</span>
        <span className="stats-section-title">Max weight per session</span>
        {names.length > 0 && (
          <select className="filter-select" value={nameFilter} onChange={e => setNameFilter(e.target.value)}>
            <option value="">All exercises</option>
            {names.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        )}
      </div>
      <Chart
        data={data} lines={lines} unit=" kg"
        emptyMsg={names.length === 0 ? 'No strength exercises logged yet.' : 'No data for the selected filters.'}
      />
    </div>
  )
}

function CardioSection({ sessions, from, to, names }) {
  const [nameFilter, setNameFilter] = useState('')
  const data = useMemo(
    () => buildCardioData(sessions, from, to, nameFilter),
    [sessions, from, to, nameFilter]
  )
  const lines = useMemo(
    () => (nameFilter ? [nameFilter] : names).filter(n => data.some(d => d[n] != null)),
    [nameFilter, names, data]
  )
  return (
    <div className="stats-section">
      <div className="stats-section-head">
        <span className="section-badge cardio-badge">Cardio</span>
        <span className="stats-section-title">Average pace — lower is faster</span>
        {names.length > 0 && (
          <select className="filter-select" value={nameFilter} onChange={e => setNameFilter(e.target.value)}>
            <option value="">All exercises</option>
            {names.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        )}
      </div>
      <Chart
        data={data} lines={lines} unit=" min/km"
        emptyMsg={names.length === 0 ? 'No cardio with distance logged yet.' : 'No data for the selected filters.'}
      />
    </div>
  )
}

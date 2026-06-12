import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// &begin[CardioStats]
function CardioChart({ data, exerciseName }) {
  if (!exerciseName) {
    return <p className="chart-empty">Select an exercise to see cardio progress.</p>
  }
  if (data.length < 2) {
    return (
      <p className="chart-empty">
        Not enough data — log at least 2 sessions with <strong>{exerciseName}</strong> with both duration and distance.
      </p>
    )
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">{exerciseName} — Avg Pace (min/km)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3e" />
          <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 12 }} />
          {/* reversed so improving (lower) pace trends upward visually */}
          <YAxis tick={{ fill: '#888', fontSize: 12 }} unit=" min/km" width={72} reversed />
          <Tooltip
            contentStyle={{ background: '#1e1e2a', border: '1px solid #2e2e3e', borderRadius: 8 }}
            labelStyle={{ color: '#aaa', fontSize: 12 }}
            itemStyle={{ color: '#fb923c' }}
            formatter={v => [`${v} min/km`, 'Avg pace']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ fill: '#f97316', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
// &end[CardioStats]

export default CardioChart

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// &begin[StrengthStats]
function StrengthChart({ data, exerciseName }) {
  if (!exerciseName) {
    return <p className="chart-empty">Select an exercise to see strength progress.</p>
  }
  if (data.length < 2) {
    return (
      <p className="chart-empty">
        Not enough data — log at least 2 sessions with <strong>{exerciseName}</strong> and a recorded weight.
      </p>
    )
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">{exerciseName} — Max Weight (kg)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3e" />
          <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 12 }} />
          <YAxis tick={{ fill: '#888', fontSize: 12 }} unit=" kg" width={56} />
          <Tooltip
            contentStyle={{ background: '#1e1e2a', border: '1px solid #2e2e3e', borderRadius: 8 }}
            labelStyle={{ color: '#aaa', fontSize: 12 }}
            itemStyle={{ color: '#a09eff' }}
            formatter={v => [`${v} kg`, 'Max weight']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#6c63ff"
            strokeWidth={2}
            dot={{ fill: '#6c63ff', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
// &end[StrengthStats]

export default StrengthChart

// &begin[UrgencyIndicator]
const PRIORITY_SCORE = { high: 3, medium: 2, low: 1 }

const getDeadlineScore = (deadline) => {
  if (!deadline) return 0
  const [year, month, day] = deadline.split('-').map(Number)
  const deadlineDate = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((deadlineDate - today) / 86400000)
  if (diffDays < 0) return 3
  if (diffDays === 0) return 2
  if (diffDays <= 3) return 1
  return 0
}

export const getUrgency = (task) => {
  const score = PRIORITY_SCORE[task.priority || 'medium'] + getDeadlineScore(task.deadline)
  if (score >= 5) return 'critical'
  if (score >= 3) return 'high'
  return 'normal'
}
// &end[UrgencyIndicator]

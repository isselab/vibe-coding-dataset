function keyLabel(key) {
  if (!key) return null
  if (key === ' ') return 'Space'
  if (key.length === 1) return key.toUpperCase()
  return key
}

export default function KeyBind({ boundKey, isListening, onBind, onClear, icon, title: actionTitle }) {
  if (isListening) {
    return <span className="key-badge listening">{icon} …</span>
  }
  if (boundKey) {
    return (
      <span
        className="key-badge bound"
        onClick={onBind}
        title={`${actionTitle}: ${keyLabel(boundKey)} — click to rebind`}
      >
        <span className="key-icon">{icon}</span>
        {keyLabel(boundKey)}
        <button
          className="key-clear"
          onClick={e => { e.stopPropagation(); onClear() }}
          aria-label={`Clear ${actionTitle} shortcut`}
        >×</button>
      </span>
    )
  }
  return (
    <button className="key-badge empty" onClick={onBind} title={`Bind ${actionTitle} shortcut`}>
      {icon}
    </button>
  )
}

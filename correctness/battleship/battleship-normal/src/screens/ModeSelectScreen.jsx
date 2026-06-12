export default function ModeSelectScreen({ onSelect }) {
  return (
    <div className="fullscreen-center">
      <div className="mode-select-card">
        <h1>Choose Placement Style</h1>
        <p className="mode-sub">How would you like to place your ships?</p>
        <div className="mode-options">
          <button className="mode-btn" onClick={() => onSelect('click')}>
            <span className="mode-icon">🖱️</span>
            <span className="mode-title">Click to Place</span>
            <span className="mode-desc">Select a ship, hover to preview, click to place</span>
          </button>
          <button className="mode-btn" onClick={() => onSelect('drag')}>
            <span className="mode-icon">✋</span>
            <span className="mode-title">Drag &amp; Drop</span>
            <span className="mode-desc">Drag ships from the sidebar onto the grid</span>
          </button>
        </div>
      </div>
    </div>
  )
}

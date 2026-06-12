export default function GameOverScreen({ winner, pid }) {
  const won = winner === pid
  return (
    <div className="fullscreen-center">
      <div className={`gameover-card ${won ? 'won' : 'lost'}`}>
        <div className="gameover-icon">{won ? '🏆' : '💥'}</div>
        <h1>{won ? 'Victory!' : 'Defeated!'}</h1>
        <p>{won ? 'You sunk the entire enemy fleet.' : 'Your fleet has been destroyed.'}</p>
        <button className="ready-btn" onClick={() => window.location.reload()}>
          Play Again
        </button>
      </div>
    </div>
  )
}

import { useState, useCallback, useRef } from 'react'
import Grid from '../components/Grid'
import ShellAnimation from '../components/ShellAnimation'

export default function BattleScreen({
  pid,
  currentTurn,
  myShips,
  myReceivedShots,
  theirReceivedShots,
  sunkEnemyShips,
  mySunkShips,
  pendingShot,
  onAttack,
  onShotCommitted,
}) {
  const [hoverCells, setHoverCells] = useState([])
  // Shot markers committed to the enemy grid (subset of theirReceivedShots + the just-committed one)
  // We track locally whether the pending shot has been committed to the cell already
  const [committedTheirShots, setCommittedTheirShots] = useState([])
  // Sinking state: shipId → true once animation starts
  const [sinkingIds, setSinkingIds] = useState(new Set())

  const enemyGridRef = useRef(null)
  const isMyTurn = currentTurn === pid

  // Sync theirReceivedShots into committedTheirShots (they grow as results arrive)
  // committedTheirShots is only needed so we can add the shot marker mid-animation;
  // outside of an animation, just mirror theirReceivedShots
  const displayedTheirShots = pendingShot
    ? committedTheirShots
    : theirReceivedShots

  const handleCellClick = useCallback((row, col) => {
    if (!isMyTurn || pendingShot) return
    const alreadyShot = theirReceivedShots.some(s => s.row === row && s.col === col)
    if (alreadyShot) return
    onAttack(row, col)
  }, [isMyTurn, pendingShot, theirReceivedShots, onAttack])

  const handleHover = useCallback((row, col) => {
    if (!isMyTurn || pendingShot) { setHoverCells([]); return }
    const alreadyShot = theirReceivedShots.some(s => s.row === row && s.col === col)
    setHoverCells(alreadyShot ? [] : [{ row, col }])
  }, [isMyTurn, pendingShot, theirReceivedShots])

  // Called by ShellAnimation when shell reaches target — add the shot marker
  const handleShotCommit = useCallback(() => {
    if (!pendingShot) return
    setCommittedTheirShots(prev => [...prev, {
      row: pendingShot.row,
      col: pendingShot.col,
      hit: pendingShot.hit,
      fresh: true,
    }])
    if (pendingShot.sunkShip) {
      setSinkingIds(prev => new Set([...prev, pendingShot.sunkShip.id]))
    }
  }, [pendingShot])

  // Called by ShellAnimation when all animations are done
  const handleShotComplete = useCallback(() => {
    if (!pendingShot) return
    setCommittedTheirShots([]) // reset — BattleScreen will now use theirReceivedShots
    onShotCommitted(pendingShot)
  }, [pendingShot, onShotCommitted])

  // Merge sunkEnemyShips with the currently-animating sunk ship
  const sunkShipsList = pendingShot?.sunkShip
    ? [...sunkEnemyShips, pendingShot.sunkShip]
    : sunkEnemyShips

  return (
    <div className="battle-screen">
      <div className={`turn-banner ${isMyTurn && !pendingShot ? 'my-turn' : 'their-turn'}`}>
        {pendingShot
          ? (pendingShot.hit ? (pendingShot.sunkShip ? `You sunk their ${pendingShot.sunkShip.id}!` : 'Hit!') : 'Miss!')
          : isMyTurn ? 'Your turn — fire!' : "Opponent's turn…"
        }
      </div>

      <div className="battle-layout">
        <div className="battle-half">
          <h3 className="grid-title">Your waters</h3>
          <Grid
            placedShips={myShips}
            shots={myReceivedShots}
            sunkShipIds={new Set(mySunkShips.map(s => s.id))}
          />
        </div>

        <div className="battle-divider" />

        <div className="battle-half" ref={enemyGridRef}>
          <h3 className={`grid-title ${isMyTurn && !pendingShot ? 'active-grid' : ''}`}>
            Enemy waters {isMyTurn && !pendingShot && <span className="fire-hint">← fire!</span>}
          </h3>
          <Grid
            placedShips={[]}
            shots={displayedTheirShots}
            revealedShips={sunkShipsList}
            sinkingIds={sinkingIds}
            onCellClick={handleCellClick}
            onCellHover={handleHover}
            onMouseLeave={() => setHoverCells([])}
            hoverCells={hoverCells}
            hoverValid={true}
          />
        </div>
      </div>

      {pendingShot && (
        <ShellAnimation
          gridRef={enemyGridRef}
          row={pendingShot.row}
          col={pendingShot.col}
          hit={pendingShot.hit}
          sunkShip={pendingShot.sunkShip}
          onCommit={handleShotCommit}
          onComplete={handleShotComplete}
        />
      )}
    </div>
  )
}

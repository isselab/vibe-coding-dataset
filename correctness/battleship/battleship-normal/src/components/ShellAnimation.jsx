import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CELL_SIZE, ROW_LABEL_WIDTH, COL_LABEL_HEIGHT } from '../constants'

// Renders a shell projectile in a fixed overlay, then triggers an impact animation.
// gridRef: ref to the enemy grid wrapper div
export default function ShellAnimation({ gridRef, row, col, hit, sunkShip, onCommit, onComplete }) {
  const [phase, setPhase] = useState('flying') // flying | impact | done

  // Positions in viewport coords, computed once on mount
  const posRef = useRef(null)
  if (!posRef.current && gridRef.current) {
    const rect = gridRef.current.getBoundingClientRect()
    const tx = rect.left + ROW_LABEL_WIDTH + col * CELL_SIZE + CELL_SIZE / 2
    const ty = rect.top + COL_LABEL_HEIGHT + row * CELL_SIZE + CELL_SIZE / 2
    const sx = rect.left + rect.width / 2
    const sy = rect.top - 60
    posRef.current = { sx, sy, tx, ty, dx: tx - sx, dy: ty - sy }
  }

  const pos = posRef.current

  useEffect(() => {
    if (!pos) { onCommit(); onComplete(); return }

    // Shell arrives at ~350ms → commit the shot marker
    const t1 = setTimeout(() => {
      setPhase('impact')
      onCommit()
    }, 360)

    // Impact animation finishes
    const totalDuration = sunkShip ? 2000 : 900
    const t2 = setTimeout(() => {
      setPhase('done')
      onComplete()
    }, totalDuration)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!pos || phase === 'done') return null

  return createPortal(
    <div className="shell-layer" aria-hidden>
      {phase === 'flying' && (
        <div
          className="shell-projectile"
          style={{
            '--sx': `${pos.sx}px`,
            '--sy': `${pos.sy}px`,
            '--dx': `${pos.dx}px`,
            '--dy': `${pos.dy}px`,
            left: pos.sx,
            top: pos.sy,
          }}
        />
      )}
      {phase === 'impact' && (
        <div
          className={`shell-impact ${hit ? 'impact-hit' : 'impact-miss'} ${sunkShip ? 'impact-sunk' : ''}`}
          style={{ left: pos.tx, top: pos.ty }}
        />
      )}
    </div>,
    document.body
  )
}

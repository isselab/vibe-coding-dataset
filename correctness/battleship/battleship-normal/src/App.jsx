import { useState, useCallback } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import WaitingScreen from './screens/WaitingScreen'
import PlacementScreen from './screens/PlacementScreen'
import BattleScreen from './screens/BattleScreen'
import GameOverScreen from './screens/GameOverScreen'
import './App.css'

function buildWsUrl() {
  const roomId = new URLSearchParams(window.location.search).get('room')
  return roomId ? `ws://localhost:3001/?room=${roomId}` : 'ws://localhost:3001'
}

export default function App() {
  const [phase, setPhase] = useState('connecting')
  const [pid, setPid] = useState(null)
  const [roomId, setRoomId] = useState(null)
  const [waitingForOpponent, setWaitingForOpponent] = useState(false)
  const [myShips, setMyShips] = useState([])

  // Committed battle state (already animated / resolved)
  const [currentTurn, setCurrentTurn] = useState(0)
  const [myReceivedShots, setMyReceivedShots] = useState([])
  const [theirReceivedShots, setTheirReceivedShots] = useState([])
  const [sunkEnemyShips, setSunkEnemyShips] = useState([])
  const [mySunkShips, setMySunkShips] = useState([])
  const [winner, setWinner] = useState(null)

  // Pending shot waiting to be animated by BattleScreen
  const [pendingShot, setPendingShot] = useState(null)

  const handleMessage = useCallback((msg) => {
    switch (msg.type) {
      case 'welcome':
        setPid(msg.pid)
        setRoomId(msg.roomId)
        // Update URL so opponent can join
        if (!new URLSearchParams(window.location.search).get('room')) {
          window.history.replaceState({}, '', `?room=${msg.roomId}`)
        }
        setPhase('waiting')
        break
      case 'placement_start':
        setPhase('placement')
        break
      case 'waiting_for_opponent':
        setWaitingForOpponent(true)
        break
      case 'battle_start':
        setCurrentTurn(msg.yourTurn ? pid : 1 - pid)
        setPhase('battle')
        setWaitingForOpponent(false)
        break
      case 'attack_result': {
        const { row, col, hit, sunkShip, attackerPid, nextTurn } = msg
        setCurrentTurn(nextTurn)
        if (attackerPid === pid) {
          // My shot — animate first, commit after
          setPendingShot({ row, col, hit, sunkShip: sunkShip || null })
        } else {
          // Incoming shot on my grid — immediate
          setMyReceivedShots(prev => [...prev, { row, col, hit }])
          if (sunkShip) setMySunkShips(prev => [...prev, sunkShip])
        }
        break
      }
      case 'game_over': {
        const { winner: w, row, col, hit, sunkShip, attackerPid } = msg
        setWinner(w)
        if (w === pid) {
          // My winning shot — animate then go to gameover
          setPendingShot({ row, col, hit, sunkShip: sunkShip || null, final: true })
        } else {
          // I lost — their final shot on me
          setMyReceivedShots(prev => [...prev, { row, col, hit }])
          setPhase('gameover')
        }
        break
      }
      case 'opponent_disconnected':
        setPhase('waiting')
        setWaitingForOpponent(false)
        setMyShips([])
        setMyReceivedShots([])
        setTheirReceivedShots([])
        setSunkEnemyShips([])
        setMySunkShips([])
        setPendingShot(null)
        break
    }
  }, [pid])

  const { send } = useWebSocket(buildWsUrl(), handleMessage)

  const handlePlacementDone = useCallback((ships) => {
    setMyShips(ships)
    send({ type: 'placement_done', ships })
    setWaitingForOpponent(true)
  }, [send])

  const handleAttack = useCallback((row, col) => {
    send({ type: 'attack', row, col })
  }, [send])

  // Called by BattleScreen when the shot animation has fully committed
  const handleShotCommitted = useCallback((shot) => {
    setTheirReceivedShots(prev => [...prev, { row: shot.row, col: shot.col, hit: shot.hit }])
    if (shot.sunkShip) setSunkEnemyShips(prev => [...prev, shot.sunkShip])
    if (shot.final) setPhase('gameover')
    setPendingShot(null)
  }, [])

  if (phase === 'connecting') return <WaitingScreen message="Connecting…" />
  if (phase === 'waiting') return <WaitingScreen roomId={roomId} />
  if (phase === 'placement') {
    return (
      <PlacementScreen
        onDone={handlePlacementDone}
        waitingForOpponent={waitingForOpponent}
      />
    )
  }
  if (phase === 'battle') {
    return (
      <BattleScreen
        pid={pid}
        currentTurn={currentTurn}
        myShips={myShips}
        myReceivedShots={myReceivedShots}
        theirReceivedShots={theirReceivedShots}
        sunkEnemyShips={sunkEnemyShips}
        mySunkShips={mySunkShips}
        pendingShot={pendingShot}
        onAttack={handleAttack}
        onShotCommitted={handleShotCommitted}
      />
    )
  }
  if (phase === 'gameover') return <GameOverScreen winner={winner} pid={pid} />
  return null
}

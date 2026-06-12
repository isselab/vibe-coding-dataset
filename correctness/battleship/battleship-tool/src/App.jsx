import { useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import { useGame } from './hooks/useGame';
import GameBoard from './components/GameBoard';
import OpponentBoard from './components/OpponentBoard';
import ShipPanel from './components/ShipPanel';
import RoomLobby from './components/RoomLobby';
import './App.css';

// &begin[Battleship]
export default function App() {
  const { socket, connected } = useSocket();
  const game = useGame(socket);
  const { phase, placement } = game;

  // &begin[ShipRotation]
  useEffect(() => {
    const onKey = e => { if (e.key === 'r' || e.key === 'R') placement.toggleOrientation(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [placement.toggleOrientation]);
  // &end[ShipRotation]

  // &begin[RoomManagement]
  if (phase === 'lobby' || phase === 'room_lobby' || phase === 'room_waiting') {
    return (
      <RoomLobby
        connected={connected}
        phase={phase}
        myPlayerId={game.myPlayerId}
        roomCode={game.roomCode}
        availableRooms={game.availableRooms}
        onCreateRoom={game.createRoom}
        onJoinRoom={game.joinRoom}
      />
    );
  }
  // &end[RoomManagement]

  if (phase === 'placement' || phase === 'waiting_opponent') {
    const isPlacingMode = phase === 'placement';
    const statusText = phase === 'waiting_opponent'
      ? 'Fleet deployed — waiting for opponent…'
      : placement.allPlaced
      ? 'All ships placed — click Ready when set!'
      : placement.dragShipId
      ? 'Placing ship — drop on the board · R to rotate'
      : 'Drag a ship onto the board · R to rotate';

    return (
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">BATTLESHIP</h1>
          <p className="app-subtitle">{game.myPlayerId} · Room {game.roomCode} · Place your fleet</p>
        </header>
        <div className="game-area">
          <ShipPanel
            unplacedShips={placement.unplacedShips}
            dragShipId={placement.dragShipId}
            orientation={placement.orientation}
            onDragStart={placement.handleDragStart}
            onDragEnd={placement.handleDragEnd}
            onToggleOrientation={placement.toggleOrientation}
            onReset={placement.resetBoard}
            allPlaced={placement.allPlaced}
          />
          <div className="board-area">
            <GameBoard
              grid={placement.grid}
              preview={placement.preview}
              placedShips={placement.placedShips}
              isPlacingMode={isPlacingMode}
              onCellHover={(r, c) => placement.setHoverPos({ row: r, col: c })}
              onBoardLeave={() => placement.setHoverPos(null)}
              onDragOver={(r, c) => placement.setHoverPos({ row: r, col: c })}
              onDrop={placement.handleDrop}
              onShipLiftDrag={isPlacingMode ? placement.handleLiftDrag : undefined}
            />
            <div className={`status-bar${phase === 'waiting_opponent' ? ' ready' : ''}`}>
              {statusText}
            </div>
            {placement.allPlaced && phase === 'placement' && (
              <button className="ready-btn" onClick={game.submitPlacement}>
                Ready!
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // &begin[GamePlay]
  if (phase === 'playing' || phase === 'game_over') {
    return (
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">BATTLESHIP</h1>
          {/* &begin[TurnManagement] */}
          <p className={`app-subtitle turn-indicator${game.isMyTurn ? ' my-turn' : ''}`}>
            {phase === 'game_over'
              ? game.winner === 'me' ? '🏆 Victory!' : '💀 Defeat'
              : game.isMyTurn ? '⚡ Your turn — fire!' : '⏳ Opponent firing…'}
          </p>
          {/* &end[TurnManagement] */}
        </header>

        <div className="play-area">
          <div className="board-column">
            <h3 className="board-label">Your Waters</h3>
            <GameBoard
              grid={placement.grid}
              placedShips={placement.placedShips}
              incomingShots={game.opponentShots}
              justSunkDefenseId={game.justSunkDefenseId}
            />
          </div>

          <div className="board-column">
            <h3 className="board-label">Enemy Waters</h3>
            {/* &begin[FiringPhase] */}
            <OpponentBoard
              myShots={game.myShots}
              sunkShips={game.sunkByMe}
              isMyTurn={game.isMyTurn && phase === 'playing'}
              onFire={game.fire}
              justSunkOffenseId={game.justSunkOffenseId}
            />
            {/* &end[FiringPhase] */}
          </div>
        </div>

        {/* &begin[WinCondition] */}
        {phase === 'game_over' && (
          <div className="game-over-banner">
            <p>{game.winner === 'me' ? 'You sank the enemy fleet!' : 'Your fleet was destroyed!'}</p>
            <button className="ready-btn" onClick={game.requestRematch}>
              {game.opponentWantsRematch ? 'Opponent ready — Play Again!' : 'Play Again'}
            </button>
          </div>
        )}
        {/* &end[WinCondition] */}
      </div>
    );
  }
  // &end[GamePlay]

  return null;
}
// &end[Battleship]

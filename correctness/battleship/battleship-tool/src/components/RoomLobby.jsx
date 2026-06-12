// &begin[RoomManagement]
export default function RoomLobby({ connected, phase, myPlayerId, roomCode, availableRooms, onCreateRoom, onJoinRoom }) {
  if (!connected || phase === 'lobby') {
    return (
      <div className="screen lobby-screen">
        <h1 className="app-title">BATTLESHIP</h1>
        <div className="lobby-card">
          <div className="spinner" />
          <p className="lobby-status">Connecting to server…</p>
        </div>
      </div>
    );
  }

  if (phase === 'room_waiting') {
    return (
      <div className="screen lobby-screen">
        <h1 className="app-title">BATTLESHIP</h1>
        <div className="lobby-card">
          <p className="lobby-player-id">You are <strong>{myPlayerId}</strong></p>
          <div className="room-code-display">{roomCode}</div>
          <div className="spinner" />
          <p className="lobby-status">Waiting for opponent…</p>
          <p className="lobby-hint">Share this code or have them join from the room list.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen lobby-screen">
      <h1 className="app-title">BATTLESHIP</h1>
      <div className="room-lobby-card">
        <button className="create-room-btn" onClick={onCreateRoom}>
          + Create Room
        </button>
        <div className="room-divider"><span>or join an open room</span></div>
        <div className="room-list">
          {availableRooms.length === 0 ? (
            <p className="room-list-empty">No open rooms — create one above.</p>
          ) : (
            availableRooms.map(r => (
              <div key={r.code} className="room-item">
                <span className="room-item-code">{r.code}</span>
                <span className="room-item-count">{r.playerCount}/2</span>
                <button className="join-room-btn" onClick={() => onJoinRoom(r.code)}>Join</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
// &end[RoomManagement]

// &begin[NetworkGame]
import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: ['http://localhost:5173', 'http://localhost:4173'] },
});

const GRID_SIZE = 10;

function emptyGrid() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

function freshPlayer(socketId, id) {
  return { id, socketId, board: emptyGrid(), shots: emptyGrid(), ready: false, rematchVote: false };
}

const rooms = new Map();      // roomCode → room state
const socketRoom = new Map(); // socketId → roomCode

// &begin[RoomManagement]
function generateCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

function availableRooms() {
  const list = [];
  for (const [code, room] of rooms) {
    const n = Object.keys(room.players).length;
    if (n < 2 && room.phase === 'waiting') list.push({ code, playerCount: n });
  }
  return list;
}

function broadcastRoomsList() {
  io.emit('rooms_list', availableRooms());
}
// &end[RoomManagement]

io.on('connection', socket => {
  // &begin[RoomManagement]
  socket.emit('rooms_list', availableRooms());

  socket.on('create_room', () => {
    let code;
    do { code = generateCode(); } while (rooms.has(code));
    const room = { phase: 'waiting', players: {}, currentTurn: null };
    rooms.set(code, room);
    room.players[socket.id] = freshPlayer(socket.id, 'P1');
    socketRoom.set(socket.id, code);
    socket.join(code);
    socket.emit('room_created', { roomCode: code, playerId: 'P1' });
    broadcastRoomsList();
  });

  socket.on('join_room', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || Object.keys(room.players).length >= 2) {
      socket.emit('join_error', { message: 'Room not available' });
      return;
    }
    room.players[socket.id] = freshPlayer(socket.id, 'P2');
    socketRoom.set(socket.id, roomCode);
    socket.join(roomCode);
    socket.emit('room_joined', { roomCode, playerId: 'P2' });
    socket.to(roomCode).emit('opponent_joined');
    room.phase = 'placement';
    io.to(roomCode).emit('phase_change', { phase: 'placement' });
    broadcastRoomsList();
  });
  // &end[RoomManagement]

  // &begin[FiringPhase]
  socket.on('ships_placed', ({ grid }) => {
    const roomCode = socketRoom.get(socket.id);
    const room = roomCode ? rooms.get(roomCode) : null;
    const p = room?.players[socket.id];
    if (!p || p.ready) return;
    p.board = grid;
    p.ready = true;
    socket.to(roomCode).emit('opponent_ready');
    const allReady = Object.values(room.players).every(x => x.ready);
    if (allReady) {
      const ids = Object.keys(room.players);
      room.currentTurn = ids[Math.floor(Math.random() * 2)];
      room.phase = 'playing';
      io.to(roomCode).emit('game_start', { firstTurnId: room.players[room.currentTurn].id });
    }
  });

  socket.on('fire', ({ row, col }) => {
    const roomCode = socketRoom.get(socket.id);
    const room = roomCode ? rooms.get(roomCode) : null;
    if (!room || room.phase !== 'playing' || room.currentTurn !== socket.id) return;
    const ids = Object.keys(room.players);
    const oppId = ids.find(id => id !== socket.id);
    const shooter = room.players[socket.id];
    const opp = room.players[oppId];
    if (!opp || shooter.shots[row][col]) return;

    const hitShipId = opp.board[row][col];
    const hit = !!hitShipId;
    shooter.shots[row][col] = hit ? 'hit' : 'miss';

    let sunkShipData = null;
    if (hit) {
      const cells = [];
      for (let r = 0; r < GRID_SIZE; r++)
        for (let c = 0; c < GRID_SIZE; c++)
          if (opp.board[r][c] === hitShipId) cells.push([r, c]);
      if (cells.every(([r, c]) => shooter.shots[r][c] === 'hit'))
        sunkShipData = { id: hitShipId, cells };
    }

    // &begin[WinCondition]
    let winnerId = null;
    const allOppCells = [];
    for (let r = 0; r < GRID_SIZE; r++)
      for (let c = 0; c < GRID_SIZE; c++)
        if (opp.board[r][c]) allOppCells.push([r, c]);
    if (allOppCells.every(([r, c]) => shooter.shots[r][c] === 'hit')) {
      winnerId = shooter.id;
      room.phase = 'finished';
    }
    // &end[WinCondition]

    if (!winnerId) room.currentTurn = oppId;

    io.to(roomCode).emit('fire_result', {
      shooterSocketId: socket.id, row, col, hit, sunkShipData, winnerId,
      nextTurnId: winnerId ? null : room.players[oppId].id,
    });
  });
  // &end[FiringPhase]

  socket.on('request_rematch', () => {
    const roomCode = socketRoom.get(socket.id);
    const room = roomCode ? rooms.get(roomCode) : null;
    const p = room?.players[socket.id];
    if (!p) return;
    p.rematchVote = true;
    socket.to(roomCode).emit('opponent_wants_rematch');
    if (Object.values(room.players).every(x => x.rematchVote)) {
      for (const pl of Object.values(room.players))
        Object.assign(pl, { board: emptyGrid(), shots: emptyGrid(), ready: false, rematchVote: false });
      room.phase = 'placement';
      room.currentTurn = null;
      io.to(roomCode).emit('phase_change', { phase: 'placement' });
    }
  });

  socket.on('disconnect', () => {
    const roomCode = socketRoom.get(socket.id);
    socketRoom.delete(socket.id);
    if (!roomCode) return;
    const room = rooms.get(roomCode);
    if (!room || !room.players[socket.id]) return;
    delete room.players[socket.id];
    const remaining = Object.entries(room.players);
    if (remaining.length === 0) {
      rooms.delete(roomCode);
    } else {
      const [remId, remPlayer] = remaining[0];
      const keptId = remPlayer.id;
      room.players[remId] = freshPlayer(remId, keptId);
      room.phase = 'waiting';
      room.currentTurn = null;
      io.to(remId).emit('session_reset', { playerId: keptId, roomCode });
    }
    broadcastRoomsList();
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => console.log(`Battleship server on :${PORT}`));
// &end[NetworkGame]

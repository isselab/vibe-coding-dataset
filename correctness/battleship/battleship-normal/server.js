import { WebSocketServer } from 'ws'
import { createServer } from 'http'

const GRID_SIZE = 10
const SHIP_LENGTHS = { carrier: 5, battleship: 4, cruiser: 3, submarine: 3, destroyer: 2 }
const SHIP_IDS = Object.keys(SHIP_LENGTHS)

const server = createServer()
const wss = new WebSocketServer({ server })
const rooms = new Map()

function generateRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id
  do {
    id = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  } while (rooms.has(id))
  return id
}

function makeRoom(id) {
  return {
    id,
    sockets: [],
    fleets: [null, null],
    shots: [new Set(), new Set()],
    phase: 'waiting',
    turn: 0,
  }
}

function send(ws, obj) {
  if (ws.readyState === 1) ws.send(JSON.stringify(obj))
}

function broadcast(room, obj) {
  for (const ws of room.sockets) send(ws, obj)
}

function validateFleet(ships) {
  if (!Array.isArray(ships) || ships.length !== SHIP_IDS.length) return false
  const seenIds = new Set()
  const occupied = new Set()
  for (const ship of ships) {
    if (!SHIP_IDS.includes(ship.id) || seenIds.has(ship.id)) return false
    seenIds.add(ship.id)
    if (!Array.isArray(ship.cells) || ship.cells.length !== SHIP_LENGTHS[ship.id]) return false
    for (const { row, col } of ship.cells) {
      if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return false
      const key = `${row},${col}`
      if (occupied.has(key)) return false
      occupied.add(key)
    }
  }
  return true
}

function getSunkShip(fleet, shotSet, row, col) {
  const ship = fleet.find(s => s.cells.some(c => c.row === row && c.col === col))
  if (!ship) return null
  return ship.cells.every(c => shotSet.has(`${c.row},${c.col}`)) ? ship : null
}

function checkWin(fleet, shotSet) {
  return fleet.every(s => s.cells.every(c => shotSet.has(`${c.row},${c.col}`)))
}

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost')
  const requestedId = url.searchParams.get('room')?.toUpperCase()

  let room, pid

  if (requestedId) {
    room = rooms.get(requestedId)
    if (!room) { send(ws, { type: 'error', message: 'Room not found' }); ws.close(); return }
    if (room.sockets.length >= 2) { send(ws, { type: 'room_full' }); ws.close(); return }
    pid = room.sockets.length
  } else {
    const roomId = generateRoomId()
    room = makeRoom(roomId)
    rooms.set(roomId, room)
    pid = 0
  }

  room.sockets.push(ws)
  send(ws, { type: 'welcome', pid, roomId: room.id })

  if (room.sockets.length === 2) {
    room.phase = 'placement'
    broadcast(room, { type: 'placement_start' })
  }

  ws.on('message', (raw) => {
    let msg
    try { msg = JSON.parse(raw) } catch { return }

    if (msg.type === 'placement_done' && room.phase === 'placement') {
      if (!validateFleet(msg.ships)) { send(ws, { type: 'error', message: 'Invalid fleet' }); return }
      room.fleets[pid] = msg.ships
      if (room.fleets[1 - pid]) {
        room.phase = 'battle'
        room.turn = Math.random() < 0.5 ? 0 : 1
        for (let i = 0; i < 2; i++) {
          send(room.sockets[i], { type: 'battle_start', yourTurn: room.turn === i })
        }
      } else {
        send(ws, { type: 'waiting_for_opponent' })
      }
    }

    if (msg.type === 'attack' && room.phase === 'battle') {
      if (room.turn !== pid) { send(ws, { type: 'error', message: 'Not your turn' }); return }
      const { row, col } = msg
      if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return
      const cellKey = `${row},${col}`
      if (room.shots[pid].has(cellKey)) return
      room.shots[pid].add(cellKey)

      const opponentFleet = room.fleets[1 - pid]
      const hit = opponentFleet.some(s => s.cells.some(c => c.row === row && c.col === col))
      const sunkShip = getSunkShip(opponentFleet, room.shots[pid], row, col)

      if (checkWin(opponentFleet, room.shots[pid])) {
        room.phase = 'gameover'
        broadcast(room, { type: 'game_over', winner: pid, row, col, hit: true, sunkShip })
        return
      }

      if (!hit) room.turn = 1 - room.turn

      broadcast(room, { type: 'attack_result', row, col, hit, sunkShip: sunkShip || null, attackerPid: pid, nextTurn: room.turn })
    }
  })

  ws.on('close', () => {
    room.sockets = room.sockets.filter(s => s !== ws)
    if (room.sockets.length > 0) broadcast(room, { type: 'opponent_disconnected' })
    if (room.sockets.length === 0) {
      setTimeout(() => { if (!rooms.get(room.id)?.sockets.length) rooms.delete(room.id) }, 30000)
    }
  })
})

server.listen(3001, () => console.log('Battleship server on ws://localhost:3001'))

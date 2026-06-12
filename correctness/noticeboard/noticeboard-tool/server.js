import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import 'dotenv/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = path.join(__dirname, 'uploads')
const STATE_FILE = path.join(__dirname, 'board.json')
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const PORT = process.env.PORT || 3001

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

// &begin[Persistence]
function loadState() {
  try {
    const raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'))
    // Migrate old single-board format { cards: [...] }
    if (Array.isArray(raw.cards) && !raw.boards) {
      return { boards: [{ id: uuidv4(), name: 'Main Board', theme: 'cork', cards: raw.cards }] }
    }
    return raw
  } catch {
    return { boards: [{ id: uuidv4(), name: 'Main Board', theme: 'cork', cards: [] }] }
  }
}
function saveState() {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))
}
let state = loadState()
// &end[Persistence]

// &begin[MultiBoard]
function getBoard(id) { return state.boards.find(b => b.id === id) }
function getBoardList() { return state.boards.map(({ id, name, theme }) => ({ id, name, theme })) }
// &end[MultiBoard]

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

const app = express()
const server = createServer(app)

// &begin[Realtime]
const io = new Server(server, { cors: { origin: '*' } })
// &end[Realtime]

app.use(express.json())
app.use('/uploads', express.static(UPLOADS_DIR)) // &line[Card]

// &begin[Card]
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' })
  res.json({ url: `/uploads/${req.file.filename}` })
})
// &end[Card]

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')))
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')))
}

const adminSessions = new Set() // &line[AdminAuth]

// &begin[Realtime]
io.on('connection', (socket) => {
  socket.emit('boards:list', getBoardList()) // &line[MultiBoard]
// &end[Realtime]

  // &begin[AdminAuth]
  socket.on('admin:auth', ({ password }, cb) => {
    if (password === ADMIN_PASSWORD) {
      adminSessions.add(socket.id)
      cb({ ok: true })
    } else {
      cb({ ok: false, error: 'Wrong password' })
    }
  })
  // &end[AdminAuth]

  // &begin[MultiBoard]
  socket.on('board:join', (boardId, cb) => {
    for (const room of socket.rooms) {
      if (room !== socket.id) socket.leave(room)
    }
    const board = getBoard(boardId)
    if (!board) { cb?.({ error: 'Not found' }); return }
    socket.join(`board:${boardId}`)
    cb?.({ ok: true })
    socket.emit('board:init', board)
  })

  socket.on('board:create', ({ name, theme }, cb) => {
    if (!adminSessions.has(socket.id)) { cb?.({ error: 'Unauthorized' }); return }
    const board = { id: uuidv4(), name: name || 'New Board', theme: theme || 'cork', cards: [] }
    state.boards.push(board)
    saveState()
    io.emit('boards:updated', getBoardList())
    cb?.({ ok: true, id: board.id })
  })

  socket.on('board:update', ({ id, name, theme }, cb) => {
    if (!adminSessions.has(socket.id)) { cb?.({ error: 'Unauthorized' }); return }
    const board = getBoard(id)
    if (!board) { cb?.({ error: 'Not found' }); return }
    if (name !== undefined) board.name = name
    if (theme !== undefined) board.theme = theme
    saveState()
    io.emit('boards:updated', getBoardList())
    cb?.({ ok: true })
  })

  socket.on('board:delete', ({ id }, cb) => {
    if (!adminSessions.has(socket.id)) { cb?.({ error: 'Unauthorized' }); return }
    if (state.boards.length <= 1) { cb?.({ error: 'Cannot delete last board' }); return }
    state.boards = state.boards.filter(b => b.id !== id)
    saveState()
    io.emit('boards:updated', getBoardList())
    io.to(`board:${id}`).emit('board:deleted', { boardId: id, fallbackId: state.boards[0]?.id })
    cb?.({ ok: true })
  })
  // &end[MultiBoard]

  // &begin[CardManagement]
  socket.on('card:add', ({ boardId, ...cardData }) => {
    if (!adminSessions.has(socket.id)) return
    const board = getBoard(boardId)
    if (!board) return
    const card = { ...cardData, id: uuidv4(), reactions: {} }
    board.cards.push(card)
    saveState()
    io.to(`board:${boardId}`).emit('card:added', card)
  })
  socket.on('card:update', ({ boardId, id, updates }) => {
    if (!adminSessions.has(socket.id)) return
    const board = getBoard(boardId)
    if (!board) return
    const card = board.cards.find(c => c.id === id)
    if (!card) return
    Object.assign(card, updates)
    saveState()
    io.to(`board:${boardId}`).emit('card:updated', { id, updates })
  })
  socket.on('card:delete', ({ boardId, id }) => {
    if (!adminSessions.has(socket.id)) return
    const board = getBoard(boardId)
    if (!board) return
    board.cards = board.cards.filter(c => c.id !== id)
    saveState()
    io.to(`board:${boardId}`).emit('card:deleted', id)
  })
  // &end[CardManagement]

  // &begin[Reactions]
  socket.on('reaction:toggle', ({ boardId, cardId, emoji, sessionId }) => {
    const board = getBoard(boardId)
    if (!board) return
    const card = board.cards.find(c => c.id === cardId)
    if (!card) return
    if (!card.reactions[emoji]) card.reactions[emoji] = { count: 0, sessions: [] }
    const r = card.reactions[emoji]
    const idx = r.sessions.indexOf(sessionId)
    if (idx === -1) { r.sessions.push(sessionId); r.count++ }
    else { r.sessions.splice(idx, 1); r.count--; if (r.count === 0) delete card.reactions[emoji] }
    saveState()
    io.to(`board:${boardId}`).emit('card:updated', { id: cardId, updates: { reactions: card.reactions } })
  })
  // &end[Reactions]

  // &begin[Realtime]
  socket.on('disconnect', () => adminSessions.delete(socket.id)) // &line[AdminAuth]
})

server.listen(PORT, () => console.log(`Noticeboard server on :${PORT}`))
// &end[Realtime]

import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import multer from 'multer'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3001
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin'
const JWT_SECRET = process.env.JWT_SECRET || randomUUID()

// ── Storage ───────────────────────────────────────────────
const DB_FILE = path.join(__dirname, 'data.json')
const UPLOADS_DIR = path.join(__dirname, 'uploads')
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

function readDB() {
  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))
    if (!data.boards) data.boards = []
    if (!data.cards) data.cards = []
    return data
  } catch {
    return { boards: [], cards: [] }
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

function getBoards(db) {
  return (db || readDB()).boards.sort((a, b) => a.createdAt - b.createdAt)
}

function getCardsForBoard(boardId, db) {
  return (db || readDB()).cards
    .filter(c => c.boardId === boardId)
    .sort((a, b) => a.createdAt - b.createdAt)
}

// ── Server ────────────────────────────────────────────────
const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server, path: '/ws' })

function send(ws, data) {
  if (ws.readyState === 1) ws.send(JSON.stringify(data))
}

function broadcastBoards(db) {
  const boards = getBoards(db)
  for (const client of wss.clients) send(client, { type: 'boards', boards })
}

function broadcastCards(boardId, db) {
  const cards = getCardsForBoard(boardId, db)
  for (const client of wss.clients) send(client, { type: 'cards', boardId, cards })
}

wss.on('connection', ws => {
  const db = readDB()
  send(ws, {
    type: 'init',
    boards: getBoards(db),
    cards: db.cards.sort((a, b) => a.createdAt - b.createdAt),
  })
})

// ── Middleware ────────────────────────────────────────────
app.use(express.json())
app.use('/uploads', express.static(UPLOADS_DIR))

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  try { jwt.verify(token, JWT_SECRET); next() }
  catch { res.status(401).json({ error: 'Unauthorized' }) }
}

// ── Auth ──────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  if (req.body.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Wrong password' })
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
})

// ── Boards ────────────────────────────────────────────────
app.get('/api/boards', (_, res) => res.json(getBoards()))

app.post('/api/boards', requireAdmin, (req, res) => {
  const db = readDB()
  const board = {
    id: randomUUID(),
    name: req.body.name || 'New Board',
    theme: req.body.theme || 'cork',
    createdAt: Date.now(),
  }
  db.boards.push(board)
  writeDB(db)
  broadcastBoards(db)
  res.json(board)
})

app.patch('/api/boards/:id', requireAdmin, (req, res) => {
  const db = readDB()
  const board = db.boards.find(b => b.id === req.params.id)
  if (!board) return res.status(404).json({ error: 'Not found' })
  if (req.body.name !== undefined) board.name = req.body.name
  if (req.body.theme !== undefined) board.theme = req.body.theme
  writeDB(db)
  broadcastBoards(db)
  res.json(board)
})

app.delete('/api/boards/:id', requireAdmin, (req, res) => {
  const db = readDB()
  const boardId = req.params.id
  db.cards.filter(c => c.boardId === boardId).forEach(c => {
    if (c.imageUrl) fs.unlink(path.join(__dirname, c.imageUrl.replace(/^\//, '')), () => {})
  })
  db.cards = db.cards.filter(c => c.boardId !== boardId)
  db.boards = db.boards.filter(b => b.id !== boardId)
  writeDB(db)
  broadcastBoards(db)
  res.json({ ok: true })
})

// ── Cards ─────────────────────────────────────────────────
app.post('/api/cards', requireAdmin, (req, res) => {
  const db = readDB()
  if (!db.boards.find(b => b.id === req.body.boardId)) {
    return res.status(400).json({ error: 'Invalid boardId' })
  }
  const card = {
    id: randomUUID(),
    boardId: req.body.boardId,
    x: req.body.x ?? 100,
    y: req.body.y ?? 100,
    rotation: req.body.rotation ?? 0,
    text: '',
    imageUrl: null,
    color: '#fefce8',
    reactions: {},
    createdAt: Date.now(),
  }
  db.cards.push(card)
  writeDB(db)
  broadcastCards(card.boardId, db)
  res.json(card)
})

app.patch('/api/cards/:id', (req, res) => {
  const db = readDB()
  const card = db.cards.find(c => c.id === req.params.id)
  if (!card) return res.status(404).json({ error: 'Not found' })

  const token = req.headers.authorization?.split(' ')[1]
  let isAdmin = false
  try { jwt.verify(token, JWT_SECRET); isAdmin = true } catch {}

  const { reactionDelta, ...adminPatch } = req.body
  if (!isAdmin && Object.keys(adminPatch).length > 0) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (reactionDelta) {
    const { emoji, delta } = reactionDelta
    card.reactions[emoji] = Math.max(0, (card.reactions[emoji] || 0) + delta)
  }

  if (isAdmin) {
    for (const key of ['x', 'y', 'rotation', 'text', 'color']) {
      if (adminPatch[key] !== undefined) card[key] = adminPatch[key]
    }
  }

  writeDB(db)
  broadcastCards(card.boardId, db)
  res.json({ ok: true })
})

app.delete('/api/cards/:id', requireAdmin, (req, res) => {
  const db = readDB()
  const card = db.cards.find(c => c.id === req.params.id)
  if (!card) return res.status(404).json({ error: 'Not found' })
  if (card.imageUrl) fs.unlink(path.join(__dirname, card.imageUrl.replace(/^\//, '')), () => {})
  const boardId = card.boardId
  db.cards = db.cards.filter(c => c.id !== req.params.id)
  writeDB(db)
  broadcastCards(boardId, db)
  res.json({ ok: true })
})

// ── Image upload ──────────────────────────────────────────
const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => cb(null, file.mimetype.startsWith('image/')),
})

app.post('/api/cards/:id/image', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' })
  const db = readDB()
  const card = db.cards.find(c => c.id === req.params.id)
  if (!card) return res.status(404).json({ error: 'Not found' })

  if (card.imageUrl) fs.unlink(path.join(__dirname, card.imageUrl.replace(/^\//, '')), () => {})

  const ext = path.extname(req.file.originalname) || '.jpg'
  const filename = req.file.filename + ext
  fs.renameSync(req.file.path, path.join(UPLOADS_DIR, filename))

  card.imageUrl = `/uploads/${filename}`
  writeDB(db)
  broadcastCards(card.boardId, db)
  res.json({ imageUrl: card.imageUrl })
})

// ── Serve built frontend in production ────────────────────
if (process.env.NODE_ENV === 'production') {
  const distDir = path.join(__dirname, 'dist')
  app.use(express.static(distDir))
  app.get('*', (_, res) => res.sendFile(path.join(distDir, 'index.html')))
}

server.listen(PORT, () => {
  console.log(`Noticeboard running on http://localhost:${PORT}`)
  if (ADMIN_PASSWORD === 'admin') {
    console.warn('  ⚠  Using default admin password. Set ADMIN_PASSWORD in .env')
  }
})

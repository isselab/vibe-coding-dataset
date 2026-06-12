const BASE = ''

export function getToken() {
  return sessionStorage.getItem('nb-token')
}

function setToken(token) {
  sessionStorage.setItem('nb-token', token)
}

export function clearToken() {
  sessionStorage.removeItem('nb-token')
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function login(password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  if (!res.ok) throw new Error('Wrong password')
  const { token } = await res.json()
  setToken(token)
}

// ── Boards ────────────────────────────────────────────────
export async function apiCreateBoard(data) {
  const res = await fetch(`${BASE}/api/boards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function apiUpdateBoard(id, patch) {
  await fetch(`${BASE}/api/boards/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(patch),
  })
}

export async function apiDeleteBoard(id) {
  await fetch(`${BASE}/api/boards/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}

// ── Cards ─────────────────────────────────────────────────
export async function apiAddCard(data) {
  const res = await fetch(`${BASE}/api/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function apiUpdateCard(id, patch) {
  await fetch(`${BASE}/api/cards/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(patch),
  })
}

export async function apiUploadImage(cardId, file) {
  const form = new FormData()
  form.append('image', file)
  const res = await fetch(`${BASE}/api/cards/${cardId}/image`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  })
  const { imageUrl } = await res.json()
  return imageUrl
}

export async function apiDeleteCard(id) {
  await fetch(`${BASE}/api/cards/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}

// ── WebSocket ─────────────────────────────────────────────
export function connectWebSocket(onMessage) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const ws = new WebSocket(`${protocol}//${window.location.host}/ws`)

  ws.onmessage = e => onMessage(JSON.parse(e.data))
  ws.onclose = () => setTimeout(() => connectWebSocket(onMessage), 2000)

  return ws
}

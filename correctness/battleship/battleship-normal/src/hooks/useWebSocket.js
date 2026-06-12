import { useEffect, useRef, useCallback, useState } from 'react'

export function useWebSocket(url, onMessage) {
  const wsRef = useRef(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const ws = new WebSocket(url)
    wsRef.current = ws
    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onmessage = (e) => {
      try { onMessageRef.current(JSON.parse(e.data)) } catch {}
    }
    return () => ws.close()
  }, [url])

  const send = useCallback((obj) => {
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify(obj))
    }
  }, [])

  return { send, connected }
}

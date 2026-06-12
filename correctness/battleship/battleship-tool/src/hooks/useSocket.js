import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// &begin[NetworkGame]
export function useSocket() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = io({ autoConnect: true });
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    setSocket(s);
    return () => s.disconnect();
  }, []);

  return { socket, connected };
}
// &end[NetworkGame]

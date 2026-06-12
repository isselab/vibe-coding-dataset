import { useState, useEffect, useCallback } from 'react';
import { useBattleship } from './useBattleship';

const GRID_SIZE = 10;
function emptyGrid() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

// &begin[NetworkGame]
export function useGame(socket) {
  const [phase, setPhase] = useState('lobby');
  const [myPlayerId, setMyPlayerId] = useState(null);
  const [opponentReady, setOpponentReady] = useState(false);

  // &begin[RoomManagement]
  const [roomCode, setRoomCode] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  // &end[RoomManagement]

  // &begin[FiringPhase]
  const [myShots, setMyShots] = useState(emptyGrid);
  const [opponentShots, setOpponentShots] = useState(emptyGrid);
  const [sunkByMe, setSunkByMe] = useState([]);
  // &end[FiringPhase]

  // &begin[TurnManagement]
  const [isMyTurn, setIsMyTurn] = useState(false);
  // &end[TurnManagement]

  // &begin[WinCondition]
  const [winner, setWinner] = useState(null);
  const [opponentWantsRematch, setOpponentWantsRematch] = useState(false);
  // &end[WinCondition]

  // &begin[Animations]
  const [justSunkOffenseId, setJustSunkOffenseId] = useState(null);
  const [justSunkDefenseId, setJustSunkDefenseId] = useState(null);
  // &end[Animations]

  const placement = useBattleship();

  useEffect(() => {
    if (!socket) return;

    if (socket.connected) setPhase(prev => prev === 'lobby' ? 'room_lobby' : prev);
    socket.on('connect', () => setPhase(prev => prev === 'lobby' ? 'room_lobby' : prev));

    // &begin[RoomManagement]
    socket.on('rooms_list', rooms => setAvailableRooms(rooms));

    socket.on('room_created', ({ roomCode: code, playerId }) => {
      setRoomCode(code);
      setMyPlayerId(playerId);
      setPhase('room_waiting');
    });

    socket.on('room_joined', ({ roomCode: code, playerId }) => {
      setRoomCode(code);
      setMyPlayerId(playerId);
    });

    socket.on('join_error', () => {});
    socket.on('opponent_joined', () => {});
    // &end[RoomManagement]

    socket.on('phase_change', ({ phase: p }) => {
      if (p === 'placement') {
        placement.resetBoard();
        setMyShots(emptyGrid());
        setOpponentShots(emptyGrid());
        setSunkByMe([]);
        setOpponentReady(false);
        setWinner(null);
        setOpponentWantsRematch(false);
        // &begin[Animations]
        setJustSunkOffenseId(null);
        setJustSunkDefenseId(null);
        // &end[Animations]
        setPhase('placement');
      }
    });

    socket.on('opponent_ready', () => setOpponentReady(true));

    // &begin[TurnManagement]
    socket.on('game_start', ({ firstTurnId }) => {
      setIsMyTurn(firstTurnId === myPlayerId);
      setPhase('playing');
    });
    // &end[TurnManagement]

    // &begin[FiringPhase]
    socket.on('fire_result', ({ shooterSocketId, row, col, hit, sunkShipData, winnerId, nextTurnId }) => {
      const iMadeShot = shooterSocketId === socket.id;
      if (iMadeShot) {
        setMyShots(prev => {
          const next = prev.map(r => [...r]);
          next[row][col] = hit ? 'hit' : 'miss';
          return next;
        });
        if (sunkShipData) {
          setSunkByMe(prev => [...prev, sunkShipData]);
          // &begin[Animations]
          setJustSunkOffenseId(sunkShipData.id);
          setTimeout(() => setJustSunkOffenseId(null), 1500);
          // &end[Animations]
        }
      } else {
        setOpponentShots(prev => {
          const next = prev.map(r => [...r]);
          next[row][col] = hit ? 'hit' : 'miss';
          return next;
        });
        // &begin[Animations]
        if (sunkShipData) {
          setJustSunkDefenseId(sunkShipData.id);
          setTimeout(() => setJustSunkDefenseId(null), 1500);
        }
        // &end[Animations]
      }
      // &begin[WinCondition]
      if (winnerId) {
        setWinner(iMadeShot ? 'me' : 'opponent');
        setPhase('game_over');
      } else {
        setIsMyTurn(nextTurnId === myPlayerId);
      }
      // &end[WinCondition]
    });
    // &end[FiringPhase]

    socket.on('opponent_wants_rematch', () => setOpponentWantsRematch(true));

    socket.on('session_reset', ({ playerId, roomCode: code }) => {
      placement.resetBoard();
      setMyShots(emptyGrid());
      setOpponentShots(emptyGrid());
      setSunkByMe([]);
      setOpponentReady(false);
      setWinner(null);
      setOpponentWantsRematch(false);
      setMyPlayerId(playerId);
      setRoomCode(code);
      setPhase('room_waiting');
    });

    return () => {
      socket.off('connect');
      socket.off('rooms_list');
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('join_error');
      socket.off('opponent_joined');
      socket.off('phase_change');
      socket.off('opponent_ready');
      socket.off('game_start');
      socket.off('fire_result');
      socket.off('opponent_wants_rematch');
      socket.off('session_reset');
    };
  }, [socket, myPlayerId]);

  // &begin[RoomManagement]
  const createRoom = useCallback(() => {
    if (!socket) return;
    socket.emit('create_room');
  }, [socket]);

  const joinRoom = useCallback(code => {
    if (!socket) return;
    socket.emit('join_room', { roomCode: code });
  }, [socket]);
  // &end[RoomManagement]

  const submitPlacement = useCallback(() => {
    if (!placement.allPlaced || !socket) return;
    socket.emit('ships_placed', { grid: placement.grid });
    setPhase('waiting_opponent');
  }, [socket, placement.allPlaced, placement.grid]);

  // &begin[FiringPhase]
  const fire = useCallback((row, col) => {
    if (!isMyTurn || phase !== 'playing' || myShots[row][col]) return;
    socket.emit('fire', { row, col });
  }, [socket, isMyTurn, phase, myShots]);
  // &end[FiringPhase]

  const requestRematch = useCallback(() => {
    if (!socket) return;
    socket.emit('request_rematch');
  }, [socket]);

  return {
    phase, myPlayerId, roomCode,
    availableRooms, createRoom, joinRoom,
    placement,
    opponentReady,
    myShots, opponentShots, sunkByMe,
    isMyTurn,
    winner, opponentWantsRematch,
    justSunkOffenseId, justSunkDefenseId,
    submitPlacement, fire, requestRematch,
  };
}
// &end[NetworkGame]

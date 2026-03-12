import type { Socket, Server } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import { createRoomCode, dealCards, maskStateForOperatives } from '../gameEngine'
import { getRoom, setRoom, updateGameState } from '../roomManager'
import type { GameState, Player, Role, Team, WordMode } from '../types'

export function registerLobbyHandlers(io: Server, socket: Socket): void {
  socket.on('create-room', ({ userId, username, wordMode, timerSeconds }) => {
    const roomCode = createRoomCode()
    const player: Player = {
      userId,
      username,
      team: 'blue',
      role: 'spymaster',
      score: 0,
      connected: true,
      socketId: socket.id,
    }

    const gameState: GameState = {
      gameId: uuidv4(),
      roomCode,
      status: 'lobby',
      cards: [],
      players: [player],
      currentTurn: 'blue',
      currentClue: null,
      guessesRemaining: 0,
      remainingBlue: 9,
      remainingRed: 8,
      timerSeconds: timerSeconds || 90,
      winner: null,
      wordMode: (wordMode as WordMode) || 'standard',
      blindGuessPhase: false,
      correctGuessesThisTurn: 0,
    }

    setRoom(roomCode, { gameState, hostUserId: userId })
    socket.join(roomCode)
    socket.emit('room-created', { roomCode, gameState })
    console.log(`Room created: ${roomCode} by ${username}`)
  })

  socket.on('join-room', ({ roomCode, userId, username }) => {
    const code = roomCode.toUpperCase().trim()
    const room = getRoom(code)

    if (!room) {
      socket.emit('error', { code: 'ROOM_NOT_FOUND', message: `Room ${code} not found` })
      return
    }

    if (room.gameState.status === 'finished') {
      socket.emit('error', { code: 'GAME_FINISHED', message: 'This game has already ended' })
      return
    }

    // Check if player already exists
    const existingPlayer = room.gameState.players.find((p) => p.userId === userId)
    if (existingPlayer) {
      // Reconnect
      const updatedPlayers = room.gameState.players.map((p) =>
        p.userId === userId ? { ...p, connected: true, socketId: socket.id } : p
      )
      updateGameState(code, { ...room.gameState, players: updatedPlayers })
      socket.join(code)
      const stateToSend =
        existingPlayer.role === 'spymaster'
          ? { ...room.gameState, players: updatedPlayers }
          : maskStateForOperatives({ ...room.gameState, players: updatedPlayers })
      socket.emit('room-joined', { gameState: stateToSend })
      return
    }

    // Assign to team with fewer players
    const blueCount = room.gameState.players.filter((p) => p.team === 'blue').length
    const redCount = room.gameState.players.filter((p) => p.team === 'red').length
    const team: Team = blueCount <= redCount ? 'blue' : 'red'

    const newPlayer: Player = {
      userId,
      username,
      team,
      role: 'operative',
      score: 0,
      connected: true,
      socketId: socket.id,
    }

    const newPlayers = [...room.gameState.players, newPlayer]
    const updatedState = { ...room.gameState, players: newPlayers }
    updateGameState(code, updatedState)

    socket.join(code)
    socket.emit('room-joined', { gameState: maskStateForOperatives(updatedState) })
    socket.to(code).emit('player-joined', { player: newPlayer })
    io.to(code).emit('game-event', {
      id: uuidv4(),
      type: 'player_joined',
      actorId: userId,
      actorUsername: username,
      payload: { username },
      timestamp: Date.now(),
    })

    console.log(`${username} joined room ${code}`)
  })

  socket.on('rejoin-room', ({ roomCode, userId }) => {
    const code = roomCode.toUpperCase().trim()
    const room = getRoom(code)
    if (!room) return

    const player = room.gameState.players.find((p) => p.userId === userId)
    if (!player) return

    const updatedPlayers = room.gameState.players.map((p) =>
      p.userId === userId ? { ...p, connected: true, socketId: socket.id } : p
    )
    updateGameState(code, { ...room.gameState, players: updatedPlayers })
    socket.join(code)

    const stateToSend =
      player.role === 'spymaster'
        ? { ...room.gameState, players: updatedPlayers }
        : maskStateForOperatives({ ...room.gameState, players: updatedPlayers })
    socket.emit('room-joined', { gameState: stateToSend })
  })

  socket.on('set-role', ({ roomCode, userId, team, role }) => {
    const code = roomCode.toUpperCase()
    const room = getRoom(code)
    if (!room) return

    // Enforce one spymaster per team
    if (role === 'spymaster') {
      const existing = room.gameState.players.find(
        (p) => p.team === team && p.role === 'spymaster' && p.userId !== userId
      )
      if (existing) {
        socket.emit('error', { code: 'SLOT_TAKEN', message: `${existing.username} is already ${team} spymaster` })
        return
      }
    }

    const updatedPlayers = room.gameState.players.map((p) =>
      p.userId === userId ? { ...p, team, role } : p
    )
    updateGameState(code, { ...room.gameState, players: updatedPlayers })
    io.to(code).emit('role-updated', { userId, team, role })
  })

  socket.on('kick-player', ({ roomCode, hostUserId, targetUserId }) => {
    const code = roomCode.toUpperCase()
    const room = getRoom(code)
    if (!room || room.hostUserId !== hostUserId) return

    const updatedPlayers = room.gameState.players.filter((p) => p.userId !== targetUserId)
    updateGameState(code, { ...room.gameState, players: updatedPlayers })
    io.to(code).emit('player-kicked', { userId: targetUserId })
    console.log(`${targetUserId} kicked from ${code} by host`)
  })
}

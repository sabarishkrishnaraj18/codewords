import type { Socket, Server } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import { getAllRooms, updateGameState } from '../roomManager'

export function registerConnectionHandlers(io: Server, socket: Socket): void {
  console.log(`Client connected: ${socket.id}`)

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)

    // Mark player as disconnected across all rooms
    for (const [roomCode, room] of getAllRooms()) {
      const player = room.gameState.players.find((p) => p.socketId === socket.id)
      if (player) {
        const updatedPlayers = room.gameState.players.map((p) =>
          p.socketId === socket.id ? { ...p, connected: false, socketId: undefined } : p
        )
        updateGameState(roomCode, { ...room.gameState, players: updatedPlayers })
        io.to(roomCode).emit('player-left', { userId: player.userId })
        io.to(roomCode).emit('game-event', {
          id: uuidv4(),
          type: 'player_left',
          actorId: player.userId,
          actorUsername: player.username,
          payload: { username: player.username },
          timestamp: Date.now(),
        })
      }
    }
  })
}

import type { GameState, RoomState } from './types'

const rooms = new Map<string, RoomState>()

export function getRoom(roomCode: string): RoomState | undefined {
  return rooms.get(roomCode.toUpperCase())
}

export function setRoom(roomCode: string, state: RoomState): void {
  rooms.set(roomCode.toUpperCase(), state)
}

export function deleteRoom(roomCode: string): void {
  const room = rooms.get(roomCode.toUpperCase())
  if (room?.timerInterval) clearInterval(room.timerInterval)
  rooms.delete(roomCode.toUpperCase())
}

export function updateGameState(roomCode: string, gameState: GameState): void {
  const room = rooms.get(roomCode.toUpperCase())
  if (room) {
    rooms.set(roomCode.toUpperCase(), { ...room, gameState })
  }
}

export function getAllRooms(): Map<string, RoomState> {
  return rooms
}

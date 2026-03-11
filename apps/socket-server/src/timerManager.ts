import type { Server } from 'socket.io'
import { getRoom, setRoom } from './roomManager'
import type { RoomState } from './types'

const timers = new Map<string, ReturnType<typeof setInterval>>()
const timerValues = new Map<string, number>()

export function startTimer(
  io: Server,
  roomCode: string,
  seconds: number,
  onExpiry: () => void
): void {
  stopTimer(roomCode)

  timerValues.set(roomCode, seconds)
  let remaining = seconds

  const interval = setInterval(() => {
    remaining--
    timerValues.set(roomCode, remaining)
    io.to(roomCode).emit('timer-tick', { secondsRemaining: remaining })

    if (remaining <= 0) {
      stopTimer(roomCode)
      onExpiry()
    }
  }, 1000)

  timers.set(roomCode, interval)
}

export function stopTimer(roomCode: string): void {
  const interval = timers.get(roomCode)
  if (interval) {
    clearInterval(interval)
    timers.delete(roomCode)
    timerValues.delete(roomCode)
  }
}

export function getRemainingTime(roomCode: string): number {
  return timerValues.get(roomCode) ?? 0
}

'use client'
import { io, Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '@/types/socket'

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

function getSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL
  if (typeof window === 'undefined') return 'http://localhost:4000'
  // In production (non-localhost), use the hardcoded Railway socket URL as fallback
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://socket-server-production-b508.up.railway.app'
  }
  return `http://${window.location.hostname}:4000`
}

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    const url = getSocketUrl()
    socket = io(url, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
  }
  return socket
}

export function destroySocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

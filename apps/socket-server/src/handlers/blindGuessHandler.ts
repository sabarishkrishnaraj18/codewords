import type { Socket, Server } from 'socket.io'

// Blind guess logic moved inline to gameHandler.ts (via guess-card event with blindGuessPhase state)
export function registerBlindGuessHandlers(_io: Server, _socket: Socket): void {}

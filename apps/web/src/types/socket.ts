import type { Card, CardColor, Clue, GameEvent, GameState, Player, Role, Team } from './game'

// Client -> Server
export interface ClientToServerEvents {
  'create-room': (payload: { userId: string; username: string; wordMode: string; timerSeconds: number }) => void
  'join-room': (payload: { roomCode: string; userId: string; username: string }) => void
  'rejoin-room': (payload: { roomCode: string; userId: string }) => void
  'set-role': (payload: { roomCode: string; userId: string; team: Team; role: Role }) => void
  'start-game': (payload: { roomCode: string; userId: string }) => void
  'give-clue': (payload: { roomCode: string; userId: string; word: string; number: number }) => void
  'guess-card': (payload: { roomCode: string; userId: string; cardIndex: number }) => void
  'end-turn': (payload: { roomCode: string; userId: string }) => void
  'blind-guess': (payload: { roomCode: string; userId: string; cardIndex: number }) => void
  'reset-game': (payload: { roomCode: string; userId: string }) => void
}

// Server -> Client
export interface ServerToClientEvents {
  'room-created': (payload: { roomCode: string; gameState: GameState }) => void
  'room-joined': (payload: { gameState: GameState }) => void
  'player-joined': (payload: { player: Player }) => void
  'player-left': (payload: { userId: string }) => void
  'role-updated': (payload: { userId: string; team: Team; role: Role }) => void
  'game-started': (payload: { gameState: GameState }) => void
  'clue-given': (payload: { clue: Clue; team: Team }) => void
  'card-revealed': (payload: { card: Card; revealedBy: string }) => void
  'turn-changed': (payload: { turn: Team; remainingBlue: number; remainingRed: number }) => void
  'timer-tick': (payload: { secondsRemaining: number }) => void
  'timer-expired': () => void
  'blind-guess-phase': (payload: { eligiblePlayers: string[] }) => void
  'blind-guess-result': (payload: { cardIndex: number; color: CardColor; playerId: string; playerUsername: string; scoreDelta: number }) => void
  'score-updated': (payload: { userId: string; score: number }) => void
  'game-over': (payload: { winner: Team; scores: Array<{ userId: string; username: string; team: Team; score: number }> }) => void
  'game-reset': (payload: { gameState: GameState }) => void
  'game-event': (payload: GameEvent) => void
  'error': (payload: { code: string; message: string }) => void
}

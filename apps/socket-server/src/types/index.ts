export type Team = 'blue' | 'red'
export type Role = 'spymaster' | 'operative' | 'spectator'
export type CardColor = 'blue' | 'red' | 'neutral' | 'assassin' | 'unknown'
export type GameStatus = 'lobby' | 'active' | 'finished'
export type WordMode = 'standard' | 'mix' | 'custom'

export interface Card {
  index: number
  word: string
  color: CardColor
  revealed: boolean
  revealedBy?: string
}

export interface Player {
  userId: string
  username: string
  team: Team
  role: Role
  score: number
  connected: boolean
  socketId?: string
}

export interface Clue {
  word: string
  number: number
}

export interface GameState {
  gameId: string
  roomCode: string
  status: GameStatus
  cards: Card[]
  players: Player[]
  currentTurn: Team
  currentClue: Clue | null
  guessesRemaining: number
  remainingBlue: number
  remainingRed: number
  timerSeconds: number
  winner: Team | null
  wordMode: WordMode
  blindGuessPhase: boolean
  correctGuessesThisTurn: number
}

export interface RoomState {
  gameState: GameState
  hostUserId: string
  timerInterval?: ReturnType<typeof setInterval>
}

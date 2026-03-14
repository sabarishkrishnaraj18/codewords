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
  revealedBy?: string // userId
}

export interface Player {
  userId: string
  username: string
  team: Team
  role: Role
  score: number
  connected: boolean
}

export interface Clue {
  word: string
  number: number // 0 = unlimited
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

export interface GameEvent {
  id: string
  type: 'clue_given' | 'card_revealed' | 'blind_guess' | 'turn_end' | 'game_over' | 'player_joined' | 'player_left'
  actorId?: string
  actorUsername?: string
  team?: Team
  payload: Record<string, unknown>
  timestamp: number
}

export interface BlindGuessResult {
  cardIndex: number
  color: CardColor
  playerId: string
  playerUsername: string
  scoreDelta: number
}

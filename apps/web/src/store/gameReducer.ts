import type { Card, CardColor, Clue, GameEvent, GameState, Player, Role, Team } from '@/types/game'

export type GameAction =
  | { type: 'INIT_STATE'; payload: GameState }
  | { type: 'PLAYER_JOINED'; payload: { player: Player } }
  | { type: 'PLAYER_LEFT'; payload: { userId: string } }
  | { type: 'ROLE_UPDATED'; payload: { userId: string; team: Team; role: Role } }
  | { type: 'GAME_STARTED'; payload: GameState }
  | { type: 'CLUE_GIVEN'; payload: { clue: Clue; team: Team } }
  | { type: 'CARD_REVEALED'; payload: { card: Card; revealedBy: string; isBlindGuess?: boolean; scoreDelta?: number } }
  | { type: 'TURN_CHANGED'; payload: { turn: Team; remainingBlue: number; remainingRed: number } }
  | { type: 'TIMER_TICK'; payload: { secondsRemaining: number } }
  | { type: 'BLIND_GUESS_PHASE'; payload: { eligiblePlayers: string[] } }
  | { type: 'BLIND_GUESS_RESULT'; payload: { cardIndex: number; color: CardColor; playerId: string; playerUsername: string; scoreDelta: number } }
  | { type: 'SCORE_UPDATED'; payload: { userId: string; score: number } }
  | { type: 'GAME_OVER'; payload: { winner: Team; scores: Array<{ userId: string; username: string; team: Team; score: number }> } }
  | { type: 'GAME_RESET'; payload: GameState }
  | { type: 'ADD_EVENT'; payload: GameEvent }

export interface ClientGameState extends GameState {
  timerSecondsRemaining: number
  events: GameEvent[]
  gameOverData: { winner: Team; scores: Array<{ userId: string; username: string; team: Team; score: number }> } | null
}

export const initialClientGameState: ClientGameState = {
  gameId: '',
  roomCode: '',
  status: 'lobby',
  cards: [],
  players: [],
  currentTurn: 'blue',
  currentClue: null,
  guessesRemaining: 0,
  remainingBlue: 9,
  remainingRed: 8,
  timerSeconds: 90,
  winner: null,
  wordMode: 'standard',
  blindGuessPhase: false,
  correctGuessesThisTurn: 0,
  timerSecondsRemaining: 90,
  events: [],
  gameOverData: null,
}

export function gameReducer(state: ClientGameState, action: GameAction): ClientGameState {
  switch (action.type) {
    case 'INIT_STATE':
    case 'GAME_STARTED':
    case 'GAME_RESET':
      return {
        ...state,
        ...action.payload,
        timerSecondsRemaining: action.payload.timerSeconds,
        events: state.events,
        gameOverData: null,
      }

    case 'PLAYER_JOINED':
      if (state.players.find((p) => p.userId === action.payload.player.userId)) return state
      return { ...state, players: [...state.players, action.payload.player] }

    case 'PLAYER_LEFT':
      return {
        ...state,
        players: state.players.map((p) =>
          p.userId === action.payload.userId ? { ...p, connected: false } : p
        ),
      }

    case 'ROLE_UPDATED':
      return {
        ...state,
        players: state.players.map((p) =>
          p.userId === action.payload.userId
            ? { ...p, team: action.payload.team, role: action.payload.role }
            : p
        ),
      }

    case 'CLUE_GIVEN':
      return {
        ...state,
        currentClue: action.payload.clue,
        currentTurn: action.payload.team,
        guessesRemaining: action.payload.clue.number === 0 ? 99 : action.payload.clue.number + 1,
        correctGuessesThisTurn: 0,
        blindGuessPhase: false,
      }

    case 'CARD_REVEALED': {
      const isCorrect = action.payload.card.color === state.currentTurn
      const newGuessesRemaining = isCorrect
        ? Math.max(0, state.guessesRemaining - 1)
        : 0
      const newCorrectGuesses = isCorrect
        ? state.correctGuessesThisTurn + 1
        : state.correctGuessesThisTurn
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.index === action.payload.card.index ? { ...action.payload.card } : c
        ),
        guessesRemaining: action.payload.isBlindGuess ? 0 : newGuessesRemaining,
        correctGuessesThisTurn: action.payload.isBlindGuess ? state.correctGuessesThisTurn : newCorrectGuesses,
      }
    }

    case 'TURN_CHANGED':
      return {
        ...state,
        currentTurn: action.payload.turn,
        remainingBlue: action.payload.remainingBlue,
        remainingRed: action.payload.remainingRed,
        currentClue: null,
        guessesRemaining: 0,
        correctGuessesThisTurn: 0,
        blindGuessPhase: false,
        timerSecondsRemaining: state.timerSeconds,
      }

    case 'TIMER_TICK':
      return { ...state, timerSecondsRemaining: action.payload.secondsRemaining }

    case 'BLIND_GUESS_PHASE':
      return { ...state, blindGuessPhase: true }

    case 'BLIND_GUESS_RESULT':
      // Card already revealed via CARD_REVEALED; just update score via SCORE_UPDATED
      return state

    case 'SCORE_UPDATED':
      return {
        ...state,
        players: state.players.map((p) =>
          p.userId === action.payload.userId ? { ...p, score: action.payload.score } : p
        ),
      }

    case 'GAME_OVER':
      return {
        ...state,
        status: 'finished',
        winner: action.payload.winner,
        players: state.players.map((p) => {
          const scoreData = action.payload.scores.find((s) => s.userId === p.userId)
          return scoreData ? { ...p, score: scoreData.score } : p
        }),
        gameOverData: action.payload,
      }

    case 'ADD_EVENT':
      return { ...state, events: [...state.events.slice(-49), action.payload] }

    default:
      return state
  }
}

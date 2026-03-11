import fs from 'fs'
import path from 'path'
import type { Card, CardColor, GameState, Player, Team } from './types'

// Load standard word list from file
let standardWords: string[] = []
try {
  const filePath = path.join(__dirname, '../../web/public/words/standard.json')
  standardWords = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
} catch {
  // fallback inline words
  standardWords = ['AFRICA','AGENT','AIR','ALIEN','ALPS','AMAZON','AMBULANCE','AMERICA','ANGEL','APPLE',
    'ARM','BACK','BALL','BAND','BANK','BAR','BARK','BAT','BEACH','BEAR','BEAT','BED','BELL','BELT','BERRY',
    'BILL','BLOCK','BOARD','BOLT','BOMB','BOND','BOOK','BOOT','BOTTLE','BOW','BOX','BRAIN','BRIDGE','BRUSH',
    'BUG','BUTTER','BUTTON','CABLE','CAP','CAPITAL','CAR','CARD','CAT','CELL','CHAIN','CHARGE','CHECK',
    'CHURCH','CIRCLE','CLIFF','CLUB','COAL','CODE','COLD','COMIC','CONTRACT','COPPER','CRANE','CROSS',
    'CROWN','CYCLE','DANCE','DATE','DAY','DECK','DEGREE','DIAMOND','DICE','DIVER','DOCTOR','DOG','DRAFT',
    'DRAGON','DRESS','DRILL','DRUM','DUCK','DUST','EAGLE','EMBASSY','ENGINE','FALL','FAN','FIELD','FIGHTER',
    'FILE','FIRE','FISH','FLAG','FLIGHT','FLY','FORCE','FOREST','FORK','GAME','GIANT','GOLD','GRASS','GROUND',
    'GUARD','GUN','HAMMER','HAND','HARBOR','HAT','HEAD','HEART','HERO','HOLE','HOOK','HORN','HOSPITAL',
    'HURRICANE','ICE','IRON','JACK','JAM','JAR','JET','JUNGLE','JUPITER','KEY','KNIGHT','KNOCK','LAB',
    'LAMP','LASER','LEAD','LEAF','LEG','LEMON','LIGHT','LION','LOG','LOCK','LONDON','LORD','MACHINE',
    'MAIL','MAPLE','MARCH','MARK','MARKET','MATCH','METAL','MISSILE','MODEL','MOON','MOUNTAIN','MOUSE',
    'NAIL','NEEDLE','NIGHT','NURSE','OAK','PALM','PAPER','PARK','PARTY','PATROL','PIANO','PILOT','PINE',
    'PIPE','PISTOL','PITCH','PIZZA','PLANE','PLASTIC','PLATE','PLATFORM','PLAY','PLOT','POCKET','POINT',
    'POISON','POLE','POST','PRESS','PRIME','PRINCE','PRINTER','PROBE','QUEEN','RADIO','RAIL','RAM','RAY',
    'RAZOR','RING','ROBOT','ROCK','ROME','ROUND','SATELLITE','SAW','SCALE','SCHOOL','SCREEN','SEAL',
    'SHADOW','SHARK','SHIP','SHOE','SHOP','SHOT','SIGNAL','SILVER','SKELETON','SKULL','SNAKE','SOLDIER',
    'SPACE','SPIDER','SPRING','SPY','SQUARE','STADIUM','STAR','STICK','STORM','STRIKE','SUBMARINE',
    'SWING','SWITCH','TABLE','TAIL','TANK','TEA','THEATER','TIE','TIME','TORCH','TRAIN','TRAP','TREE',
    'TRUNK','TUNNEL','TURKEY','UMBRELLA','UNICORN','VACUUM','VAMPIRE','VAULT','VIRUS','VOLCANO','WALL',
    'WAR','WAVE','WEB','WELL','WHALE','WIND','WITCH','WOLF','WORM','YARD']
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export function createRoomCode(): string {
  return generateCode()
}

export function dealCards(customWords?: string[], wordMode: string = 'standard'): Card[] {
  let wordPool = [...standardWords]
  if (wordMode === 'custom' && customWords && customWords.length >= 25) {
    wordPool = [...customWords]
  } else if (wordMode === 'mix' && customWords && customWords.length > 0) {
    wordPool = [...customWords, ...standardWords]
  }

  const selected = shuffle(wordPool).slice(0, 25)

  // Blue gets 9 (starts first), Red gets 8, neutral 7, assassin 1
  const colors: CardColor[] = [
    ...Array(9).fill('blue'),
    ...Array(8).fill('red'),
    ...Array(7).fill('neutral'),
    'assassin',
  ]
  const shuffledColors = shuffle(colors)

  return selected.map((word, index) => ({
    index,
    word,
    color: shuffledColors[index] as CardColor,
    revealed: false,
  }))
}

export function maskStateForOperatives(state: GameState): GameState {
  return {
    ...state,
    cards: state.cards.map((card) => ({
      ...card,
      color: card.revealed ? card.color : 'unknown',
    })),
  }
}

export type GuessResult = 'correct' | 'wrong-team' | 'neutral' | 'assassin'

export function applyGuess(
  state: GameState,
  cardIndex: number,
  userId: string
): { newState: GameState; result: GuessResult } {
  const card = state.cards[cardIndex]
  if (!card || card.revealed) throw new Error('Invalid card')

  const newCards = state.cards.map((c) =>
    c.index === cardIndex ? { ...c, revealed: true, revealedBy: userId } : c
  )

  let result: GuessResult
  if (card.color === 'assassin') result = 'assassin'
  else if (card.color === state.currentTurn) result = 'correct'
  else if (card.color === 'neutral') result = 'neutral'
  else result = 'wrong-team'

  const remainingBlue = newCards.filter((c) => c.color === 'blue' && !c.revealed).length
  const remainingRed = newCards.filter((c) => c.color === 'red' && !c.revealed).length

  let guessesRemaining = state.guessesRemaining - 1
  if (result !== 'correct') guessesRemaining = 0

  const correctGuessesThisTurn =
    result === 'correct' ? state.correctGuessesThisTurn + 1 : state.correctGuessesThisTurn

  return {
    newState: { ...state, cards: newCards, remainingBlue, remainingRed, guessesRemaining, correctGuessesThisTurn },
    result,
  }
}

export function applyBlindGuess(
  state: GameState,
  cardIndex: number,
  userId: string
): { newState: GameState; scoreDelta: number } {
  const card = state.cards[cardIndex]
  if (!card || card.revealed) throw new Error('Invalid card')

  const player = state.players.find((p) => p.userId === userId)
  if (!player) throw new Error('Player not found')

  let scoreDelta = 0
  if (card.color === 'assassin') scoreDelta = -2
  else if (card.color === player.team) scoreDelta = 2
  else if (card.color === 'neutral') scoreDelta = 0
  else scoreDelta = -1 // opponent card

  const newPlayers = state.players.map((p) =>
    p.userId === userId ? { ...p, score: p.score + scoreDelta } : p
  )

  // Reveal the card
  const newCards = state.cards.map((c) =>
    c.index === cardIndex ? { ...c, revealed: true, revealedBy: userId } : c
  )
  const remainingBlue = newCards.filter((c) => c.color === 'blue' && !c.revealed).length
  const remainingRed = newCards.filter((c) => c.color === 'red' && !c.revealed).length

  return {
    newState: {
      ...state,
      players: newPlayers,
      cards: newCards,
      remainingBlue,
      remainingRed,
    },
    scoreDelta,
  }
}

export function checkWin(state: GameState): Team | null {
  // Check assassin revealed
  const assassin = state.cards.find((c) => c.color === 'assassin' && c.revealed)
  if (assassin) {
    // The team whose turn it is loses
    return state.currentTurn === 'blue' ? 'red' : 'blue'
  }
  if (state.remainingBlue === 0) return 'blue'
  if (state.remainingRed === 0) return 'red'
  return null
}

export function advanceTurn(state: GameState): GameState {
  const nextTurn: Team = state.currentTurn === 'blue' ? 'red' : 'blue'
  return {
    ...state,
    currentTurn: nextTurn,
    currentClue: null,
    guessesRemaining: 0,
    blindGuessPhase: false,
    correctGuessesThisTurn: 0,
    timerSeconds: state.timerSeconds, // reset will be handled by timer manager
  }
}


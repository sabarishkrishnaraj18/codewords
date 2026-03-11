export const BLUE_CARD_COUNT = 9
export const RED_CARD_COUNT = 8
export const NEUTRAL_CARD_COUNT = 7
export const ASSASSIN_CARD_COUNT = 1
export const TOTAL_CARDS = 25
export const DEFAULT_TIMER_SECONDS = 90

export const BLIND_GUESS_SCORES = {
  ownTeam: 2,
  opponentTeam: -1,
  neutral: 0,
  assassin: -2,
} as const

export const CARD_COLOR_CLASSES: Record<string, string> = {
  blue: 'bg-card-blue text-white',
  red: 'bg-card-red text-white',
  neutral: 'bg-card-neutral text-gray-800',
  assassin: 'bg-card-assassin text-white border-gray-600',
  unknown: 'bg-card-unknown text-gray-800',
}

export const CARD_BORDER_CLASSES: Record<string, string> = {
  blue: 'border-card-blue',
  red: 'border-card-red',
  neutral: 'border-card-neutral',
  assassin: 'border-gray-600',
  unknown: 'border-transparent',
}

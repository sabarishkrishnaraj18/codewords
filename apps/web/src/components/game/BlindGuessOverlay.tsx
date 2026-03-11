'use client'
import { motion, AnimatePresence } from 'framer-motion'
import type { Card } from '@/types/game'

interface BlindGuessResult {
  cardIndex: number
  color: string
  playerId: string
  playerUsername: string
  scoreDelta: number
}

interface Props {
  cards: Card[]
  isEligible: boolean
  onGuess: (index: number) => void
  results: BlindGuessResult[]
}

const colorStyles: Record<string, string> = {
  blue: 'bg-card-blue text-white',
  red: 'bg-card-red text-white',
  neutral: 'bg-card-neutral text-gray-800',
  assassin: 'bg-card-assassin text-white',
  unknown: 'bg-card-unknown text-gray-800',
}

export default function BlindGuessOverlay({ cards, isEligible, onGuess, results }: Props) {
  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm flex flex-col items-center justify-center p-4"
    >
      <h2 className="text-3xl font-display font-bold text-yellow-400 mb-2 uppercase tracking-wider">
        Blind Guess!
      </h2>
      <p className="text-gray-300 mb-6 text-center max-w-md">
        {isEligible
          ? 'Tap any card for bonus points! Correct team: +2, Opponent: -1, Neutral: 0, Assassin: -2'
          : 'Watching another team member make a blind guess...'}
      </p>

      {/* Score legend */}
      <div className="flex gap-4 mb-6 text-sm">
        <span className="text-blue-300">Own team: +2</span>
        <span className="text-red-300">Opponent: -1</span>
        <span className="text-gray-300">Neutral: 0</span>
        <span className="text-gray-500">Assassin: -2</span>
      </div>

      {/* 5x5 grid - colors hidden */}
      <div className="grid grid-cols-5 gap-2 w-full max-w-2xl">
        {cards.map((card) => {
          const result = results.find((r) => r.cardIndex === card.index)
          const isTaken = !!result

          return (
            <div key={card.index} className="relative">
              <motion.button
                whileHover={isEligible && !isTaken ? { scale: 1.05, y: -2 } : {}}
                whileTap={isEligible && !isTaken ? { scale: 0.95 } : {}}
                onClick={() => isEligible && !isTaken && onGuess(card.index)}
                disabled={!isEligible || isTaken}
                className={`
                  w-full aspect-[4/3] rounded-lg border-2 flex items-center justify-center
                  font-display font-bold text-xs tracking-wider uppercase
                  transition-all duration-150
                  ${isTaken
                    ? colorStyles[result!.color] || colorStyles.unknown
                    : 'bg-gray-700 text-white border-gray-600'}
                  ${isEligible && !isTaken ? 'cursor-pointer hover:border-yellow-400' : 'cursor-default'}
                `}
              >
                {card.word}
              </motion.button>

              {/* Score delta pop */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ scale: 0, y: 0, opacity: 1 }}
                    animate={{ scale: 1.2, y: -20, opacity: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`absolute inset-0 flex items-center justify-center pointer-events-none text-xl font-bold ${result.scoreDelta > 0 ? 'text-green-400' : result.scoreDelta < 0 ? 'text-red-400' : 'text-gray-400'}`}
                  >
                    {result.scoreDelta >= 0 ? `+${result.scoreDelta}` : result.scoreDelta}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

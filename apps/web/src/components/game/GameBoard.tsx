'use client'
import { motion, AnimatePresence } from 'framer-motion'
import WordCard from './WordCard'
import type { Card } from '@/types/game'

interface Props {
  cards: Card[]
  isSpymaster: boolean
  canGuess: boolean
  canBlindGuess: boolean
  onGuess: (index: number) => void
}

export default function GameBoard({ cards, isSpymaster, canGuess, canBlindGuess, onGuess }: Props) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-3xl mx-auto">
      <AnimatePresence>
        {canBlindGuess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-center gap-2 py-1.5 px-4 rounded-xl bg-yellow-400/15 border border-yellow-400/40"
          >
            <span className="text-yellow-300 text-xs font-bold uppercase tracking-widest">
              ★ Bonus Blind Guess — Pick any unrevealed card
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="grid grid-cols-5 gap-2 w-full">
        {cards.map((card) => (
          <WordCard
            key={card.index}
            card={card}
            isSpymaster={isSpymaster}
            canGuess={canGuess}
            canBlindGuess={canBlindGuess}
            onGuess={onGuess}
          />
        ))}
      </div>
    </div>
  )
}

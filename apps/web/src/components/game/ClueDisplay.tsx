'use client'
import { motion, AnimatePresence } from 'framer-motion'
import type { Clue, Team } from '@/types/game'

interface Props {
  clue: Clue | null
  team: Team
  guessesRemaining: number
  blindGuessPhase: boolean
}

export default function ClueDisplay({ clue, team, guessesRemaining, blindGuessPhase }: Props) {
  const show = !!clue && !blindGuessPhase

  const isBlue = team === 'blue'
  const accentColor = isBlue ? '#52b7ff' : '#ff8370'
  const bgColor = isBlue ? 'rgba(0,100,180,0.18)' : 'rgba(180,40,30,0.18)'
  const borderColor = isBlue ? 'rgba(82,183,255,0.35)' : 'rgba(255,131,112,0.35)'

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={`${clue?.word}-${clue?.number}`}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="flex items-center justify-center gap-3 px-5 py-2.5 rounded-2xl border"
          style={{ background: bgColor, borderColor }}
        >
          <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold shrink-0">Clue</span>
          <span
            className="font-display font-black text-2xl sm:text-3xl uppercase tracking-wider"
            style={{ color: accentColor }}
          >
            {clue?.word}
          </span>
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-lg sm:text-xl shrink-0"
            style={{ background: accentColor, color: '#1e1610' }}
          >
            {clue?.number === 0 ? '∞' : clue?.number}
          </div>
          {guessesRemaining > 0 && (
            <span className="text-white/35 text-xs font-semibold shrink-0">
              {guessesRemaining} left
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

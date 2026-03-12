'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { Card } from '@/types/game'
import { useLongPress, useWordDefinition } from '@/hooks/useWordDefinition'

interface Props {
  card: Card
  isSpymaster: boolean
  canGuess: boolean
  canBlindGuess: boolean
  onGuess: (index: number) => void
}

const revealedBg: Record<string, string> = {
  blue: 'bg-[#5ba3d4]',
  red: 'bg-[#cd4d3c]',
  neutral: 'bg-[#c8a97a]',
  assassin: 'bg-[#2d2d2d]',
}

const revealedText: Record<string, string> = {
  blue: 'text-white',
  red: 'text-white',
  neutral: 'text-[#5a3e28]',
  assassin: 'text-gray-300',
}

// Solid colors for spymaster unrevealed view — matches codenames.game palette
const spymasterBg: Record<string, string> = {
  blue: 'rgba(0,120,210,0.82)',
  red: 'rgba(220,60,45,0.82)',
  neutral: 'rgba(170,130,80,0.75)',
  assassin: 'rgba(30,30,30,0.90)',
  unknown: '#e8d5b0',
}

const spymasterText: Record<string, string> = {
  blue: '#e0f4ff',
  red: '#ffe8e6',
  neutral: '#3d2e1a',
  assassin: '#cccccc',
  unknown: '#3d2e1a',
}

export default function WordCard({ card, isSpymaster, canGuess, canBlindGuess, onGuess }: Props) {
  const isClickable = (canGuess || canBlindGuess) && !card.revealed
  const { definition, loading, lookup } = useWordDefinition()
  const [showDef, setShowDef] = useState(false)

  const longPressHandlers = useLongPress(() => {
    setShowDef(true)
    lookup(card.word)
  }, 600)

  return (
    <div className="relative">
      <motion.div
        layout
        whileHover={isClickable ? { scale: 1.05, y: -3 } : {}}
        whileTap={isClickable ? { scale: 0.96 } : {}}
        onClick={() => isClickable && onGuess(card.index)}
        {...longPressHandlers}
        className={`relative w-full rounded-xl select-none overflow-hidden ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
        style={{ aspectRatio: '5/3', minHeight: 52 }}
      >
        {!card.revealed ? (
          isSpymaster ? (
            /* Spymaster sees full color background */
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: spymasterBg[card.color] ?? '#e8d5b0' }}
            >
              <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              {card.color === 'assassin' && (
                <span className="absolute top-1 left-1 text-xs opacity-60" style={{ color: spymasterText[card.color] }}>☠</span>
              )}
              <span
                className="relative z-10 font-display font-bold text-[11px] sm:text-sm tracking-wider uppercase text-center px-1 leading-tight"
                style={{ color: spymasterText[card.color] ?? '#3d2e1a' }}
              >
                {card.word}
              </span>
              {canBlindGuess && (
                <motion.div
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{ boxShadow: '0 0 0 2px #fbbf24' }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                />
              )}
            </div>
          ) : (
            /* Operative sees warm beige */
            <div
              className="absolute inset-0 flex items-center justify-center bg-[#e8d5b0]"
              style={{ boxShadow: '0 5px 0 #b8a080, 0 2px 6px rgba(0,0,0,0.3)' }}
            >
              <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/10 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
              <span className="relative z-10 font-display font-bold text-[#3d2e1a] text-[11px] sm:text-sm tracking-wider uppercase text-center px-1 leading-tight">
                {card.word}
              </span>
              {canBlindGuess && (
                <motion.div
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{ boxShadow: '0 0 0 2px #fbbf24' }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                />
              )}
            </div>
          )
        ) : (
          /* Revealed */
          <motion.div
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`absolute inset-0 flex items-center justify-center ${revealedBg[card.color] || 'bg-gray-600'} ${revealedText[card.color] || 'text-white'}`}
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 6px rgba(0,0,0,0.4)' }}
          >
            <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            {card.color === 'assassin' && <span className="absolute top-1 left-1 text-xs opacity-60">☠</span>}
            <span className="relative z-10 font-display font-bold text-[11px] sm:text-sm tracking-wider uppercase text-center px-1 leading-tight opacity-90">
              {card.word}
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Definition popover */}
      <AnimatePresence>
        {showDef && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 w-60 bg-[#0f172a] border border-white/20 rounded-xl shadow-2xl p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowDef(false)} className="absolute top-2 right-2 text-gray-500 hover:text-white text-xs leading-none">✕</button>
            <p className="font-display font-bold text-sm text-white uppercase tracking-wider mb-2">{card.word}</p>
            {loading ? (
              <p className="text-gray-400 text-xs">Looking up...</p>
            ) : definition?.meanings.map((m, i) => (
              <div key={i} className="mb-1.5">
                {m.partOfSpeech && <span className="text-blue-400 text-[11px] italic mr-1">{m.partOfSpeech}</span>}
                <span className="text-gray-200 text-[11px]">{m.definition}</span>
                {m.example && <p className="text-gray-500 text-[10px] mt-0.5 italic">"{m.example}"</p>}
              </div>
            ))}
            <p className="text-gray-600 text-[9px] mt-1 border-t border-white/10 pt-1">Hold / right-click any card</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

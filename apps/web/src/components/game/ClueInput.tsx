'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  onSubmit: (word: string, number: number) => void
  cardWords: string[]
}

export default function ClueInput({ onSubmit, cardWords }: Props) {
  const [word, setWord] = useState('')
  const [num, setNum] = useState(1)
  const [error, setError] = useState('')

  const validate = (w: string): string => {
    if (!w.trim()) return 'Enter a clue word'
    if (/^\d+$/.test(w)) return 'Clue cannot be a number'
    if (w.includes(' ')) return 'One word only'
    const upper = w.toUpperCase().trim()
    if (cardWords.some(cw => cw === upper || upper.includes(cw) || cw.includes(upper)))
      return 'Clue cannot match a board word'
    return ''
  }

  const handleSubmit = () => {
    const err = validate(word)
    if (err) { setError(err); return }
    onSubmit(word.trim().toUpperCase(), num)
    setWord(''); setNum(1); setError('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-1.5 w-full"
    >
      {/* Main clue row — matches screenshot exactly */}
      <div className="flex items-center gap-2 w-full max-w-2xl">
        {/* Pill input */}
        <input
          type="text"
          value={word}
          onChange={e => { setWord(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="YOUR CLUE"
          maxLength={30}
          className="flex-1 bg-white/95 border-2 border-white/80 rounded-full px-6 py-4 text-[#1a1a1a] font-display font-bold text-base uppercase tracking-widest placeholder-gray-400 focus:outline-none focus:border-white text-center shadow-lg"
        />

        {/* Minus */}
        <button
          onClick={() => setNum(n => Math.max(0, n - 1))}
          className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-2xl flex items-center justify-center transition-colors shadow border border-white/20"
        >
          −
        </button>

        {/* Count */}
        <span className="text-white font-bold text-xl w-7 text-center tabular-nums">
          {num === 0 ? '∞' : num}
        </span>

        {/* Plus */}
        <button
          onClick={() => setNum(n => Math.min(9, n + 1))}
          className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-2xl flex items-center justify-center transition-colors shadow border border-white/20"
        >
          +
        </button>

        {/* Green submit arrow */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          onClick={handleSubmit}
          className="w-12 h-12 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-white text-xl flex items-center justify-center shadow-lg shadow-green-900/40"
        >
          ➤
        </motion.button>
      </div>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs">
          {error}
        </motion.p>
      )}
    </motion.div>
  )
}

'use client'
import { motion } from 'framer-motion'
import type { Team } from '@/types/game'

interface Score {
  userId: string
  username: string
  team: Team
  score: number
}

interface Props {
  winner: Team
  scores: Score[]
  onPlayAgain: () => void
  onHome: () => void
}

export default function GameOverModal({ winner, scores, onPlayAgain, onHome }: Props) {
  const sorted = [...scores].sort((a, b) => b.score - a.score)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className={`
          relative rounded-2xl p-8 max-w-md w-full border-2 text-center
          ${winner === 'blue'
            ? 'bg-blue-900/80 border-blue-400 shadow-[0_0_40px_rgba(74,144,217,0.4)]'
            : 'bg-red-900/80 border-red-400 shadow-[0_0_40px_rgba(192,57,43,0.4)]'}
        `}
      >
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-6xl mb-4"
        >
          🏆
        </motion.div>

        <h2 className="font-display text-4xl font-bold uppercase tracking-wider mb-1">
          {winner === 'blue' ? '🔵 Blue' : '🔴 Red'} Wins!
        </h2>
        <p className="text-gray-300 mb-6">Great game!</p>

        {/* Scores */}
        <div className="bg-black/30 rounded-xl p-4 mb-6">
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">Scores</p>
          <div className="flex flex-col gap-2">
            {sorted.map((s, i) => (
              <motion.div
                key={s.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm w-4">{i + 1}.</span>
                  <span className={`text-sm font-medium ${s.team === 'blue' ? 'text-blue-300' : 'text-red-300'}`}>
                    {s.username}
                  </span>
                </div>
                <span className={`font-bold ${s.score > 0 ? 'text-green-400' : s.score < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {s.score > 0 ? `+${s.score}` : s.score} pts
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onHome}
            className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
          >
            Home
          </button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onPlayAgain}
            className={`flex-1 py-3 rounded-xl font-bold text-white transition-colors ${winner === 'blue' ? 'bg-blue-500 hover:bg-blue-400' : 'bg-red-500 hover:bg-red-400'}`}
          >
            Play Again
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

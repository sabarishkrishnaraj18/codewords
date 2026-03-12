'use client'
import { motion } from 'framer-motion'

interface Props {
  onClose: () => void
}

const rules = [
  { title: 'Objective', text: 'Find all your team\'s words before the other team finds theirs.' },
  { title: 'Spymaster', text: 'Give a one-word clue and a number. The number tells your team how many words relate to your clue.' },
  { title: 'Operatives', text: 'Discuss and guess cards that match the clue. You can guess up to (number + 1) times.' },
  { title: 'Assassin', text: 'If you guess the black card, your team loses immediately!' },
  { title: 'Neutral', text: 'Guessing a neutral card ends your turn.' },
  { title: 'Bonus Guess', text: 'After all clue cards are guessed correctly, you get 1 bonus blind guess on any remaining card.' },
  { title: 'Scoring', text: 'Own team card: +2 pts · Opponent card: −1 pt · Neutral: 0 · Assassin: −2 pts' },
]

export default function RulesModal({ onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 16 }}
        className="bg-[#0f1a2e] border border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-black text-xl uppercase tracking-[0.15em] text-white">
            How to Play
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-lg leading-none transition-colors">✕</button>
        </div>

        <div className="flex flex-col gap-3">
          {rules.map(({ title, text }) => (
            <div key={title} className="flex gap-3">
              <div className="w-1.5 rounded-full shrink-0 mt-1" style={{ background: 'linear-gradient(180deg, #008ee0, #52b7ff)', minHeight: 16 }} />
              <div>
                <p className="font-bold text-sm text-white/90 leading-snug">{title}</p>
                <p className="text-white/50 text-xs leading-relaxed mt-0.5">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-white/8 hover:bg-white/14 text-white/60 hover:text-white text-sm font-semibold border border-white/12 transition-all"
        >
          Got it
        </button>
      </motion.div>
    </motion.div>
  )
}

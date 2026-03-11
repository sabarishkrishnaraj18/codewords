'use client'
import type { Card } from '@/types/game'

interface Props {
  cards: Card[]
}

const dotBg: Record<string, string> = {
  blue: '#5090c8',
  red: '#c0392b',
  neutral: '#c8a97a',
  assassin: '#2d2d2d',
  unknown: '#555',
}

export default function SpymasterKey({ cards }: Props) {
  return (
    <div className="bg-black/50 rounded-xl p-2.5 border border-white/10 shadow-lg">
      <p className="text-[9px] text-white/30 text-center mb-2 uppercase tracking-[0.2em] font-bold">Key</p>
      <div className="grid grid-cols-5 gap-1">
        {cards.map((card) => (
          <div
            key={card.index}
            className="w-5 h-3.5 rounded-sm"
            style={{
              background: dotBg[card.color] ?? '#555',
              opacity: card.revealed ? 0.25 : 1,
            }}
            title={card.word}
          />
        ))}
      </div>
    </div>
  )
}

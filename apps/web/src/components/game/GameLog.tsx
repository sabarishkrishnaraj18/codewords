'use client'
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GameEvent } from '@/types/game'

interface Props {
  events: GameEvent[]
}

const colorForEvent = (event: GameEvent): string => {
  if (event.type === 'clue_given') return event.team === 'blue' ? 'text-blue-300' : 'text-red-300'
  if (event.type === 'card_revealed') {
    const color = event.payload.color as string
    if (color === 'blue') return 'text-blue-300'
    if (color === 'red') return 'text-red-300'
    if (color === 'assassin') return 'text-gray-400'
    return 'text-yellow-300'
  }
  if (event.type === 'blind_guess') return 'text-purple-300'
  if (event.type === 'game_over') return 'text-yellow-300 font-bold'
  if (event.type === 'player_joined') return 'text-green-400'
  if (event.type === 'player_left') return 'text-gray-500'
  return 'text-gray-300'
}

const describeEvent = (event: GameEvent): string => {
  switch (event.type) {
    case 'clue_given':
      return `${event.actorUsername} gave clue: "${event.payload.word}" (${event.payload.number === 0 ? '∞' : event.payload.number})`
    case 'card_revealed':
      return `${event.actorUsername} revealed ${event.payload.word} (${event.payload.color})`
    case 'blind_guess':
      { const d = event.payload.scoreDelta as number; return `${event.actorUsername} blind guessed ${event.payload.word} → ${d >= 0 ? '+' : ''}${d}` }
    case 'turn_end':
      return `Turn passed to ${event.payload.nextTurn} team`
    case 'game_over':
      return `Game over! ${event.payload.winner} team wins!`
    case 'player_joined':
      return `${event.actorUsername} joined`
    case 'player_left':
      return `${event.actorUsername} left`
    default:
      return ''
  }
}

export default function GameLog({ events }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Game Log</span>
        <span className="text-xs text-gray-500">{events.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-2 flex flex-col gap-1">
        <AnimatePresence>
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-xs ${colorForEvent(event)}`}
            >
              {describeEvent(event)}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

'use client'
import type { Clue, Team } from '@/types/game'

interface Props {
  team: Team
  remainingCards: number
  currentClue: Clue | null
  isActiveTeam: boolean
  timerSecondsRemaining: number
  guessesRemaining: number
}

export default function MobileTeamStrip({
  team, remainingCards, currentClue, isActiveTeam, timerSecondsRemaining, guessesRemaining,
}: Props) {
  const isBlue = team === 'blue'
  const color = isBlue ? '#008ee0' : '#ff5241'
  const bg = isBlue ? 'bg-[#0d3a6b]/90' : 'bg-[#5e140c]/90'
  const border = isActiveTeam
    ? (isBlue ? 'border-[#008ee0]/60' : 'border-[#ff5241]/60')
    : (isBlue ? 'border-[#008ee0]/15' : 'border-[#ff5241]/15')

  const timerWarning = isActiveTeam && timerSecondsRemaining <= 10 && timerSecondsRemaining > 0

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${bg} ${border} ${isActiveTeam ? 'shadow-md' : ''}`}
      style={isActiveTeam ? { boxShadow: `0 0 10px ${isBlue ? 'rgba(0,142,224,0.25)' : 'rgba(255,82,65,0.25)'}` } : {}}>
      {/* Team label + remaining */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="font-display font-bold text-xs uppercase" style={{ color }}>
          {isBlue ? 'Blue' : 'Red'}
        </span>
        <span className="font-display font-black text-lg leading-none" style={{ color }}>
          {remainingCards}
        </span>
      </div>

      {/* Clue */}
      {currentClue && (
        <div className="flex-1 min-w-0 text-center">
          <span className="text-white/80 text-xs font-semibold truncate">
            "{currentClue.word}" × {currentClue.number === 0 ? '∞' : currentClue.number}
          </span>
          {guessesRemaining > 0 && (
            <span className="text-white/35 text-[10px] ml-1">({guessesRemaining} left)</span>
          )}
        </div>
      )}
      {!currentClue && isActiveTeam && (
        <div className="flex-1 text-center">
          <span className="text-white/30 text-xs">Spymaster thinking…</span>
        </div>
      )}
      {!isActiveTeam && <div className="flex-1" />}

      {/* Timer */}
      {isActiveTeam && timerSecondsRemaining > 0 && (
        <span className={`font-mono font-bold text-sm shrink-0 ${timerWarning ? 'text-red-400' : 'text-white/50'}`}>
          {timerSecondsRemaining}s
        </span>
      )}
    </div>
  )
}

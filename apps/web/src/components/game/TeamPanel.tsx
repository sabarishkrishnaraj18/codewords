'use client'
import { motion, AnimatePresence } from 'framer-motion'
import Timer from './Timer'
import type { Clue, Player, Team } from '@/types/game'

interface Props {
  team: Team
  players: Player[]
  remainingCards: number
  currentClue: Clue | null
  isActiveTeam: boolean
  timerSeconds: number
  timerSecondsRemaining: number
  guessesRemaining: number
  myUserId: string
  showCount?: boolean
}

function PlayerAvatar({ player, team, isMe, isActiveTeam }: { player: Player; team: Team; isMe: boolean; isActiveTeam: boolean }) {
  const initials = player.username.slice(0, 2).toUpperCase()
  const isBlue = team === 'blue'
  const ringColor = isBlue ? '#5ba3d4' : '#cd4d3c'
  const avatarGradient = isBlue
    ? 'linear-gradient(135deg, #1e5899 0%, #0d3566 100%)'
    : 'linear-gradient(135deg, #8b2215 0%, #551208 100%)'

  return (
    <div className="flex flex-col items-center gap-1.5 py-2.5 w-full">
      <div className="relative shrink-0">
        <motion.div
          animate={isMe && isActiveTeam
            ? { boxShadow: [`0 0 0 0px ${ringColor}66`, `0 0 0 4px ${ringColor}aa`, `0 0 0 0px ${ringColor}66`] }
            : { boxShadow: 'none' }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl text-white shadow-lg"
          style={{
            background: avatarGradient,
            outline: isMe ? `2px solid ${ringColor}` : 'none',
            outlineOffset: 3,
            opacity: player.connected ? 1 : 0.38,
          }}
        >
          {initials}
        </motion.div>
        {isMe && (
          <div
            className="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full border-2 border-[#0f1520] flex items-center justify-center"
            style={{ background: '#22c55e' }}
          >
            <span className="text-[6px] font-black text-white leading-none">YOU</span>
          </div>
        )}
        {isMe && isActiveTeam && (
          <motion.div
            className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full"
            style={{ background: ringColor }}
            animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0.3, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.1 }}
          />
        )}
      </div>

      <p className={`text-sm font-bold truncate max-w-full px-2 text-center leading-tight ${player.connected ? 'text-white' : 'text-white/35'}`}>
        {player.username}
      </p>

      <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
        player.score > 0
          ? (isBlue ? 'bg-blue-500/25 text-blue-200' : 'bg-red-500/25 text-red-200')
          : player.score < 0
          ? 'bg-red-500/20 text-red-300'
          : 'bg-white/8 text-white/35'
      }`}>
        {player.score > 0 ? `+${player.score}` : player.score} pts
      </div>
    </div>
  )
}

export default function TeamPanel({
  team, players, remainingCards, currentClue, isActiveTeam,
  timerSeconds, timerSecondsRemaining, guessesRemaining, myUserId,
  showCount = false,
}: Props) {
  const isBlue = team === 'blue'
  const spymasters = players.filter(p => p.team === team && p.role === 'spymaster')
  const operatives = players.filter(p => p.team === team && p.role === 'operative')

  const panelGradient = isBlue
    ? 'linear-gradient(180deg, #1a5fa0 0%, #0d3a6b 100%)'
    : 'linear-gradient(180deg, #9e2a1a 0%, #5e140c 100%)'
  const spyBgColor = isBlue ? '#082040' : '#380c08'
  const activeBorderColor = isActiveTeam
    ? (isBlue ? 'rgba(91,163,212,0.75)' : 'rgba(205,77,60,0.75)')
    : (isBlue ? 'rgba(91,163,212,0.18)' : 'rgba(205,77,60,0.18)')
  const countColor = isBlue ? '#52b7ff' : '#ff8370'
  const glowColor = isBlue ? 'rgba(91,163,212,0.55)' : 'rgba(205,77,60,0.55)'
  const teamBarColor = isBlue ? '#5ba3d4' : '#cd4d3c'

  return (
    <motion.div
      animate={isActiveTeam
        ? { boxShadow: [`0 0 0 2px ${activeBorderColor}`, `0 0 20px 6px ${glowColor}`, `0 0 0 2px ${activeBorderColor}`] }
        : { boxShadow: '0 0 0 0px transparent' }}
      transition={{ repeat: Infinity, duration: 2.4 }}
      className="rounded-xl border-2 flex flex-col h-full overflow-hidden"
      style={{ background: panelGradient, borderColor: activeBorderColor }}
    >
      {/* Header: OPERATIVES label (+ optional count) */}
      <div className="pt-3 pb-2 px-3 shrink-0 text-center" style={{ background: 'rgba(0,0,0,0.18)' }}>
        <p className="font-display text-[9px] font-black uppercase tracking-[0.3em] text-white/60 leading-none">
          OPERATIVES
        </p>
        {showCount && (
          <motion.span
            key={remainingCards}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 14 }}
            className="font-display font-black text-5xl leading-none select-none block mt-1"
            style={{ color: countColor, textShadow: `0 0 24px ${glowColor}` }}
          >
            {remainingCards}
          </motion.span>
        )}
      </div>

      {/* Active clue strip */}
      <AnimatePresence>
        {isActiveTeam && currentClue && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className={`text-center px-2 py-1.5 bg-black/40 border-b ${isBlue ? 'border-blue-500/20' : 'border-red-500/20'}`}>
              <span className={`font-display font-bold text-sm ${isBlue ? 'text-blue-200' : 'text-red-200'}`}>
                "{currentClue.word}"
              </span>
              <span className="text-white/60 text-xs ml-1.5">
                × {currentClue.number === 0 ? '∞' : currentClue.number}
              </span>
              {guessesRemaining > 0 && (
                <p className="text-white/30 text-[10px] leading-none mt-0.5">{guessesRemaining} guess{guessesRemaining !== 1 ? 'es' : ''} left</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Operatives list */}
      <div className="flex flex-col px-2 flex-1 min-h-0 overflow-y-auto divide-y divide-white/8">
        <AnimatePresence>
          {operatives.map((p) => (
            <motion.div
              key={p.userId}
              initial={{ opacity: 0, x: isBlue ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
            >
              <PlayerAvatar
                player={p}
                team={team}
                isMe={p.userId === myUserId}
                isActiveTeam={isActiveTeam}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {operatives.length === 0 && (
          <p className="text-white/20 text-[10px] text-center italic py-4">No operatives</p>
        )}
      </div>

      {/* Spymasters */}
      <div className="px-2.5 pt-2 pb-2.5 shrink-0 border-t border-white/10" style={{ background: spyBgColor }}>
        <p className="font-display text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">SPYMASTERS</p>
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {spymasters.map((p) => (
              <motion.div key={p.userId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: isBlue ? '#1b3f6a' : '#6b2018',
                    color: isBlue ? '#5ba3d4' : '#cd4d3c',
                    outline: p.userId === myUserId ? `2px solid ${isBlue ? '#5ba3d4' : '#cd4d3c'}` : 'none',
                    outlineOffset: 1.5,
                    opacity: p.connected ? 1 : 0.35,
                  }}
                >
                  {p.username.slice(0, 2).toUpperCase()}
                </div>
                <p className={`text-xs truncate flex-1 ${p.connected ? 'text-white/70' : 'text-white/22'}`}>
                  {p.username}
                  {p.userId === myUserId && <span className="text-white/30 ml-1 text-[9px]">(you)</span>}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
          {spymasters.length === 0 && <p className="text-white/18 text-[10px] italic">None yet</p>}
        </div>

        {/* Timer bar — active team only */}
        <AnimatePresence>
          {isActiveTeam && timerSeconds > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
              className="mt-2.5"
            >
              <div className="flex justify-center">
                <Timer
                  seconds={timerSecondsRemaining}
                  totalSeconds={timerSeconds}
                  variant="digital"
                  team={team}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

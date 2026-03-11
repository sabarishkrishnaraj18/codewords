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
}

function PlayerAvatar({ player, team, isMe, isActiveTeam }: { player: Player; team: Team; isMe: boolean; isActiveTeam: boolean }) {
  const initials = player.username.slice(0, 2).toUpperCase()
  const isBlue = team === 'blue'
  const ringColor = isBlue ? '#008ee0' : '#ff5241'
  const bgColor = isBlue ? '#004e7a' : '#7a1410'

  return (
    <div className="relative flex items-center gap-2 w-full">
      <div className="relative shrink-0">
        <motion.div
          animate={isMe && isActiveTeam
            ? { boxShadow: [`0 0 0 0px ${ringColor}66`, `0 0 0 3px ${ringColor}aa`, `0 0 0 0px ${ringColor}66`] }
            : { boxShadow: 'none' }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white shadow"
          style={{
            background: bgColor,
            outline: isMe ? `2px solid ${ringColor}` : 'none',
            outlineOffset: 2,
            opacity: player.connected ? 1 : 0.38,
          }}
        >
          {initials}
        </motion.div>
        {isMe && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#16213e] flex items-center justify-center"
            style={{ background: '#22c55e' }}
          >
            <span className="text-[4.5px] font-black text-white leading-none">YOU</span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className={`text-xs font-semibold truncate leading-tight ${player.connected ? 'text-white' : 'text-white/35'}`}>
          {player.username}
        </p>
        <p className={`text-[10px] font-medium leading-tight ${
          player.score > 0 ? (isBlue ? 'text-blue-300' : 'text-red-300') :
          player.score < 0 ? 'text-red-400' : 'text-white/35'
        }`}>
          {player.score > 0 ? `+${player.score}` : player.score} pts
        </p>
      </div>

      {isMe && isActiveTeam && (
        <motion.div
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: ringColor }}
          animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0.3, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.1 }}
        />
      )}
    </div>
  )
}

export default function TeamPanel({
  team, players, remainingCards, currentClue, isActiveTeam,
  timerSeconds, timerSecondsRemaining, guessesRemaining, myUserId,
}: Props) {
  const isBlue = team === 'blue'
  const spymasters = players.filter(p => p.team === team && p.role === 'spymaster')
  const operatives = players.filter(p => p.team === team && p.role === 'operative')

  const headerBg = isBlue ? '#003d5f' : '#5c0f0d'
  const panelBg = isBlue ? 'bg-[#051526]/95' : 'bg-[#200808]/95'
  const activeBorder = isActiveTeam
    ? (isBlue ? 'border-[#008ee0]/70' : 'border-[#ff5241]/70')
    : (isBlue ? 'border-[#008ee0]/15' : 'border-[#ff5241]/15')
  const spyBg = isBlue ? 'bg-[#030e1a]' : 'bg-[#1a0404]'
  const countColor = isBlue ? '#52b7ff' : '#ff8370'
  const glowColor = isBlue ? 'rgba(0,142,224,0.35)' : 'rgba(255,82,65,0.35)'

  return (
    <motion.div
      animate={isActiveTeam
        ? { boxShadow: [`0 0 0 2px ${isBlue ? 'rgba(0,142,224,0.5)' : 'rgba(255,82,65,0.5)'}`, `0 0 18px 4px ${glowColor}`, `0 0 0 2px ${isBlue ? 'rgba(0,142,224,0.5)' : 'rgba(255,82,65,0.5)'}`] }
        : { boxShadow: '0 0 0 0px transparent' }}
      transition={{ repeat: Infinity, duration: 2.4 }}
      className={`rounded-xl border-2 ${activeBorder} ${panelBg} flex flex-col h-full overflow-hidden`}
    >
      {/* Header: team + remaining count */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2.5 shrink-0" style={{ background: headerBg }}>
        <div>
          <p className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 leading-none mb-0.5">OPERATIVES</p>
          <p className={`font-display text-xs font-bold uppercase tracking-wider ${isBlue ? 'text-blue-300' : 'text-red-300'}`}>
            {isBlue ? 'Blue' : 'Red'} Team
          </p>
        </div>
        <motion.span
          key={remainingCards}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 14 }}
          className="font-display font-black text-5xl leading-none select-none"
          style={{ color: countColor, textShadow: `0 0 24px ${glowColor}` }}
        >
          {remainingCards}
        </motion.span>
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
            <div className={`text-center px-2 py-1.5 bg-black/50 border-b ${isBlue ? 'border-blue-500/20' : 'border-red-500/20'}`}>
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
      <div className="flex flex-col gap-2.5 p-2.5 flex-1 min-h-0 overflow-y-auto">
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
          <p className="text-white/20 text-[10px] text-center italic py-1">No operatives</p>
        )}
      </div>

      {/* Timer */}
      <AnimatePresence>
        {isActiveTeam && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
            className="px-2 pb-2 shrink-0"
          >
            <div className="flex items-center justify-center gap-1.5 bg-black/40 rounded-lg py-1.5 border border-white/8">
              <Timer seconds={timerSecondsRemaining} totalSeconds={timerSeconds} compact />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spymasters */}
      <div className={`${spyBg} px-2.5 py-2 shrink-0 border-t border-white/8`}>
        <p className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-white/25 mb-1.5">SPYMASTERS</p>
        <div className="flex flex-col gap-1.5">
          <AnimatePresence>
            {spymasters.map((p) => (
              <motion.div key={p.userId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                  style={{
                    background: isBlue ? '#003d5f' : '#5c0f0d',
                    color: isBlue ? '#52b7ff' : '#ff8370',
                    outline: p.userId === myUserId ? `2px solid ${isBlue ? '#008ee0' : '#ff5241'}` : 'none',
                    outlineOffset: 1.5,
                    opacity: p.connected ? 1 : 0.35,
                  }}
                >
                  {p.username.slice(0, 2).toUpperCase()}
                </div>
                <p className={`text-[11px] truncate ${p.connected ? 'text-white/65' : 'text-white/22'}`}>
                  {p.username}{p.userId === myUserId && <span className="text-white/30 ml-1 text-[9px]">(you)</span>}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
          {spymasters.length === 0 && <p className="text-white/18 text-[10px] italic">None yet</p>}
        </div>
      </div>
    </motion.div>
  )
}

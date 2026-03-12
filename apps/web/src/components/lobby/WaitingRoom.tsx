'use client'
import { motion, AnimatePresence } from 'framer-motion'
import type { Player, Team, Role } from '@/types/game'

interface Props {
  roomCode: string
  players: Player[]
  myUserId: string
  isHost: boolean
  onSetRole: (team: Team, role: Role) => void
  onStart: () => void
  onKick?: (userId: string) => void
  lobbyError?: string
}

// SVG icons — no emojis
const EyeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const CrosshairIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="22" y1="12" x2="18" y2="12"/>
    <line x1="6" y1="12" x2="2" y2="12"/>
    <line x1="12" y1="6" x2="12" y2="2"/>
    <line x1="12" y1="22" x2="12" y2="18"/>
  </svg>
)

const ROLES: { team: Team; role: Role; label: string; desc: string }[] = [
  { team: 'blue', role: 'spymaster', label: 'Blue Spymaster', desc: 'Give clues to your team' },
  { team: 'blue', role: 'operative', label: 'Blue Operative', desc: 'Guess the words' },
  { team: 'red', role: 'spymaster', label: 'Red Spymaster', desc: 'Give clues to your team' },
  { team: 'red', role: 'operative', label: 'Red Operative', desc: 'Guess the words' },
]

export default function WaitingRoom({ roomCode, players, myUserId, isHost, onSetRole, onStart, onKick, lobbyError }: Props) {
  const canStart = players.length >= 2

  return (
    <div className="min-h-screen bg-[#1e1610] flex flex-col items-center justify-center p-6" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, #2a1e0e 0%, #1e1610 60%)' }}>
      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="font-display text-5xl font-bold tracking-wider mb-1">
          <span style={{ color: '#008ee0' }}>CODE</span><span className="text-white">WORDS</span>
        </h1>
        <p className="text-white/40 text-sm">Lobby · {players.length} player{players.length !== 1 ? 's' : ''} joined</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className="w-full max-w-2xl">

        {/* Room code */}
        <div className="text-center mb-6">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Share code to invite</p>
          <div className="inline-flex items-center gap-3 bg-white/8 border border-white/15 rounded-xl px-6 py-3">
            <span className="font-display text-4xl font-bold tracking-[0.3em] text-white">{roomCode}</span>
            <button
              onClick={() => navigator.clipboard.writeText(roomCode)}
              className="text-white/35 hover:text-white/80 transition-colors text-xs font-semibold border border-white/15 rounded-lg px-2 py-1"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Error toast */}
        <AnimatePresence>
          {lobbyError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm text-center"
            >
              {lobbyError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Role picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {ROLES.map((r) => {
            const occupant = players.find((p) => p.team === r.team && p.role === r.role)
            const isMe = occupant?.userId === myUserId
            // For spymaster: block if taken by someone else. Operatives: always clickable.
            const spymasterTakenByOther = r.role === 'spymaster' && !!occupant && !isMe
            const isBlue = r.team === 'blue'

            const base = 'relative rounded-xl p-4 border-2 text-left transition-all'
            const selected = isBlue
              ? 'border-[#008ee0] bg-[#008ee0]/15 shadow-[0_0_16px_rgba(0,142,224,0.2)]'
              : 'border-[#ff5241] bg-[#ff5241]/15 shadow-[0_0_16px_rgba(255,82,65,0.2)]'
            const available = isBlue
              ? 'border-[#008ee0]/25 bg-[#008ee0]/8 hover:border-[#008ee0]/60 cursor-pointer'
              : 'border-[#ff5241]/25 bg-[#ff5241]/8 hover:border-[#ff5241]/60 cursor-pointer'
            const locked = 'border-white/8 bg-white/4 cursor-not-allowed'

            return (
              <motion.button
                key={`${r.team}-${r.role}`}
                whileHover={!spymasterTakenByOther ? { scale: 1.02 } : {}}
                whileTap={!spymasterTakenByOther ? { scale: 0.98 } : {}}
                onClick={() => !spymasterTakenByOther && onSetRole(r.team, r.role)}
                className={`${base} ${isMe ? selected : spymasterTakenByOther ? locked : available}`}
              >
                <div className="flex items-center gap-2.5 mb-1">
                  {/* SVG icon instead of emoji */}
                  {r.role === 'spymaster' ? (
                    <EyeIcon className={`w-5 h-5 shrink-0 ${isBlue ? 'text-[#52b7ff]' : 'text-[#ff8370]'} ${spymasterTakenByOther ? 'opacity-30' : ''}`} />
                  ) : (
                    <CrosshairIcon className={`w-5 h-5 shrink-0 ${isBlue ? 'text-[#52b7ff]' : 'text-[#ff8370]'}`} />
                  )}
                  <span className={`font-bold text-sm ${spymasterTakenByOther ? 'text-white/30' : ''}`} style={{ color: spymasterTakenByOther ? undefined : (isBlue ? '#52b7ff' : '#ff8370') }}>
                    {r.label}
                  </span>
                  {isMe && (
                    <span className="ml-auto text-[10px] bg-white/15 rounded-md px-1.5 py-0.5 text-white/70 font-semibold">YOU</span>
                  )}
                  {spymasterTakenByOther && (
                    <span className="ml-auto text-[10px] bg-white/8 rounded-md px-1.5 py-0.5 text-white/25 font-semibold uppercase tracking-wide">Taken</span>
                  )}
                </div>
                <p className={`text-xs ${spymasterTakenByOther ? 'text-white/20' : 'text-white/40'}`}>{r.desc}</p>
                {occupant && (
                  <p className={`text-xs mt-1 font-medium ${spymasterTakenByOther ? 'text-white/30' : 'text-white/60'}`}>
                    {occupant.username}{isMe ? ' (you)' : ''}
                  </p>
                )}
                {/* Operative slot — show "join" hint if operatives already present */}
                {r.role === 'operative' && !isMe && occupant && (
                  <p className="text-[10px] text-white/25 mt-0.5">+{players.filter(p => p.team === r.team && p.role === 'operative').length} joined</p>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Player list */}
        <div className="bg-white/5 border border-white/8 rounded-xl p-4 mb-5">
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-3">
            Players ({players.length})
          </p>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {players.map((p) => (
                <motion.div
                  key={p.userId}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: p.team === 'blue' ? 'rgba(0,142,224,0.2)' : 'rgba(255,82,65,0.2)',
                    color: p.team === 'blue' ? '#52b7ff' : '#ff8370',
                    outline: p.userId === myUserId ? '1.5px solid rgba(255,255,255,0.3)' : 'none',
                  }}
                >
                  <span>{p.username}</span>
                  <span className="text-[9px] font-bold uppercase opacity-50 tracking-wide">
                    {p.role === 'spymaster' ? 'SPY' : 'OP'}
                  </span>
                  {p.userId === myUserId && (
                    <span className="text-[9px] bg-white/15 rounded px-1 text-white/50">YOU</span>
                  )}
                  {/* Host kick button */}
                  {isHost && p.userId !== myUserId && onKick && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onKick(p.userId) }}
                      className="w-4 h-4 rounded-full bg-white/10 hover:bg-red-500/50 text-white/30 hover:text-white text-[10px] flex items-center justify-center transition-colors ml-0.5 leading-none"
                      title={`Kick ${p.username}`}
                    >
                      ×
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {players.length === 0 && (
              <p className="text-white/20 text-xs italic">Waiting for players…</p>
            )}
          </div>
        </div>

        {/* Start / wait */}
        {isHost ? (
          <motion.button
            whileHover={canStart ? { scale: 1.02 } : {}}
            whileTap={canStart ? { scale: 0.97 } : {}}
            onClick={canStart ? onStart : undefined}
            disabled={!canStart}
            className="w-full py-4 rounded-xl font-display font-bold text-xl uppercase tracking-wider transition-all"
            style={canStart
              ? { background: 'linear-gradient(to bottom, #22c55e, #16a34a)', color: '#fff', boxShadow: '0 4px 24px rgba(34,197,94,0.3)' }
              : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}
          >
            {canStart ? 'Start Game' : 'Waiting for more players…'}
          </motion.button>
        ) : (
          <p className="text-center text-white/30 text-sm">Waiting for host to start…</p>
        )}
      </motion.div>
    </div>
  )
}

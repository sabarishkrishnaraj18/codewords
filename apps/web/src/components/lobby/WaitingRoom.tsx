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
}

const ROLES: { team: Team; role: Role; label: string; icon: string; desc: string }[] = [
  { team: 'blue', role: 'spymaster', label: 'Blue Spymaster', icon: '🕵️', desc: 'Give clues to your team' },
  { team: 'blue', role: 'operative', label: 'Blue Operative', icon: '🔵', desc: 'Guess the words' },
  { team: 'red', role: 'spymaster', label: 'Red Spymaster', icon: '🕵️‍♀️', desc: 'Give clues to your team' },
  { team: 'red', role: 'operative', label: 'Red Operative', icon: '🔴', desc: 'Guess the words' },
]

export default function WaitingRoom({ roomCode, players, myUserId, isHost, onSetRole, onStart }: Props) {
  const canStart = players.length >= 2

  return (
    <div className="min-h-screen bg-[#0f1520] flex flex-col items-center justify-center p-6">
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

        {/* Role picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {ROLES.map((r) => {
            const occupant = players.find((p) => p.team === r.team && p.role === r.role)
            const isMe = occupant?.userId === myUserId
            const isTaken = !!occupant && !isMe
            const isBlue = r.team === 'blue'

            const base = 'relative rounded-xl p-4 border-2 text-left transition-all'
            const selected = isBlue
              ? 'border-[#008ee0] bg-[#008ee0]/15 shadow-[0_0_16px_rgba(0,142,224,0.2)]'
              : 'border-[#ff5241] bg-[#ff5241]/15 shadow-[0_0_16px_rgba(255,82,65,0.2)]'
            const available = isBlue
              ? 'border-[#008ee0]/25 bg-[#008ee0]/8 hover:border-[#008ee0]/60 cursor-pointer'
              : 'border-[#ff5241]/25 bg-[#ff5241]/8 hover:border-[#ff5241]/60 cursor-pointer'
            const taken = 'border-white/8 bg-white/4 opacity-50 cursor-default'

            return (
              <motion.button
                key={`${r.team}-${r.role}`}
                whileHover={!isTaken ? { scale: 1.02 } : {}}
                whileTap={!isTaken ? { scale: 0.98 } : {}}
                onClick={() => !isTaken && onSetRole(r.team, r.role)}
                className={`${base} ${isMe ? selected : isTaken ? taken : available}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{r.icon}</span>
                  <span className="font-bold text-sm" style={{ color: isBlue ? '#52b7ff' : '#ff8370' }}>
                    {r.label}
                  </span>
                  {isMe && (
                    <span className="ml-auto text-[10px] bg-white/15 rounded-md px-1.5 py-0.5 text-white/70 font-semibold">YOU</span>
                  )}
                </div>
                <p className="text-xs text-white/40">{r.desc}</p>
                {occupant && (
                  <p className="text-xs text-white/60 mt-1 font-medium">
                    {occupant.username}{isMe ? ' (you)' : ''}
                  </p>
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
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: p.team === 'blue' ? 'rgba(0,142,224,0.2)' : 'rgba(255,82,65,0.2)',
                    color: p.team === 'blue' ? '#52b7ff' : '#ff8370',
                    outline: p.userId === myUserId ? '1.5px solid rgba(255,255,255,0.3)' : 'none',
                  }}
                >
                  {p.username}{p.role === 'spymaster' ? ' 🕵️' : ''}
                  {p.userId === myUserId && ' ✓'}
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

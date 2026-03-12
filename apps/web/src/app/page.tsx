'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getSocket } from '@/lib/socket-client'
import { useAuth } from '@/contexts/AuthContext'
import { useUserStats } from '@/hooks/useUserStats'

export default function HomePage() {
  const router = useRouter()
  const { user, loading, signOut, updateUsername, isSupabaseEnabled } = useAuth()
  const { stats } = useUserStats(user?.id ?? null, user?.isGuest ?? true)
  const [joinCode, setJoinCode] = useState('')
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home')
  const [timer, setTimer] = useState(90)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')

  useEffect(() => {
    if (user && !user.username) setEditingName(true)
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e1610] flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading…</div>
      </div>
    )
  }

  const userId = user?.id ?? ''
  const username = user?.username ?? ''

  const handleCreate = () => {
    if (!username.trim()) { setError('Set your name first'); return }
    setBusy(true)
    setError('')
    const socket = getSocket()
    const doCreate = () => {
      socket.once('room-created', ({ roomCode }) => router.push(`/lobby/${roomCode}`))
      socket.once('error', ({ message }) => { setError(message); setBusy(false) })
      socket.emit('create-room', { userId, username: username.trim(), wordMode: 'standard', timerSeconds: timer })
    }
    if (socket.connected) { doCreate() }
    else {
      socket.connect()
      socket.once('connect', doCreate)
      socket.once('connect_error', () => { setError('Cannot connect to server. Check your internet connection.'); setBusy(false) })
    }
  }

  const handleJoin = () => {
    if (!username.trim()) { setError('Set your name first'); return }
    if (!joinCode.trim()) { setError('Enter a room code'); return }
    setBusy(true)
    setError('')
    const socket = getSocket()
    const code = joinCode.toUpperCase().trim()
    const doJoin = () => {
      socket.once('room-joined', () => router.push(`/lobby/${code}`))
      socket.once('error', ({ message }) => { setError(message); setBusy(false) })
      socket.emit('join-room', { roomCode: code, userId, username: username.trim() })
    }
    if (socket.connected) { doJoin() }
    else {
      socket.connect()
      socket.once('connect', doJoin)
      socket.once('connect_error', () => { setError('Cannot connect to server. Check your internet connection.'); setBusy(false) })
    }
  }

  const saveName = () => {
    if (nameInput.trim()) {
      updateUsername(nameInput.trim())
      setEditingName(false)
    }
  }

  const isLoggedIn = user && !user.isGuest

  return (
    <div className="min-h-screen bg-[#1e1610] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/5 w-80 h-80 bg-amber-800/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/5 w-80 h-80 bg-amber-900/15 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 z-10">
        <h1 className="font-display text-6xl sm:text-7xl font-bold tracking-wider mb-1">
          <span className="text-[#008ee0]">CODE</span><span className="text-white">WORDS</span>
        </h1>
        <p className="text-white/40 text-sm">Codenames — online multiplayer</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="w-full max-w-sm z-10 flex flex-col gap-3">

        {/* User card */}
        {isLoggedIn ? (
          /* Logged-in: avatar + stats */
          <div className="bg-white/6 border border-white/12 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base shrink-0"
              style={{ background: '#004e7a', color: '#52b7ff' }}
            >
              {username.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{username}</p>
              <p className="text-white/40 text-xs truncate">{user?.email}</p>
            </div>
            {stats && (
              <div className="flex gap-3 text-center shrink-0">
                <div>
                  <p className="text-[#52b7ff] font-bold text-sm leading-none">{stats.totalScore >= 0 ? `+${stats.totalScore}` : stats.totalScore}</p>
                  <p className="text-white/30 text-[9px] uppercase tracking-wide">pts</p>
                </div>
                <div>
                  <p className="text-white/70 font-bold text-sm leading-none">{stats.gamesPlayed}</p>
                  <p className="text-white/30 text-[9px] uppercase tracking-wide">games</p>
                </div>
                <div>
                  <p className="text-green-400 font-bold text-sm leading-none">{stats.wins}</p>
                  <p className="text-white/30 text-[9px] uppercase tracking-wide">wins</p>
                </div>
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="text-white/25 hover:text-white/60 text-xs transition-colors shrink-0 ml-1"
            >
              out
            </button>
          </div>
        ) : isSupabaseEnabled ? (
          /* Guest with Supabase: sign-in prompt */
          <div className="bg-white/6 border border-white/12 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center text-white/30 text-lg shrink-0">
              👤
            </div>
            <div className="flex-1">
              <p className="text-white/70 text-sm font-semibold">Playing as guest</p>
              <p className="text-white/35 text-xs">Sign in to track scores across games</p>
            </div>
            <button
              onClick={() => router.push('/auth')}
              className="px-3 py-1.5 rounded-lg bg-[#008ee0] hover:bg-[#0077c2] text-white text-xs font-bold transition-colors shrink-0"
            >
              Sign in
            </button>
          </div>
        ) : null}

        {/* Name field — guests only */}
        {!isLoggedIn && (
          <div className="flex items-center gap-2 bg-white/8 border border-white/15 rounded-xl px-4 py-3">
            <span className="text-lg shrink-0">👤</span>
            {editingName ? (
              <input
                autoFocus
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveName()}
                onBlur={saveName}
                placeholder="Your name"
                maxLength={20}
                className="flex-1 bg-transparent text-white font-semibold placeholder-white/30 focus:outline-none"
              />
            ) : (
              <button onClick={() => { setNameInput(username); setEditingName(true) }} className="flex-1 text-left">
                {username
                  ? <span className="text-white font-semibold">{username}</span>
                  : <span className="text-white/30 font-semibold">Enter your name…</span>
                }
              </button>
            )}
            {!editingName && (
              <button onClick={() => { setNameInput(username); setEditingName(true) }}
                className="text-white/30 hover:text-white/70 text-xs transition-colors">
                edit
              </button>
            )}
          </div>
        )}

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center">
            {error}
          </motion.p>
        )}

        {/* Mode panels */}
        <AnimatePresence mode="wait">
          {mode === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => { setError(''); setMode('create') }}
                className="w-full py-4 bg-[#008ee0] hover:bg-[#0077c2] active:bg-[#0077c2] text-white font-display font-bold text-xl uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-blue-900/30">
                Create Game
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => { setError(''); setMode('join') }}
                className="w-full py-4 bg-white/10 hover:bg-white/18 active:bg-white/18 text-white font-display font-bold text-xl uppercase tracking-wider rounded-xl transition-colors border border-white/20">
                Join Game
              </motion.button>
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.div key="create" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between text-xs text-white/50 mb-1">
                  <span>Turn timer</span>
                  <span className="font-bold text-white/80">{timer}s</span>
                </div>
                <input type="range" min={30} max={180} step={15} value={timer}
                  onChange={e => setTimer(Number(e.target.value))}
                  className="w-full h-1.5 accent-blue-500 rounded-full" />
                <div className="flex justify-between text-[10px] text-white/30 mt-0.5"><span>30s</span><span>3 min</span></div>
              </div>
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={handleCreate} disabled={busy}
                className="w-full py-4 bg-[#22c55e] hover:bg-[#16a34a] active:bg-[#16a34a] text-white font-display font-bold text-xl uppercase tracking-wider rounded-xl disabled:opacity-50 shadow-lg shadow-green-900/30">
                {busy ? 'Creating…' : 'Create Room'}
              </motion.button>
              <button onClick={() => setMode('home')} className="text-white/30 text-sm hover:text-white/60 transition-colors text-center">← Back</button>
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div key="join" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-3">
              <input
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="ROOM CODE"
                maxLength={6}
                inputMode="text"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white placeholder-white/25 focus:outline-none focus:border-white/50 text-center font-display text-3xl tracking-[0.3em] uppercase"
              />
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={handleJoin} disabled={busy}
                className="w-full py-4 bg-[#008ee0] hover:bg-[#0077c2] active:bg-[#0077c2] text-white font-display font-bold text-xl uppercase tracking-wider rounded-xl disabled:opacity-50">
                {busy ? 'Joining…' : 'Join Room'}
              </motion.button>
              <button onClick={() => setMode('home')} className="text-white/30 text-sm hover:text-white/60 transition-colors text-center">← Back</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

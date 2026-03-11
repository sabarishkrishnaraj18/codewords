'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getSocket } from '@/lib/socket-client'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const router = useRouter()
  const { user, loading, signOut, updateUsername, isSupabaseEnabled } = useAuth()
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
      <div className="min-h-screen bg-[#16213e] flex items-center justify-center">
        <div className="text-white text-opacity-50 text-sm">Loading...</div>
      </div>
    )
  }

  const userId = user?.id ?? ''
  const username = user?.username ?? ''

  const handleCreate = () => {
    if (!username.trim()) { setError('Set your name first'); return }
    setBusy(true)
    const socket = getSocket()
    if (!socket.connected) socket.connect()

    socket.once('room-created', ({ roomCode }) => router.push(`/lobby/${roomCode}`))
    socket.once('error', ({ message }) => { setError(message); setBusy(false) })

    socket.emit('create-room', { userId, username: username.trim(), wordMode: 'standard', timerSeconds: timer })
  }

  const handleJoin = () => {
    if (!username.trim()) { setError('Set your name first'); return }
    if (!joinCode.trim()) { setError('Enter a room code'); return }
    setBusy(true)
    const socket = getSocket()
    if (!socket.connected) socket.connect()

    const code = joinCode.toUpperCase().trim()
    socket.once('room-joined', () => router.push(`/lobby/${code}`))
    socket.once('error', ({ message }) => { setError(message); setBusy(false) })

    socket.emit('join-room', { roomCode: code, userId, username: username.trim() })
  }

  const saveName = () => {
    if (nameInput.trim()) {
      updateUsername(nameInput.trim())
      setEditingName(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#16213e] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/5 w-80 h-80 bg-blue-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/5 w-80 h-80 bg-red-600/8 rounded-full blur-3xl" />
      </div>

      {/* Top-right: auth status */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        {!user?.isGuest && isSupabaseEnabled ? (
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-xs">{user?.email}</span>
            <button onClick={() => signOut()} className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs hover:bg-white/20 transition-colors">
              Sign out
            </button>
          </div>
        ) : isSupabaseEnabled ? (
          <button onClick={() => router.push('/auth')}
            className="px-4 py-1.5 rounded-full bg-[#008ee0]/80 hover:bg-[#0077c2] text-white text-xs font-semibold transition-colors border border-[#008ee0]/50 shadow-md">
            Sign in / Create Account
          </button>
        ) : null}
      </div>

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 z-10">
        <h1 className="font-display text-7xl font-bold tracking-wider mb-1">
          <span className="text-[#008ee0]">CODE</span><span className="text-white">WORDS</span>
        </h1>
        <p className="text-white/40 text-sm">Codenames — online multiplayer</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="w-full max-w-sm z-10">

        {/* Name field */}
        <div className="mb-5">
          <div className="flex items-center gap-2 bg-white/8 border border-white/15 rounded-xl px-4 py-3">
            <span className="text-lg">👤</span>
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
              <button onClick={() => { setNameInput(username); setEditingName(true) }}
                className="flex-1 text-left">
                {username ? (
                  <span className="text-white font-semibold">{username}</span>
                ) : (
                  <span className="text-white/30 font-semibold">Enter your name…</span>
                )}
              </button>
            )}
            {!editingName && (
              <button onClick={() => { setNameInput(username); setEditingName(true) }}
                className="text-white/30 hover:text-white/70 text-xs transition-colors">
                edit
              </button>
            )}
          </div>
        </div>

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm mb-3 text-center">
            {error}
          </motion.p>
        )}

        {/* Mode panels */}
        <AnimatePresence mode="wait">
          {mode === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => { setError(''); setMode('create') }}
                className="w-full py-4 bg-[#008ee0] hover:bg-[#0077c2] text-white font-display font-bold text-xl uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-blue-900/30">
                Create Game
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => { setError(''); setMode('join') }}
                className="w-full py-4 bg-white/10 hover:bg-white/18 text-white font-display font-bold text-xl uppercase tracking-wider rounded-xl transition-colors border border-white/20">
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
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleCreate} disabled={busy}
                className="w-full py-4 bg-[#22c55e] hover:bg-[#16a34a] text-white font-display font-bold text-xl uppercase tracking-wider rounded-xl disabled:opacity-50 shadow-lg shadow-green-900/30">
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
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white placeholder-white/25 focus:outline-none focus:border-white/50 text-center font-display text-3xl tracking-[0.3em] uppercase"
              />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleJoin} disabled={busy}
                className="w-full py-4 bg-[#008ee0] hover:bg-[#0077c2] text-white font-display font-bold text-xl uppercase tracking-wider rounded-xl disabled:opacity-50">
                {busy ? 'Joining…' : 'Join Room'}
              </motion.button>
              <button onClick={() => setMode('home')} className="text-white/30 text-sm hover:text-white/60 transition-colors text-center">← Back</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Sign-in nudge for guests */}
      {(user?.isGuest || !user) && isSupabaseEnabled && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="mt-5 z-10 flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 max-w-sm w-full">
          <div className="flex-1">
            <p className="text-white/70 text-xs font-semibold">Playing as guest</p>
            <p className="text-white/35 text-[11px]">Sign in to track scores across games</p>
          </div>
          <button onClick={() => router.push('/auth')}
            className="px-3 py-1.5 rounded-lg bg-[#008ee0] hover:bg-[#0077c2] text-white text-xs font-semibold transition-colors shrink-0">
            Sign in
          </button>
        </motion.div>
      )}

      {/* Color legend */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="mt-4 flex gap-4 text-[11px] text-white/30 z-10">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#008ee0] inline-block" />Blue</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#ff5241] inline-block" />Red</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#c8a97a] inline-block" />Neutral</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#2d2d2d] border border-gray-600 inline-block" />Assassin</span>
      </motion.div>
    </div>
  )
}

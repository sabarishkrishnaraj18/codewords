'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthPage() {
  const router = useRouter()
  const { signIn, signUp, isSupabaseEnabled } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    if (mode === 'login') {
      const err = await signIn(email, password)
      if (err) { setError(err); setLoading(false); return }
      router.push('/')
    } else {
      if (!username.trim()) { setError('Username is required'); setLoading(false); return }
      const err = await signUp(email, password, username.trim())
      if (err) { setError(err); setLoading(false); return }
      setSuccess('Account created! Check your email to confirm, then sign in.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1e1610] flex items-center justify-center p-6" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, #2a1e0e 0%, #1e1610 60%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl font-bold mb-1">
            <span className="text-[#52b7ff]">CODE</span><span className="text-white">WORDS</span>
          </h1>
          <p className="text-gray-400 text-sm">
            {isSupabaseEnabled ? 'Sign in to keep your score and name' : 'Supabase not configured – guest mode active'}
          </p>
        </div>

        {!isSupabaseEnabled ? (
          <div className="bg-yellow-900/30 border border-yellow-500/40 rounded-xl p-4 text-center">
            <p className="text-yellow-300 text-sm mb-3">
              Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local for full accounts.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-500 transition-colors"
            >
              Play as Guest
            </button>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            {/* Toggle */}
            <div className="flex rounded-lg bg-white/5 p-1 mb-6">
              {(['login', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); setSuccess('') }}
                  className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                    mode === m ? 'bg-[#008ee0] text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green-400 text-sm text-center py-4"
                >
                  {success}
                  <button onClick={() => setMode('login')} className="block mx-auto mt-3 text-[#52b7ff] underline">
                    Sign in now
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key={mode}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-3"
                >
                  {mode === 'signup' && (
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Your display name"
                        maxLength={20}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 mt-2"
                  >
                    {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <button
                onClick={() => router.push('/')}
                className="text-gray-500 text-sm hover:text-gray-300 transition-colors"
              >
                Continue as guest →
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

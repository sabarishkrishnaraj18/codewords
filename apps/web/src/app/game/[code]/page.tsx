'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameState } from '@/hooks/useGameState'
import { useSocket } from '@/hooks/useSocket'
import { useRole } from '@/hooks/useRole'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import GameBoard from '@/components/game/GameBoard'
import TeamPanel from '@/components/game/TeamPanel'
import MobileTeamStrip from '@/components/game/MobileTeamStrip'
import ClueInput from '@/components/game/ClueInput'
import GameLog from '@/components/game/GameLog'
import GameOverModal from '@/components/game/GameOverModal'
import SpymasterKey from '@/components/game/SpymasterKey'
import RulesModal from '@/components/game/RulesModal'

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const roomCode = (params.code as string).toUpperCase()
  const { socket, connected } = useSocket()
  const { state } = useGameState()
  const { user } = useAuth()
  const [showLog, setShowLog] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [scoreSaved, setScoreSaved] = useState(false)

  const userId = user?.id ?? ''
  const myTeam = state.players.find(p => p.userId === userId)?.team

  // Rejoin if needed
  useEffect(() => {
    if (!socket || !userId || !connected) return
    if (!state.roomCode) socket.emit('rejoin-room', { roomCode, userId })
  }, [socket, userId, connected, roomCode, state.roomCode])

  // Navigate all tabs to lobby on reset
  useEffect(() => {
    if (!socket) return
    const handler = () => router.push(`/lobby/${roomCode}`)
    socket.on('game-reset', handler)
    return () => { socket.off('game-reset', handler) }
  }, [socket, roomCode, router])

  // Persist score to Supabase when game ends (logged-in users only)
  useEffect(() => {
    if (!state.gameOverData || scoreSaved || !user || user.isGuest) return
    const supabase = createClient()
    if (!supabase) return
    const myScore = state.gameOverData.scores.find(s => s.userId === userId)
    if (!myScore) return
    const myPlayer = state.players.find(p => p.userId === userId)
    supabase.from('user_game_scores').insert({
      user_id: user.id,
      room_code: roomCode,
      team: myScore.team,
      role: myPlayer?.role ?? 'operative',
      score: myScore.score,
      won: state.gameOverData.winner === myScore.team,
    }).then(() => setScoreSaved(true))
  }, [state.gameOverData, scoreSaved, user, userId, roomCode, state.players])

  const { isSpymaster, canGuess, canGiveClue, canBlindGuess } = useRole(state, userId)

  const handleGuess = (i: number) => socket?.emit('guess-card', { roomCode, userId, cardIndex: i })
  const handleClue = (word: string, number: number) => socket?.emit('give-clue', { roomCode, userId, word, number })
  const handleEndTurn = () => socket?.emit('end-turn', { roomCode, userId })
  const handlePlayAgain = () => { setScoreSaved(false); socket?.emit('reset-game', { roomCode, userId }) }
  const cardWords = state.cards.map(c => c.word)

  const turnColor = state.currentTurn === 'blue' ? 'text-[#52b7ff]' : 'text-[#ff8370]'
  const isMyTurn = myTeam === state.currentTurn && state.status === 'active'

  let headingText = ''
  if (state.status === 'active') {
    if (state.blindGuessPhase) {
      headingText = canBlindGuess ? '★ YOUR BONUS BLIND GUESS!' : `${state.currentTurn.toUpperCase()} TEAM — BONUS BLIND GUESS`
    } else if (!state.currentClue) {
      headingText = isSpymaster && isMyTurn
        ? 'GIVE YOUR OPERATIVES A CLUE'
        : `${state.currentTurn.toUpperCase()} SPYMASTER IS THINKING…`
    } else {
      headingText = canGuess
        ? `GUESS "${state.currentClue.word}" × ${state.currentClue.number === 0 ? '∞' : state.currentClue.number}`
        : `${state.currentTurn.toUpperCase()} TEAM IS GUESSING…`
    }
  }

  return (
    <div className="h-screen bg-[#0f1520] flex flex-col overflow-hidden">
      {/* Top nav — transparent, blends with bg */}
      <header className="flex items-center justify-between px-3 py-2 shrink-0 bg-transparent">
        <div className="flex items-center gap-2">
          <span className="font-display text-lg sm:text-xl font-bold">
            <span className="text-[#5ba3d4]">CODE</span><span className="text-white">WORDS</span>
          </span>
          <span className="text-white/40 text-xs font-mono bg-white/10 border border-white/20 px-2 py-0.5 rounded-md tracking-widest">{roomCode}</span>
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowLog(v => !v)}
            className={`hidden sm:block px-4 py-1 rounded-full text-xs font-semibold transition-colors border ${
              showLog
                ? 'bg-white/15 text-white border-white/30'
                : 'bg-transparent text-white/45 border-white/20 hover:bg-white/8 hover:text-white/70'
            }`}>
            Log
          </button>
          <button onClick={() => setShowRules(true)}
            className="px-4 py-1 rounded-full bg-transparent hover:bg-white/8 text-xs text-white/45 hover:text-white/70 transition-colors border border-white/20 font-semibold">
            Rules
          </button>
          <button onClick={() => router.push('/')}
            className="px-4 py-1 rounded-full bg-transparent hover:bg-white/8 text-xs text-white/45 hover:text-white/70 transition-colors border border-white/20 font-semibold">
            ← Home
          </button>
        </div>
      </header>

      {/* Turn heading — larger, more prominent */}
      {state.status === 'active' && (
        <div className="text-center py-3 px-4 shrink-0">
          <motion.h2
            key={`${state.currentTurn}-${!!state.currentClue}-${state.blindGuessPhase}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`font-display font-black text-2xl sm:text-5xl uppercase tracking-[0.1em] sm:tracking-[0.14em] ${
              state.blindGuessPhase ? 'text-yellow-300' : turnColor
            }`}
          >
            {headingText}
          </motion.h2>
          {isMyTurn && !isSpymaster && canGuess && state.currentClue && !state.blindGuessPhase && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-white/35 text-[11px] mt-0.5 tracking-wide hidden sm:block">
              Click a card to guess · End turn when done
            </motion.p>
          )}
        </div>
      )}
      {state.status === 'lobby' && (
        <div className="text-center py-2">
          <p className="text-white/25 text-sm tracking-wide">Waiting for game to start…</p>
        </div>
      )}

      {/* Mobile team strips */}
      <div className="block md:hidden px-2 pb-1 flex flex-col gap-1 shrink-0">
        <MobileTeamStrip
          team="blue"
          remainingCards={state.remainingBlue}
          currentClue={state.currentTurn === 'blue' ? state.currentClue : null}
          isActiveTeam={state.currentTurn === 'blue' && state.status === 'active'}
          timerSecondsRemaining={state.timerSecondsRemaining}
          guessesRemaining={state.currentTurn === 'blue' ? state.guessesRemaining : 0}
        />
        <MobileTeamStrip
          team="red"
          remainingCards={state.remainingRed}
          currentClue={state.currentTurn === 'red' ? state.currentClue : null}
          isActiveTeam={state.currentTurn === 'red' && state.status === 'active'}
          timerSecondsRemaining={state.timerSecondsRemaining}
          guessesRemaining={state.currentTurn === 'red' ? state.guessesRemaining : 0}
        />
      </div>

      {/* Main content area — [Panel] [Count] [Board] [Count] [Panel] on desktop */}
      <div className="flex-1 flex gap-0 px-2 pb-2 min-h-0 overflow-hidden">

        {/* Blue team panel — desktop only */}
        <div className="hidden md:block w-56 shrink-0 pr-1">
          <TeamPanel
            team="blue"
            players={state.players}
            remainingCards={state.remainingBlue}
            currentClue={state.currentTurn === 'blue' ? state.currentClue : null}
            isActiveTeam={state.currentTurn === 'blue' && state.status === 'active'}
            timerSeconds={state.timerSeconds}
            timerSecondsRemaining={state.timerSecondsRemaining}
            guessesRemaining={state.currentTurn === 'blue' ? state.guessesRemaining : 0}
            myUserId={userId}
          />
        </div>

        {/* Blue count column — desktop only */}
        <div className="hidden md:flex w-16 shrink-0 items-center justify-center overflow-visible">
          <motion.span
            key={state.remainingBlue}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 14 }}
            className="font-display font-black text-7xl leading-none select-none"
            style={{ color: '#52b7ff', textShadow: '0 0 32px rgba(82,183,255,0.6)' }}
          >
            {state.remainingBlue}
          </motion.span>
        </div>

        {/* Center column */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {/* Board */}
          <div className="flex-1 flex items-center justify-center min-h-0">
            <GameBoard
              cards={state.cards}
              isSpymaster={isSpymaster}
              canGuess={canGuess}
              canBlindGuess={canBlindGuess}
              onGuess={handleGuess}
            />
          </div>

          {/* Bottom controls */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            {canGiveClue && <ClueInput onSubmit={handleClue} cardWords={cardWords} />}
            {canGuess && state.guessesRemaining > 0 && !state.blindGuessPhase && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleEndTurn}
                className="px-6 py-2 rounded-full bg-white/8 hover:bg-white/15 active:bg-white/15 text-white/55 hover:text-white/80 text-xs font-semibold border border-white/12 transition-all"
              >
                End Turn
              </motion.button>
            )}
            {isSpymaster && state.cards.length > 0 && (
              <div className="flex justify-center">
                <SpymasterKey cards={state.cards} />
              </div>
            )}
          </div>
        </div>

        {/* Red count column — desktop only */}
        <div className="hidden md:flex w-16 shrink-0 items-center justify-center overflow-visible">
          <motion.span
            key={state.remainingRed}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 14 }}
            className="font-display font-black text-7xl leading-none select-none"
            style={{ color: '#ff8370', textShadow: '0 0 32px rgba(255,131,112,0.6)' }}
          >
            {state.remainingRed}
          </motion.span>
        </div>

        {/* Red team panel — desktop only */}
        <div className="hidden md:block w-56 shrink-0 pl-1">
          <TeamPanel
            team="red"
            players={state.players}
            remainingCards={state.remainingRed}
            currentClue={state.currentTurn === 'red' ? state.currentClue : null}
            isActiveTeam={state.currentTurn === 'red' && state.status === 'active'}
            timerSeconds={state.timerSeconds}
            timerSecondsRemaining={state.timerSecondsRemaining}
            guessesRemaining={state.currentTurn === 'red' ? state.guessesRemaining : 0}
            myUserId={userId}
          />
        </div>

        {/* Collapsible game log — desktop only */}
        <AnimatePresence>
          {showLog && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 180, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden sm:block shrink-0 bg-[#0a1525]/80 border border-white/8 rounded-xl overflow-hidden"
            >
              <GameLog events={state.events} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rules modal */}
      <AnimatePresence>
        {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      </AnimatePresence>

      {/* Game over modal */}
      <AnimatePresence>
        {state.gameOverData && (
          <GameOverModal
            winner={state.gameOverData.winner}
            scores={state.gameOverData.scores}
            onPlayAgain={handlePlayAgain}
            onHome={() => router.push('/')}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

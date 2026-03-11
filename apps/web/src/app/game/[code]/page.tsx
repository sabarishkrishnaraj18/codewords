'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameState } from '@/hooks/useGameState'
import { useSocket } from '@/hooks/useSocket'
import { useRole } from '@/hooks/useRole'
import { useAuth } from '@/contexts/AuthContext'
import GameBoard from '@/components/game/GameBoard'
import TeamPanel from '@/components/game/TeamPanel'
import ClueInput from '@/components/game/ClueInput'
import GameLog from '@/components/game/GameLog'
import GameOverModal from '@/components/game/GameOverModal'
import SpymasterKey from '@/components/game/SpymasterKey'

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const roomCode = (params.code as string).toUpperCase()
  const { socket, connected } = useSocket()
  const { state } = useGameState()
  const { user } = useAuth()
  const [showLog, setShowLog] = useState(false)

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

  const { isSpymaster, canGuess, canGiveClue, canBlindGuess } = useRole(state, userId)

  const handleGuess = (i: number) => socket?.emit('guess-card', { roomCode, userId, cardIndex: i })
  const handleClue = (word: string, number: number) => socket?.emit('give-clue', { roomCode, userId, word, number })
  const handleEndTurn = () => socket?.emit('end-turn', { roomCode, userId })
  const handlePlayAgain = () => socket?.emit('reset-game', { roomCode, userId })
  const cardWords = state.cards.map(c => c.word)

  // Turn heading state
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
    <div className="h-screen bg-[#16213e] flex flex-col overflow-hidden">
      {/* Top nav */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-white/8 shrink-0 bg-[#111d30]">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-bold">
            <span className="text-[#5090c8]">CODE</span><span className="text-white">WORDS</span>
          </span>
          <span className="text-white/25 text-xs font-mono bg-white/5 px-2 py-0.5 rounded-md tracking-widest">{roomCode}</span>
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowLog(v => !v)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${
              showLog
                ? 'bg-white/15 text-white border-white/25'
                : 'bg-transparent text-white/40 border-white/10 hover:bg-white/8 hover:text-white/70'
            }`}>
            Game Log
          </button>
          <button onClick={() => router.push('/')}
            className="px-3 py-1 rounded-lg bg-transparent hover:bg-white/8 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10">
            ← Home
          </button>
        </div>
      </header>

      {/* Turn heading */}
      {state.status === 'active' && (
        <div className="text-center py-2.5 px-4 shrink-0">
          <motion.h2
            key={`${state.currentTurn}-${!!state.currentClue}-${state.blindGuessPhase}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`font-display font-bold text-xl uppercase tracking-[0.15em] ${
              state.blindGuessPhase ? 'text-yellow-300' : turnColor
            }`}
          >
            {headingText}
          </motion.h2>
          {isMyTurn && !isSpymaster && canGuess && state.currentClue && !state.blindGuessPhase && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white/35 text-xs mt-0.5 tracking-wide"
            >
              Click a card to guess · End turn when done
            </motion.p>
          )}
        </div>
      )}
      {state.status === 'lobby' && (
        <div className="text-center py-2.5">
          <p className="text-white/25 text-sm tracking-wide">Waiting for game to start…</p>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex gap-2 px-2 pb-2 min-h-0 overflow-hidden">
        {/* Blue team panel */}
        <div className="w-44 shrink-0">
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
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleEndTurn}
                className="px-6 py-1.5 rounded-full bg-white/8 hover:bg-white/15 text-white/55 hover:text-white/80 text-xs font-semibold border border-white/12 transition-all"
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

        {/* Red team panel */}
        <div className="w-44 shrink-0">
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

        {/* Collapsible game log */}
        <AnimatePresence>
          {showLog && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 180, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 bg-[#0a1525]/80 border border-white/8 rounded-xl overflow-hidden"
            >
              <GameLog events={state.events} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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

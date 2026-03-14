'use client'
import { useMemo } from 'react'
import type { ClientGameState } from '@/store/gameReducer'

export function useRole(state: ClientGameState, userId: string) {
  return useMemo(() => {
    const player = state.players.find((p) => p.userId === userId)
    const isSpymaster = player?.role === 'spymaster'
    const isOperative = player?.role === 'operative'
    const isSpectator = player?.role === 'spectator' || !player
    const myTeam = player?.team ?? null
    const isMyTurn = myTeam === state.currentTurn && state.status === 'active'
    const canGuess =
      isOperative &&
      isMyTurn &&
      !!state.currentClue &&
      state.guessesRemaining > 0 &&
      !state.blindGuessPhase
    const canGiveClue =
      isSpymaster &&
      isMyTurn &&
      !state.currentClue &&
      !state.blindGuessPhase
    const canBlindGuess =
      isOperative &&
      isMyTurn &&
      state.blindGuessPhase

    return {
      player,
      isSpymaster,
      isOperative,
      isSpectator,
      myTeam,
      isMyTurn,
      canGuess,
      canGiveClue,
      canBlindGuess,
    }
  }, [state, userId])
}

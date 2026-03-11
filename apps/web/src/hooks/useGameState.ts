'use client'
import { useEffect, useReducer } from 'react'
import { getSocket } from '@/lib/socket-client'
import { gameReducer, initialClientGameState } from '@/store/gameReducer'
import type { GameState } from '@/types/game'

export function useGameState(initialState?: GameState) {
  const [state, dispatch] = useReducer(
    gameReducer,
    initialState
      ? { ...initialClientGameState, ...initialState, timerSecondsRemaining: initialState.timerSeconds }
      : initialClientGameState
  )

  useEffect(() => {
    const socket = getSocket()

    socket.on('room-joined', ({ gameState }) => {
      dispatch({ type: 'INIT_STATE', payload: gameState })
    })

    socket.on('room-created', ({ gameState }) => {
      dispatch({ type: 'INIT_STATE', payload: gameState })
    })

    socket.on('game-started', ({ gameState }) => {
      dispatch({ type: 'GAME_STARTED', payload: gameState })
    })

    socket.on('player-joined', ({ player }) => {
      dispatch({ type: 'PLAYER_JOINED', payload: { player } })
    })

    socket.on('player-left', ({ userId }) => {
      dispatch({ type: 'PLAYER_LEFT', payload: { userId } })
    })

    socket.on('role-updated', ({ userId, team, role }) => {
      dispatch({ type: 'ROLE_UPDATED', payload: { userId, team, role } })
    })

    socket.on('clue-given', ({ clue, team }) => {
      dispatch({ type: 'CLUE_GIVEN', payload: { clue, team } })
    })

    socket.on('card-revealed', ({ card, revealedBy }) => {
      dispatch({ type: 'CARD_REVEALED', payload: { card, revealedBy } })
    })

    socket.on('turn-changed', ({ turn, remainingBlue, remainingRed }) => {
      dispatch({ type: 'TURN_CHANGED', payload: { turn, remainingBlue, remainingRed } })
    })

    socket.on('timer-tick', ({ secondsRemaining }) => {
      dispatch({ type: 'TIMER_TICK', payload: { secondsRemaining } })
    })

    socket.on('blind-guess-phase', ({ eligiblePlayers }) => {
      dispatch({ type: 'BLIND_GUESS_PHASE', payload: { eligiblePlayers } })
    })

    socket.on('blind-guess-result', (payload) => {
      dispatch({ type: 'BLIND_GUESS_RESULT', payload })
    })

    socket.on('score-updated', ({ userId, score }) => {
      dispatch({ type: 'SCORE_UPDATED', payload: { userId, score } })
    })

    socket.on('game-over', (payload) => {
      dispatch({ type: 'GAME_OVER', payload })
    })

    socket.on('game-reset', ({ gameState }) => {
      dispatch({ type: 'GAME_RESET', payload: gameState })
    })

    socket.on('game-event', (event) => {
      dispatch({ type: 'ADD_EVENT', payload: event })
    })

    return () => {
      socket.off('room-joined')
      socket.off('room-created')
      socket.off('game-started')
      socket.off('player-joined')
      socket.off('player-left')
      socket.off('role-updated')
      socket.off('clue-given')
      socket.off('card-revealed')
      socket.off('turn-changed')
      socket.off('timer-tick')
      socket.off('blind-guess-phase')
      socket.off('blind-guess-result')
      socket.off('score-updated')
      socket.off('game-over')
      socket.off('game-reset')
      socket.off('game-event')
    }
  }, [])

  return { state, dispatch }
}

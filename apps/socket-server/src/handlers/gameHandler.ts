import type { Socket, Server } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import {
  advanceTurn,
  applyBlindGuess,
  applyGuess,
  checkWin,
  dealCards,
  maskStateForOperatives,
} from '../gameEngine'
import { getRoom, updateGameState } from '../roomManager'
import { startTimer, stopTimer } from '../timerManager'
import type { Team } from '../types'

function broadcastState(io: Server, roomCode: string): void {
  const room = getRoom(roomCode)
  if (!room) return
  room.gameState.players.forEach((player) => {
    if (!player.socketId) return
    const stateToSend =
      player.role === 'spymaster' ? room.gameState : maskStateForOperatives(room.gameState)
    io.to(player.socketId).emit('game-started', { gameState: stateToSend })
  })
}

export function registerGameHandlers(io: Server, socket: Socket): void {
  socket.on('start-game', ({ roomCode, userId }) => {
    const code = roomCode.toUpperCase()
    const room = getRoom(code)
    if (!room) return
    if (room.hostUserId !== userId) {
      socket.emit('error', { code: 'NOT_HOST', message: 'Only the host can start the game' })
      return
    }

    const cards = dealCards(undefined, room.gameState.wordMode)
    const remainingBlue = cards.filter((c) => c.color === 'blue').length
    const remainingRed = cards.filter((c) => c.color === 'red').length

    const newState = {
      ...room.gameState,
      status: 'active' as const,
      cards,
      remainingBlue,
      remainingRed,
      currentTurn: 'blue' as Team,
      currentClue: null,
      guessesRemaining: 0,
      correctGuessesThisTurn: 0,
      blindGuessPhase: false,
    }
    updateGameState(code, newState)

    room.gameState.players.forEach((player) => {
      if (!player.socketId) return
      const stateToSend = player.role === 'spymaster' ? newState : maskStateForOperatives(newState)
      io.to(player.socketId).emit('game-started', { gameState: stateToSend })
    })

    startTimer(io, code, newState.timerSeconds, () => handleTimerExpiry(io, code))
  })

  socket.on('give-clue', ({ roomCode, userId, word, number }) => {
    const code = roomCode.toUpperCase()
    const room = getRoom(code)
    if (!room) return

    const player = room.gameState.players.find((p) => p.userId === userId)
    if (!player || player.role !== 'spymaster' || player.team !== room.gameState.currentTurn) {
      socket.emit('error', { code: 'NOT_YOUR_TURN', message: 'Not your turn to give a clue' })
      return
    }

    const clue = { word: word.toUpperCase(), number }
    const guessesRemaining = number === 0 ? 99 : number + 1 // +1 for bonus blind guess
    const newState = {
      ...room.gameState,
      currentClue: clue,
      guessesRemaining,
      correctGuessesThisTurn: 0,
      blindGuessPhase: false,
    }
    updateGameState(code, newState)

    io.to(code).emit('clue-given', { clue, team: room.gameState.currentTurn })
    io.to(code).emit('game-event', {
      id: uuidv4(),
      type: 'clue_given',
      actorId: userId,
      actorUsername: player.username,
      team: player.team,
      payload: { word: clue.word, number: clue.number },
      timestamp: Date.now(),
    })

    stopTimer(code)
    startTimer(io, code, newState.timerSeconds, () => handleTimerExpiry(io, code))
  })

  socket.on('guess-card', ({ roomCode, userId, cardIndex }) => {
    const code = roomCode.toUpperCase()
    const room = getRoom(code)
    if (!room) return

    const player = room.gameState.players.find((p) => p.userId === userId)
    if (!player || player.role !== 'operative' || player.team !== room.gameState.currentTurn) {
      socket.emit('error', { code: 'NOT_YOUR_TURN', message: 'Not your turn to guess' })
      return
    }

    if (!room.gameState.currentClue) {
      socket.emit('error', { code: 'NO_CLUE', message: 'Waiting for spymaster clue' })
      return
    }

    if (room.gameState.guessesRemaining <= 0) {
      socket.emit('error', { code: 'NO_GUESSES', message: 'No guesses remaining' })
      return
    }

    const card = room.gameState.cards[cardIndex]
    if (!card || card.revealed) return

    try {
      // ── BLIND BONUS GUESS ──────────────────────────────────────────────────
      if (room.gameState.blindGuessPhase) {
        const { newState, scoreDelta } = applyBlindGuess(room.gameState, cardIndex, userId)
        updateGameState(code, newState)

        const revealedCard = newState.cards[cardIndex]
        io.to(code).emit('card-revealed', {
          card: revealedCard,
          revealedBy: userId,
          isBlindGuess: true,
          scoreDelta,
        })
        io.to(code).emit('blind-guess-result', {
          cardIndex,
          color: card.color,
          playerId: userId,
          playerUsername: player.username,
          scoreDelta,
        })
        io.to(code).emit('score-updated', {
          userId,
          score: newState.players.find((p) => p.userId === userId)?.score ?? 0,
        })
        io.to(code).emit('game-event', {
          id: uuidv4(),
          type: 'blind_guess',
          actorId: userId,
          actorUsername: player.username,
          team: player.team,
          payload: { word: card.word, color: card.color, scoreDelta },
          timestamp: Date.now(),
        })

        // End turn after blind guess
        endTurn(io, code, newState)
        return
      }

      // ── REGULAR GUESS ──────────────────────────────────────────────────────
      const { newState, result } = applyGuess(room.gameState, cardIndex, userId)
      updateGameState(code, newState)

      const revealedCard = newState.cards[cardIndex]
      io.to(code).emit('card-revealed', { card: revealedCard, revealedBy: userId })
      io.to(code).emit('game-event', {
        id: uuidv4(),
        type: 'card_revealed',
        actorId: userId,
        actorUsername: player.username,
        team: player.team,
        payload: { word: revealedCard.word, color: revealedCard.color, result },
        timestamp: Date.now(),
      })

      // Check win
      const winner = checkWin(newState)
      if (winner || result === 'assassin') {
        stopTimer(code)
        const actualWinner = winner || (newState.currentTurn === 'blue' ? 'red' : 'blue')
        const finishedState = { ...newState, status: 'finished' as const, winner: actualWinner }
        updateGameState(code, finishedState)
        const scores = finishedState.players.map((p) => ({
          userId: p.userId,
          username: p.username,
          team: p.team,
          score: p.score,
        }))
        io.to(code).emit('game-over', { winner: actualWinner, scores })
        return
      }

      // Check if blind bonus guess should be activated
      const clue = newState.currentClue!
      const allClueGuessed =
        result === 'correct' &&
        clue.number > 0 &&
        newState.correctGuessesThisTurn >= clue.number &&
        newState.guessesRemaining === 1

      if (allClueGuessed) {
        const blindState = { ...newState, blindGuessPhase: true }
        updateGameState(code, blindState)
        io.to(code).emit('blind-guess-phase', { eligiblePlayers: [] })
      } else if (result !== 'correct' || newState.guessesRemaining <= 0) {
        endTurn(io, code, newState)
      }
    } catch (err) {
      console.error(err)
    }
  })

  socket.on('end-turn', ({ roomCode, userId }) => {
    const code = roomCode.toUpperCase()
    const room = getRoom(code)
    if (!room) return

    const player = room.gameState.players.find((p) => p.userId === userId)
    if (!player || player.team !== room.gameState.currentTurn) return

    endTurn(io, code, room.gameState)
  })

  socket.on('reset-game', ({ roomCode }) => {
    const code = roomCode.toUpperCase()
    const room = getRoom(code)
    if (!room) return

    stopTimer(code)
    const lobbyState = {
      ...room.gameState,
      status: 'lobby' as const,
      cards: [],
      currentClue: null,
      guessesRemaining: 0,
      correctGuessesThisTurn: 0,
      blindGuessPhase: false,
      winner: null,
      players: room.gameState.players.map((p) => ({ ...p, score: 0 })),
    }
    updateGameState(code, lobbyState)
    io.to(code).emit('game-reset', { gameState: lobbyState })
  })
}

function endTurn(io: Server, roomCode: string, state: import('../types').GameState): void {
  const newState = advanceTurn(state)
  updateGameState(roomCode, newState)

  io.to(roomCode).emit('turn-changed', {
    turn: newState.currentTurn,
    remainingBlue: newState.remainingBlue,
    remainingRed: newState.remainingRed,
  })
  io.to(roomCode).emit('game-event', {
    id: uuidv4(),
    type: 'turn_end',
    payload: { nextTurn: newState.currentTurn },
    timestamp: Date.now(),
  })

  stopTimer(roomCode)
  startTimer(io, roomCode, newState.timerSeconds, () => handleTimerExpiry(io, roomCode))
}

function handleTimerExpiry(io: Server, roomCode: string): void {
  const room = getRoom(roomCode)
  if (!room || room.gameState.status !== 'active') return

  io.to(roomCode).emit('timer-expired')
  endTurn(io, roomCode, room.gameState)
}

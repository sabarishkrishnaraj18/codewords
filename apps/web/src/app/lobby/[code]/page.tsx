'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import WaitingRoom from '@/components/lobby/WaitingRoom'
import { useGameState } from '@/hooks/useGameState'
import { useSocket } from '@/hooks/useSocket'
import { useAuth } from '@/contexts/AuthContext'
import type { Role, Team } from '@/types/game'

export default function LobbyPage() {
  const params = useParams()
  const router = useRouter()
  const roomCode = (params.code as string).toUpperCase()
  const { socket, connected } = useSocket()
  const { state, dispatch } = useGameState()
  const { user, loading } = useAuth()
  const [joined, setJoined] = useState(false)
  const [lobbyError, setLobbyError] = useState('')

  // Save last room for rejoin
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('codewords_last_room', roomCode)
  }, [roomCode])

  useEffect(() => {
    if (!socket || !user || !connected || joined || loading) return
    if (state.roomCode === roomCode) { setJoined(true); return }

    socket.emit('join-room', { roomCode, userId: user.id, username: user.username || 'Player' })
    setJoined(true)
  }, [socket, user, connected, roomCode, state.roomCode, joined, loading])

  useEffect(() => {
    if (state.status === 'active') router.push(`/game/${roomCode}`)
  }, [state.status, roomCode, router])

  // Handle error events (e.g. SLOT_TAKEN)
  useEffect(() => {
    if (!socket) return
    const handler = ({ message }: { code: string; message: string }) => {
      setLobbyError(message)
      setTimeout(() => setLobbyError(''), 3000)
    }
    socket.on('error', handler)
    return () => { socket.off('error', handler) }
  }, [socket])

  // Handle kick events
  useEffect(() => {
    if (!socket) return
    const handler = ({ userId }: { userId: string }) => {
      if (userId === user?.id) {
        localStorage.removeItem('codewords_last_room')
        router.push('/')
      } else {
        dispatch({ type: 'PLAYER_LEFT', payload: { userId } })
      }
    }
    socket.on('player-kicked', handler)
    return () => { socket.off('player-kicked', handler) }
  }, [socket, user?.id, router, dispatch])

  const userId = user?.id ?? ''

  const handleSetRole = (team: Team, role: Role) => {
    if (!socket) return
    socket.emit('set-role', { roomCode, userId, team, role })
  }

  const handleStart = () => {
    if (!socket) return
    socket.emit('start-game', { roomCode, userId })
  }

  const handleKick = useCallback((targetUserId: string) => {
    if (!socket) return
    socket.emit('kick-player', { roomCode, hostUserId: userId, targetUserId })
  }, [socket, roomCode, userId])

  const isHost = state.players.length > 0 && state.players[0]?.userId === userId

  return (
    <WaitingRoom
      roomCode={roomCode}
      players={state.players}
      myUserId={userId}
      isHost={isHost}
      onSetRole={handleSetRole}
      onStart={handleStart}
      onKick={handleKick}
      lobbyError={lobbyError}
    />
  )
}

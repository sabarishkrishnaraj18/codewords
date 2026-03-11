'use client'
import { useEffect, useState } from 'react'
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
  const { state } = useGameState()
  const { user, loading } = useAuth()
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    if (!socket || !user || !connected || joined || loading) return
    if (state.roomCode === roomCode) { setJoined(true); return }

    socket.emit('join-room', { roomCode, userId: user.id, username: user.username || 'Player' })
    setJoined(true)
  }, [socket, user, connected, roomCode, state.roomCode, joined, loading])

  useEffect(() => {
    if (state.status === 'active') router.push(`/game/${roomCode}`)
  }, [state.status, roomCode, router])

  const userId = user?.id ?? ''

  const handleSetRole = (team: Team, role: Role) => {
    if (!socket) return
    socket.emit('set-role', { roomCode, userId, team, role })
  }

  const handleStart = () => {
    if (!socket) return
    socket.emit('start-game', { roomCode, userId })
  }

  const isHost = state.players.length > 0 && state.players[0]?.userId === userId

  return (
    <WaitingRoom
      roomCode={roomCode}
      players={state.players}
      myUserId={userId}
      isHost={isHost}
      onSetRole={handleSetRole}
      onStart={handleStart}
    />
  )
}

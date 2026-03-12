'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserStats {
  totalScore: number
  gamesPlayed: number
  wins: number
}

export function useUserStats(userId: string | null, isGuest: boolean) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId || isGuest) { setStats(null); return }
    const supabase = createClient()
    if (!supabase) return

    setLoading(true)
    supabase
      .from('user_game_scores')
      .select('score, won')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) {
          setStats({
            totalScore: data.reduce((sum, r) => sum + (r.score ?? 0), 0),
            gamesPlayed: data.length,
            wins: data.filter(r => r.won).length,
          })
        }
        setLoading(false)
      })
  }, [userId, isGuest])

  return { stats, loading }
}

'use client'
import { createBrowserClient } from '@supabase/ssr'

function getConfig(): { url: string; key: string } | null {
  // Layer 1: Build-time baked vars (local dev via .env.local)
  const bUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const bKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (bUrl && bKey) return { url: bUrl, key: bKey }

  // Layer 2: Window globals injected by server layout (production — runs before React bundle)
  if (typeof window !== 'undefined') {
    const w = window as unknown as Record<string, string>
    if (w.__CW_SUPA_URL__ && w.__CW_SUPA_KEY__) {
      return { url: w.__CW_SUPA_URL__, key: w.__CW_SUPA_KEY__ }
    }
  }

  return null
}

const config = getConfig()
export let isSupabaseConfigured = !!config

let _client: ReturnType<typeof createBrowserClient> | null = config
  ? createBrowserClient(config.url, config.key)
  : null

export function initSupabaseFromConfig(url: string, key: string) {
  if (!url || !key) return
  isSupabaseConfigured = true
  _client = createBrowserClient(url, key)
}

export function createClient() {
  return _client
}

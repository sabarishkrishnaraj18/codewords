'use client'
import { createBrowserClient } from '@supabase/ssr'

const buildTimeUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const buildTimeKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export let isSupabaseConfigured = !!(buildTimeUrl && buildTimeKey)

let _client: ReturnType<typeof createBrowserClient> | null = null
if (buildTimeUrl && buildTimeKey) {
  _client = createBrowserClient(buildTimeUrl, buildTimeKey)
}

export function initSupabaseFromConfig(url: string, key: string) {
  if (!url || !key) return
  isSupabaseConfigured = true
  _client = createBrowserClient(url, key)
}

export function createClient() {
  return _client
}

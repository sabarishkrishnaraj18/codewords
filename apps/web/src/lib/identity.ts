/**
 * Identity management.
 * - Each browser tab gets its own session ID (via sessionStorage) so two tabs = two players.
 * - Username is persisted in localStorage so it survives page refresh within a tab.
 * - If Supabase auth is configured, the Supabase user ID is used instead.
 */

export function getGuestUserId(): string {
  if (typeof window === 'undefined') return ''
  // sessionStorage: each tab gets a unique ID
  let id = sessionStorage.getItem('codewords_sessionId')
  if (!id) {
    id = `guest_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`
    sessionStorage.setItem('codewords_sessionId', id)
  }
  return id
}

export function getSavedUsername(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('codewords_username') || ''
}

export function saveUsername(name: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('codewords_username', name)
}

/** Call this when using Supabase auth to override the guest ID */
export function setAuthUserId(userId: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem('codewords_sessionId', userId)
}

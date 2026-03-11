'use client'
import { useState, useCallback, useRef } from 'react'

interface Definition {
  word: string
  phonetic?: string
  meanings: Array<{
    partOfSpeech: string
    definition: string
    example?: string
  }>
}

export function useWordDefinition() {
  const [definition, setDefinition] = useState<Definition | null>(null)
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const cache = useRef<Record<string, Definition>>({})

  const lookup = useCallback(async (word: string) => {
    const key = word.toLowerCase()
    if (cache.current[key]) {
      setDefinition(cache.current[key])
      setVisible(true)
      return
    }
    setLoading(true)
    setVisible(true)
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${key}`)
      if (!res.ok) throw new Error('Not found')
      const data = await res.json()
      const entry = data[0]
      const result: Definition = {
        word: entry.word,
        phonetic: entry.phonetic,
        meanings: (entry.meanings || []).slice(0, 2).map((m: { partOfSpeech: string; definitions: Array<{ definition: string; example?: string }> }) => ({
          partOfSpeech: m.partOfSpeech,
          definition: m.definitions?.[0]?.definition || '',
          example: m.definitions?.[0]?.example,
        })),
      }
      cache.current[key] = result
      setDefinition(result)
    } catch {
      setDefinition({
        word,
        meanings: [{ partOfSpeech: '', definition: 'No definition found for this word.' }],
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const dismiss = useCallback(() => {
    setVisible(false)
    setDefinition(null)
  }, [])

  return { definition, loading, visible, lookup, dismiss }
}

/** Returns event handlers for long-press (mobile) and right-click (desktop) */
export function useLongPress(onLongPress: () => void, ms = 500) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const start = useCallback(() => {
    timer.current = setTimeout(onLongPress, ms)
  }, [onLongPress, ms])

  const cancel = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel,
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault()
      onLongPress()
    },
  }
}

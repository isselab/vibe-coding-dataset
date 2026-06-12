import { useState, useEffect, useRef, useCallback } from 'react'

const IGNORED_KEYS = new Set(['Control', 'Alt', 'Shift', 'Meta', 'CapsLock', 'Tab'])

export function formatKey(key: string): string {
  if (key === ' ') return 'Space'
  if (key === 'ArrowUp') return '↑'
  if (key === 'ArrowDown') return '↓'
  if (key === 'ArrowLeft') return '←'
  if (key === 'ArrowRight') return '→'
  if (key === 'Enter') return '↵'
  if (key.length === 1) return key.toUpperCase()
  return key
}

export function useKeyBinding(onTrigger: () => void) {
  const [boundKey, setBoundKey] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const onTriggerRef = useRef(onTrigger)

  useEffect(() => {
    onTriggerRef.current = onTrigger
  }, [onTrigger])

  // Capture the next key press when in listening mode
  useEffect(() => {
    if (!isListening) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsListening(false); return }
      if (IGNORED_KEYS.has(e.key)) return
      e.preventDefault()
      setBoundKey(e.key)
      setIsListening(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isListening])

  // Fire the current primary action when the bound key is pressed
  useEffect(() => {
    if (!boundKey) return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== boundKey) return
      if ((document.activeElement as HTMLElement | null)?.tagName === 'INPUT') return
      e.preventDefault()
      onTriggerRef.current()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [boundKey])

  const startListening = useCallback(() => setIsListening(true), [])
  const clearBinding = useCallback(() => setBoundKey(null), [])

  return { boundKey, isListening, startListening, clearBinding }
}

import { useState } from 'react'

export function useStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  const set = (newValue) => {
    const toStore = typeof newValue === 'function' ? newValue(value) : newValue
    setValue(toStore)
    localStorage.setItem(key, JSON.stringify(toStore))
  }

  return [value, set]
}

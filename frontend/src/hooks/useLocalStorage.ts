import { useState } from 'react'

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initial
    } catch {
      return initial
    }
  })

  const set = (val: T) => {
    setValue(val)
    try { window.localStorage.setItem(key, JSON.stringify(val)) } catch { /* ignore */ }
  }

  const remove = () => {
    setValue(initial)
    try { window.localStorage.removeItem(key) } catch { /* ignore */ }
  }

  return [value, set, remove] as const
}

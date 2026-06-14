import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDark: boolean
  toggle: () => void
  setDark: (val: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggle: () => set((s) => {
        const next = !s.isDark
        document.documentElement.classList.toggle('dark', next)
        return { isDark: next }
      }),
      setDark: (val) => set(() => {
        document.documentElement.classList.toggle('dark', val)
        return { isDark: val }
      }),
    }),
    { name: 'placement-theme' }
  )
)

'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const saved = localStorage.getItem('univup-theme')
    if (saved === 'light' || saved === 'dark') setTheme(saved)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('univup-theme', next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

// Palettes de couleurs
export const darkTheme = {
  bg: '#0e0d0d',
  surface: '#111010',
  surface2: '#1a1919',
  border: 'rgba(255,255,255,0.05)',
  border2: 'rgba(255,255,255,0.1)',
  text: '#f0eeea',
  muted: '#4a4847',
  muted2: '#6e6c66',
  purple: '#9b8ec4',
  teal: '#34d399',
  blue: '#60a5fa',
  amber: '#fbbf24',
  coral: '#f87171',
}

export const lightTheme = {
  bg: '#f5f4f0',
  surface: '#ffffff',
  surface2: '#f0eeea',
  border: 'rgba(0,0,0,0.06)',
  border2: 'rgba(0,0,0,0.12)',
  text: '#111010',
  muted: '#9e9c96',
  muted2: '#6e6c66',
  purple: '#7c3aed',
  teal: '#059669',
  blue: '#2563eb',
  amber: '#d97706',
  coral: '#dc2626',
}

export function getTheme(theme) {
  return theme === 'dark' ? darkTheme : lightTheme
}
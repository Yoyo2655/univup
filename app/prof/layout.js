'use client'
import ProfSidebar from './sidebar'
import { useTheme, getTheme } from '../context/ThemeContext'

export default function ProfLayout({ children }) {
  const { theme } = useTheme()
  const c = getTheme(theme)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', system-ui, sans-serif", background: c.bg, transition: 'background 0.2s' }}>
      <ProfSidebar />
      <div style={{ marginLeft: '220px', flex: 1 }}>
        {children}
      </div>
    </div>
  )
}
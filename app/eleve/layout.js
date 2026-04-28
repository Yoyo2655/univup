'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import EleveSidebar from './sidebar'
import { useTheme, getTheme } from '../context/ThemeContext'

export default function EleveLayout({ children }) {
  const { theme } = useTheme()
  const c = getTheme(theme)
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/'); return }
      const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (data?.role !== 'eleve') { router.replace('/'); return }
      setReady(true)
    }
    checkAuth()
  }, [])

  if (!ready) return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', system-ui" }}>
      <div style={{ fontSize: '13px', color: c.muted }}>Chargement...</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', system-ui, sans-serif", background: c.bg, transition: 'background 0.2s' }}>
      <EleveSidebar />
      <div style={{ marginLeft: '220px', flex: 1 }}>
        {children}
      </div>
    </div>
  )
}
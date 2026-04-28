'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useTheme, getTheme } from '../context/ThemeContext'

export default function AccesProtege({ children }) {
  const { theme, isDark } = useTheme()
  const c = getTheme(theme)

  const [actif, setActif] = useState(null)

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('users').select('is_active').eq('id', user.id).single()
      setActif(data?.is_active || false)
    }
    check()
  }, [])

  if (actif === null) return (
    <div style={{ padding: '40px', textAlign: 'center', color: c.muted, background: c.bg, minHeight: '100vh', fontFamily: "'DM Sans', system-ui" }}>
      Chargement...
    </div>
  )

  if (!actif) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: c.text, background: c.bg, fontFamily: "'DM Sans', system-ui" }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔒</div>
        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: c.text }}>Acces non active</div>
        <div style={{ fontSize: '13px', color: c.muted, lineHeight: 1.6 }}>
          Ton acces n'est pas encore active. Consulte la page <strong style={{ color: c.text }}>Mon abonnement</strong> pour effectuer ton virement, puis contacte UnivUp via le chat pour confirmer.
        </div>
      </div>
    </div>
  )

  return children
}
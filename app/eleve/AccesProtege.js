'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { t } from '../../lib/theme'

export default function AccesProtege({ children }) {
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
    <div style={{ padding: '40px', textAlign: 'center', color: t.muted }}>Chargement…</div>
  )

  if (!actif) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: t.text }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔒</div>
        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Accès non activé</div>
        <div style={{ fontSize: '13px', color: t.muted, lineHeight: 1.6 }}>
          Ton accès n'est pas encore activé. Consulte la page <strong style={{ color: t.text }}>Mon abonnement</strong> pour effectuer ton virement, puis contacte UnivUp via le chat pour confirmer.
        </div>
      </div>
    </div>
  )

  return children
}
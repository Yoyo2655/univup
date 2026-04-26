'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useEffect, useState } from 'react'
import { t } from '../../lib/theme'

export default function EleveSidebar() {
  const pathname = usePathname()
  const [eleveName, setEleveName] = useState('')

  useEffect(() => {
    async function getName() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('users').select('full_name').eq('id', user.id).single()
        if (data) setEleveName(data.full_name)
      }
    }
    getName()
  }, [])

  const navItems = [
    { href: '/eleve', label: 'Mon planning', icon: '📅' },
    { href: '/eleve/resultats', label: 'Mes résultats', icon: '📊' },
    { href: '/eleve/biblio', label: 'Bibliothèque', icon: '📄' },
    { href: '/eleve/gei', label: 'Prépa GEI', icon: '🎯' },
    { href: '/eleve/abonnement', label: 'Mon abonnement', icon: '💳' },
    { href: '/chat', label: 'Chat', icon: '💬' },
  ]

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div style={{
      width: '220px', flexShrink: 0, background: t.surface,
      borderRight: '1px solid t.border',
      display: 'flex', flexDirection: 'column', padding: '20px 0',
      position: 'fixed', height: '100vh'
    }}>
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid t.border', marginBottom: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: '600', color: t.text }}>UnivUp</div>
        <div style={{ fontSize: '11px', color: t.muted, marginTop: '2px' }}>Espace étudiant</div>
      </div>

      <div style={{ padding: '0 12px', flex: 1 }}>
        {navItems.map(item => (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 10px', borderRadius: '8px', marginBottom: '2px',
              background: pathname === item.href ? t.surface2 : 'none',
              color: pathname === item.href ? t.text : t.muted,
              fontSize: '13px', cursor: 'pointer'
            }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ padding: '16px 12px 0', borderTop: '1px solid t.border' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'rgba(96,165,250,0.12)', color: t.blue,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '600'
          }}>
            {eleveName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: t.text }}>{eleveName || '…'}</div>
            <div style={{ fontSize: '10px', color: t.muted }}>Étudiant</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '7px', marginTop: '8px',
          background: 'none', border: '1px solid t.border',
          borderRadius: '8px', color: t.muted, fontSize: '12px', cursor: 'pointer'
        }}>
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
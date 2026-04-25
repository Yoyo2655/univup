'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useEffect, useState } from 'react'

export default function ProfSidebar() {
  const pathname = usePathname()
  const [profName, setProfName] = useState('')

  useEffect(() => {
    async function getName() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('users').select('full_name').eq('id', user.id).single()
        if (data) setProfName(data.full_name)
      }
    }
    getName()
  }, [])

  const navItems = [
    { href: '/prof', label: 'Mon planning', icon: '📅' },
    { href: '/prof/appel', label: 'Feuille d\'appel', icon: '✅' },
    { href: '/prof/salaire', label: 'Mon salaire', icon: '💶' },
    { href: '/prof/ressources', label: 'Ressources', icon: '📄' },
  ]

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div style={{
      width: '220px', flexShrink: 0, background: '#18181c',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column', padding: '20px 0',
      position: 'fixed', height: '100vh'
    }}>
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#e8e6e0' }}>UnivUp</div>
        <div style={{ fontSize: '11px', color: '#6e6c66', marginTop: '2px' }}>Espace professeur</div>
      </div>

      <div style={{ padding: '0 12px', flex: 1 }}>
        {navItems.map(item => (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 10px', borderRadius: '8px', marginBottom: '2px',
              background: pathname === item.href ? '#1e1e24' : 'none',
              color: pathname === item.href ? '#e8e6e0' : '#6e6c66',
              fontSize: '13px', cursor: 'pointer'
            }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ padding: '16px 12px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'rgba(52,211,153,0.12)', color: '#34d399',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '600'
          }}>
            {profName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#e8e6e0' }}>{profName || '…'}</div>
            <div style={{ fontSize: '10px', color: '#6e6c66' }}>Professeur</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '7px', marginTop: '8px',
          background: 'none', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '8px', color: '#6e6c66', fontSize: '12px', cursor: 'pointer'
        }}>
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
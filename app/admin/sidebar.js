'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../../lib/supabase'
import { t } from '../../lib/theme'

export default function AdminSidebar() {
  const pathname = usePathname()
  const navItems = [
    { href: '/admin', label: 'Tableau de bord', icon: '📊' },
    { href: '/admin/planning', label: 'Planning global', icon: '📅' },
    { href: '/admin/eleves', label: 'Eleves', icon: '👥' },
    { href: '/admin/suivi', label: 'Suivi eleves', icon: '📈' },
    { href: '/admin/salaires', label: 'Professeurs', icon: '💶' },
    { href: '/admin/packs', label: 'Packs & Abonnements', icon: '📦' },
    { href: '/chat', label: 'Chat', icon: '💬' },
  ]

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div style={{
      width: '220px', flexShrink: 0,
      background: '#111010',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column', padding: '20px 0',
      position: 'fixed', height: '100vh',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>

      {/* Logo */}
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
        <Image
          src="/Logo1w_univup-removebg.png"
          alt="UnivUp"
          width={120}
          height={40}
          style={{ objectFit: 'contain' }}
        />
        <div style={{ fontSize: '13px', color: '#4a4847', marginTop: '2px', marginLeft: '10px', letterSpacing: '0.3px' }}>Espace admin</div>
      </div>

      {/* Séparateur tricolore */}
      <div style={{ display: 'flex', marginBottom: '16px', paddingLeft: '20px' }}>
        <div style={{ height: '2px', width: '32px', background: '#f0eeea' }} />
        <div style={{ height: '2px', width: '32px', background: '#9b8ec4' }} />
        <div style={{ height: '2px', width: '32px', background: '#8a1c30' }} />
      </div>

      {/* Nav */}
      <div style={{ padding: '0 12px', flex: 1 }}>
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 10px', borderRadius: '8px', marginBottom: '2px',
                background: isActive ? 'rgba(155,142,196,0.1)' : 'none',
                color: isActive ? '#9b8ec4' : '#6e6c66',
                fontSize: '13px', cursor: 'pointer',
                borderLeft: isActive ? '2px solid #9b8ec4' : '2px solid transparent',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: '14px' }}>{item.icon}</span>
                <span style={{ fontWeight: isActive ? '500' : '400' }}>{item.label}</span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '0 12px' }}>
        {/* Séparateur tricolore inversé */}
        <div style={{ display: 'flex', marginBottom: '12px', paddingLeft: '8px' }}>
          <div style={{ height: '2px', flex: 3, background: 'rgba(240,238,234,0.08)' }} />
          <div style={{ height: '2px', flex: 1, background: 'rgba(155,142,196,0.3)' }} />
          <div style={{ height: '2px', flex: 1, background: 'rgba(138,28,48,0.3)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'rgba(155,142,196,0.15)', color: '#9b8ec4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '600'
          }}>YO</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#f0eeea' }}>Yoyo</div>
            <div style={{ fontSize: '10px', color: '#4a4847' }}>Administrateur</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '7px', marginTop: '8px',
            background: 'none', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '8px', color: '#4a4847', fontSize: '12px', cursor: 'pointer',
            fontFamily: 'inherit', transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.target.style.color = '#f0eeea'}
          onMouseLeave={e => e.target.style.color = '#4a4847'}
        >
          Se deconnecter
        </button>
      </div>
    </div>
  )
}
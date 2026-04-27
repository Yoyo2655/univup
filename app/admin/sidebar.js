'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../../lib/supabase'
import { useTheme, getTheme } from '../context/ThemeContext'

export default function AdminSidebar() {
  const pathname = usePathname()
  const { theme, toggleTheme, isDark } = useTheme()
  const c = getTheme(theme)

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
      background: isDark ? '#111010' : '#ffffff',
      borderRight: '1px solid ' + c.border,
      display: 'flex', flexDirection: 'column', padding: '20px 0',
      position: 'fixed', height: '100vh',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      transition: 'background 0.2s, border-color 0.2s',
    }}>

      {/* Logo */}
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid ' + c.border, marginBottom: '8px' }}>
        <Image
          src={isDark ? '/Logo1w_univup-removebg.png' : '/Logo1b_univup-removebg.png'}
          alt="UnivUp"
          width={120}
          height={40}
          style={{ objectFit: 'contain' }}
        />
        <div style={{ fontSize: '11px', color: c.muted, marginTop: '2px', marginLeft: '2px', letterSpacing: '0.3px' }}>Espace admin</div>
      </div>

      {/* Séparateur tricolore */}
      <div style={{ display: 'flex', marginBottom: '16px', paddingLeft: '20px' }}>
        <div style={{ height: '2px', width: '32px', background: isDark ? '#f0eeea' : '#111010' }} />
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
                background: isActive ? (isDark ? 'rgba(155,142,196,0.1)' : 'rgba(124,58,237,0.08)') : 'none',
                color: isActive ? c.purple : c.muted2,
                fontSize: '13px', cursor: 'pointer',
                borderLeft: isActive ? '2px solid ' + c.purple : '2px solid transparent',
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
          <div style={{ height: '2px', flex: 3, background: isDark ? 'rgba(240,238,234,0.08)' : 'rgba(0,0,0,0.06)' }} />
          <div style={{ height: '2px', flex: 1, background: 'rgba(155,142,196,0.3)' }} />
          <div style={{ height: '2px', flex: 1, background: 'rgba(138,28,48,0.3)' }} />
        </div>

        {/* Bouton toggle dark/light */}
        <button
          onClick={toggleTheme}
          style={{
            width: '100%', padding: '7px', marginBottom: '8px',
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            border: '1px solid ' + c.border,
            borderRadius: '8px', color: c.muted2, fontSize: '12px', cursor: 'pointer',
            fontFamily: 'inherit', transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          {isDark ? '☀️ Mode clair' : '🌙 Mode sombre'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: isDark ? 'rgba(155,142,196,0.15)' : 'rgba(124,58,237,0.1)',
            color: c.purple,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '600'
          }}>YO</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: c.text }}>Yoyo</div>
            <div style={{ fontSize: '10px', color: c.muted }}>Administrateur</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '7px', marginTop: '8px',
            background: 'none', border: '1px solid ' + c.border,
            borderRadius: '8px', color: c.muted, fontSize: '12px', cursor: 'pointer',
            fontFamily: 'inherit', transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.target.style.color = c.text}
          onMouseLeave={e => e.target.style.color = c.muted}
        >
          Se deconnecter
        </button>
      </div>
    </div>
  )
}
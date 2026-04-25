'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function AdminSidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin', label: 'Tableau de bord', icon: '⊞' },
    { href: '/admin/planning', label: 'Planning global', icon: '📅' },
    { href: '/admin/eleves', label: 'Élèves & abonnements', icon: '👥' },
    { href: '/admin/profs', label: 'Professeurs', icon: '🎓' },
    { href: '/admin/salaires', label: 'Salaires profs', icon: '💶' },
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
      {/* Logo */}
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#e8e6e0' }}>UnivUp</div>
        <div style={{ fontSize: '11px', color: '#6e6c66', marginTop: '2px' }}>Espace admin</div>
      </div>

      {/* Nav */}
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

      {/* Footer */}
      <div style={{ padding: '16px 12px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'rgba(167,139,250,0.12)', color: '#a78bfa',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '600'
          }}>YO</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#e8e6e0' }}>Yoyo</div>
            <div style={{ fontSize: '10px', color: '#6e6c66' }}>Administrateur</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '7px', marginTop: '8px',
            background: 'none', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '8px', color: '#6e6c66', fontSize: '12px', cursor: 'pointer'
          }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
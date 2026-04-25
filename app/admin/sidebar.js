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
      width: '220px', flexShrink: 0, background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', padding: '20px 0',
      position: 'fixed', height: '100vh'
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>UnivUp</div>
        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Espace admin</div>
      </div>

      {/* Nav */}
      <div style={{ padding: '0 12px', flex: 1 }}>
        {navItems.map(item => (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 10px', borderRadius: '8px', marginBottom: '2px',
              background: pathname === item.href ? 'var(--surface2)' : 'none',
              color: pathname === item.href ? 'var(--text)' : 'var(--muted)',
              fontSize: '13px', cursor: 'pointer'
            }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 12px 0', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'rgba(167,139,250,0.12)', color: 'var(--purple)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '600'
          }}>YO</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text)' }}>Yoyo</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Administrateur</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '7px', marginTop: '8px',
            background: 'none', border: '1px solid var(--border)',
            borderRadius: '8px', color: 'var(--muted)', fontSize: '12px', cursor: 'pointer'
          }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
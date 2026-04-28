'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../admin/sidebar'
import ProfSidebar from '../prof/sidebar'
import EleveSidebar from '../eleve/sidebar'
import { useTheme, getTheme } from '../context/ThemeContext'
import { useIsMobile } from '../hooks/useIsMobile'

export default function ChatLayout({ children }) {
  const [role, setRole] = useState(null)
  const { theme } = useTheme()
  const c = getTheme(theme)
  const router = useRouter()
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/'); return }
      const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (data) setRole(data.role)
      else router.replace('/')
    }
    checkAuth()
  }, [])

  useEffect(() => { setSidebarOpen(false) }, [])

  if (!role) return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', system-ui" }}>
      <div style={{ fontSize: '13px', color: c.muted }}>Chargement...</div>
    </div>
  )

  const SidebarComponent = role === 'admin' ? AdminSidebar : role === 'prof' ? ProfSidebar : EleveSidebar

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', system-ui, sans-serif", background: c.bg, transition: 'background 0.2s' }}>

      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
      )}

      <div style={{
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50,
        transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
        transition: 'transform 0.25s ease',
      }}>
        <SidebarComponent onClose={() => setSidebarOpen(false)} />
      </div>

      {isMobile && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '52px', background: c.surface, borderBottom: '1px solid ' + c.border, display: 'flex', alignItems: 'center', padding: '0 16px', zIndex: 30, gap: '12px' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: c.text, fontSize: '20px', lineHeight: 1 }}>
            ☰
          </button>
        </div>
      )}

      <div style={{
        marginLeft: isMobile ? '0' : '220px',
        flex: 1,
        paddingTop: isMobile ? '52px' : '0',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {children}
      </div>
    </div>
  )
}
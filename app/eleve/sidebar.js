'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../../lib/supabase'
import { useEffect, useState } from 'react'
import { useTheme, getTheme } from '../context/ThemeContext'

export default function EleveSidebar({ onClose }) {
  const pathname = usePathname()
  const [eleveName, setEleveName] = useState('')
  const { theme, toggleTheme, isDark } = useTheme()
  const c = getTheme(theme)
  const [unreadChat, setUnreadChat] = useState(0)
  const [unreadFeedbacks, setUnreadFeedbacks] = useState(0)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.from('users').select('full_name').eq('id', user.id).single()
      if (data) setEleveName(data.full_name)
      countUnreadChat(user.id)
      countUnreadFeedbacks(user.id)
    }
    init()
  }, [])

  // Reset badges selon la page visitée
  useEffect(() => {
    if (pathname === '/chat') {
      localStorage.setItem('univup-chat-last-visit', new Date().toISOString())
      setUnreadChat(0)
    }
    if (pathname === '/eleve/resultats') {
      localStorage.setItem('univup-resultats-last-visit', new Date().toISOString())
      setUnreadFeedbacks(0)
    }
  }, [pathname])

  async function countUnreadChat(uid) {
    const lastVisit = localStorage.getItem('univup-chat-last-visit') || '1970-01-01'
    const { data } = await supabase.from('messages').select('id').neq('user_id', uid).gt('created_at', lastVisit)
    setUnreadChat(data?.length || 0)
  }

  async function countUnreadFeedbacks(uid) {
    const lastVisit = localStorage.getItem('univup-resultats-last-visit') || '1970-01-01'
    const { data } = await supabase
      .from('seance_eleves')
      .select('id')
      .eq('eleve_id', uid)
      .not('feedback', 'is', null)
      .gt('feedback_at', lastVisit)
    setUnreadFeedbacks(data?.length || 0)
  }

  // Realtime chat
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('eleve-sidebar-chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.new.user_id !== userId && pathname !== '/chat') {
          setUnreadChat(prev => prev + 1)
        }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [userId, pathname])

  // Realtime feedbacks
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('eleve-sidebar-feedbacks')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'seance_eleves', filter: `eleve_id=eq.${userId}` }, (payload) => {
        if (payload.new.feedback && payload.new.feedback !== payload.old.feedback && pathname !== '/eleve/resultats') {
          setUnreadFeedbacks(prev => prev + 1)
        }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [userId, pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const initials = eleveName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const badge = (count, color) => count > 0 ? (
    <span style={{ marginLeft: 'auto', background: color, color: '#fff', fontSize: '10px', fontWeight: '600', padding: '1px 6px', borderRadius: '20px', minWidth: '18px', textAlign: 'center' }}>
      {count > 99 ? '99+' : count}
    </span>
  ) : null

  const navItems = [
    { href: '/eleve/profil', label: 'Mon profil', icon: '👤' },
    { href: '/eleve', label: 'Mon planning', icon: '📅' },
    { href: '/eleve/resultats', label: 'Mes resultats', icon: '📊', badge: badge(unreadFeedbacks, '#dc2626') },
    { href: '/eleve/biblio', label: 'Bibliotheque', icon: '📄' },
    { href: '/eleve/gei', label: 'Prepa GEI', icon: '🎯' },
    { href: '/eleve/abonnement', label: 'Mon abonnement', icon: '💳' },
    { href: '/chat', label: 'Chat', icon: '💬', badge: badge(unreadChat, '#9b8ec4') },
  ]

  return (
    <div style={{ width: '220px', flexShrink: 0, background: isDark ? '#111010' : '#ffffff', borderRight: '1px solid ' + c.border, display: 'flex', flexDirection: 'column', padding: '20px 0', position: 'fixed', height: '100vh', fontFamily: "'DM Sans', system-ui, sans-serif", transition: 'background 0.2s, border-color 0.2s' }}>

      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid ' + c.border, marginBottom: '8px' }}>
        <Image src={isDark ? '/Logo1w_univup-removebg.png' : '/Logo1b_univup-removebg.png'} alt="UnivUp" width={120} height={40} style={{ objectFit: 'contain' }} />
        <div style={{ fontSize: '11px', color: c.muted, marginTop: '2px', marginLeft: '2px', letterSpacing: '0.3px' }}>Espace etudiant</div>
      </div>

      <div style={{ display: 'flex', marginBottom: '16px', paddingLeft: '20px' }}>
        <div style={{ height: '2px', width: '32px', background: isDark ? '#f0eeea' : '#111010' }} />
        <div style={{ height: '2px', width: '32px', background: '#9b8ec4' }} />
        <div style={{ height: '2px', width: '32px', background: '#8a1c30' }} />
      </div>

      <div style={{ padding: '0 12px', flex: 1 }}>
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} onClick={onClose}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', marginBottom: '2px', background: isActive ? (isDark ? 'rgba(155,142,196,0.1)' : 'rgba(124,58,237,0.08)') : 'none', color: isActive ? c.purple : c.muted2, fontSize: '13px', cursor: 'pointer', borderLeft: isActive ? '2px solid ' + c.purple : '2px solid transparent', transition: 'all 0.15s' }}>
                <span style={{ fontSize: '14px' }}>{item.icon}</span>
                <span style={{ fontWeight: isActive ? '500' : '400' }}>{item.label}</span>
                {item.badge}
              </div>
            </Link>
          )
        })}
      </div>

      <div style={{ padding: '0 12px' }}>
        <div style={{ display: 'flex', marginBottom: '12px', paddingLeft: '8px' }}>
          <div style={{ height: '2px', flex: 3, background: isDark ? 'rgba(240,238,234,0.08)' : 'rgba(0,0,0,0.06)' }} />
          <div style={{ height: '2px', flex: 1, background: 'rgba(155,142,196,0.3)' }} />
          <div style={{ height: '2px', flex: 1, background: 'rgba(138,28,48,0.3)' }} />
        </div>
        <button onClick={toggleTheme} style={{ width: '100%', padding: '7px', marginBottom: '8px', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: '1px solid ' + c.border, borderRadius: '8px', color: c.muted2, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          {isDark ? '☀️ Mode clair' : '🌙 Mode sombre'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isDark ? 'rgba(155,142,196,0.15)' : 'rgba(124,58,237,0.1)', color: c.purple, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600' }}>{initials || '?'}</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: c.text }}>{eleveName || '...'}</div>
            <div style={{ fontSize: '10px', color: c.muted }}>Etudiant</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width: '100%', padding: '7px', marginTop: '8px', background: 'none', border: '1px solid ' + c.border, borderRadius: '8px', color: c.muted, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.15s' }}
          onMouseEnter={e => e.target.style.color = c.text}
          onMouseLeave={e => e.target.style.color = c.muted}>
          Se deconnecter
        </button>
      </div>
    </div>
  )
}
'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useTheme, getTheme } from '../context/ThemeContext'

export default function ChatPage() {
  const { theme, isDark } = useTheme()
  const c = getTheme(theme)

  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [user, setUser] = useState(null)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    initUser()
    fetchMessages()
    const channel = supabase
      .channel('chat-general')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => { fetchMessages() })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function initUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUser(user)
  }

  async function fetchMessages() {
    const { data } = await supabase.from('messages').select('*, users:user_id(full_name, role)').order('created_at', { ascending: true }).limit(100)
    setMessages(data || [])
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!newMessage.trim() || !user) return
    setSending(true)
    await supabase.from('messages').insert({ user_id: user.id, contenu: newMessage.trim() })
    setNewMessage('')
    setSending(false)
  }

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file || !user) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = user.id + '/' + Date.now() + '.' + ext
    const { error } = await supabase.storage.from('chat-files').upload(path, file)
    if (error) { setUploading(false); return }
    const { data: urlData } = supabase.storage.from('chat-files').getPublicUrl(path)
    await supabase.from('messages').insert({ user_id: user.id, contenu: null, fichier_url: urlData.publicUrl, fichier_type: file.type, fichier_nom: file.name })
    setUploading(false)
    fileInputRef.current.value = ''
  }

  function getRoleColor(role) {
    if (role === 'admin') return c.purple
    if (role === 'prof') return c.teal
    return c.blue
  }

  function getRoleLabel(role) {
    if (role === 'admin') return 'Admin'
    if (role === 'prof') return 'Prof'
    return 'Eleve'
  }

  function formatTime(ts) {
    const d = new Date(ts)
    const today = new Date()
    const isToday = d.toDateString() === today.toDateString()
    if (isToday) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  function renderFichier(msg, isMe) {
    if (!msg.fichier_url) return null
    if (msg.fichier_type && msg.fichier_type.startsWith('image/')) {
      return (
        <img src={msg.fichier_url} alt={msg.fichier_nom} style={{ maxWidth: '280px', borderRadius: '12px', cursor: 'pointer' }} onClick={() => window.open(msg.fichier_url, '_blank')} />
      )
    }
    return (
      <div onClick={() => window.open(msg.fichier_url, '_blank')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '12px', cursor: 'pointer', background: isMe ? c.purple : c.surface, border: isMe ? 'none' : '1px solid ' + c.border, color: isMe ? (isDark ? '#1a1228' : '#ffffff') : c.text, fontSize: '13px' }}>
        <span>📎</span>
        <span>{msg.fichier_nom}</span>
      </div>
    )
  }

  return (
    <div style={{ color: c.text, display: 'flex', flexDirection: 'column', height: '100vh', background: c.bg, fontFamily: "'DM Sans', system-ui", transition: 'background 0.2s' }}>

      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid ' + c.border, flexShrink: 0, background: c.surface, transition: 'background 0.2s' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: c.text, letterSpacing: '-0.3px', margin: 0 }}>Chat general</h1>
          <div style={{ fontSize: '11px', color: c.muted, marginTop: '2px' }}>Eleves · Profs · Admin</div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ height: '2px', width: '24px', background: isDark ? '#f0eeea' : '#111010' }} />
          <div style={{ height: '2px', width: '24px', background: '#9b8ec4' }} />
          <div style={{ height: '2px', width: '24px', background: '#8a1c30' }} />
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: c.muted, padding: '60px 0', fontSize: '13px' }}>Aucun message pour le moment.</div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.user_id === user?.id
          const showAvatar = i === 0 || messages[i - 1].user_id !== msg.user_id
          const roleColor = getRoleColor(msg.users?.role)
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '10px', alignItems: 'flex-end' }}>
              {!isMe && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, background: roleColor + (isDark ? '22' : '15'), color: roleColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', visibility: showAvatar ? 'visible' : 'hidden' }}>
                  {msg.users?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: '3px' }}>
                {showAvatar && !isMe && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: c.text }}>{msg.users?.full_name}</span>
                    <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '10px', background: roleColor + (isDark ? '22' : '15'), color: roleColor }}>{getRoleLabel(msg.users?.role)}</span>
                  </div>
                )}
                {msg.contenu && (
                  <div style={{ padding: '10px 14px', borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px', background: isMe ? c.purple : c.surface, color: isMe ? (isDark ? '#1a1228' : '#ffffff') : c.text, fontSize: '13px', lineHeight: 1.5, border: isMe ? 'none' : '1px solid ' + c.border, boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)' }}>
                    {msg.contenu}
                  </div>
                )}
                {renderFichier(msg, isMe)}
                <span style={{ fontSize: '10px', color: c.muted, marginTop: '2px' }}>{formatTime(msg.created_at)}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px 28px', borderTop: '1px solid ' + c.border, background: c.surface, flexShrink: 0, transition: 'background 0.2s' }}>
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleFile} style={{ display: 'none' }} />
          <button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading} style={{ background: 'none', border: '1px solid ' + c.border2, borderRadius: '8px', padding: '8px 10px', color: c.muted2, cursor: 'pointer', fontSize: '16px', flexShrink: 0 }}>
            {uploading ? '⏳' : '📎'}
          </button>
          <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Ecrire un message..." style={{ flex: 1, padding: '10px 14px', background: c.surface2, border: '1px solid ' + c.border2, borderRadius: '10px', color: c.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
          <button type="submit" disabled={sending || !newMessage.trim()} style={{ padding: '10px 18px', background: c.purple, border: 'none', borderRadius: '10px', color: isDark ? '#1a1228' : '#ffffff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: (sending || !newMessage.trim()) ? 0.5 : 1, flexShrink: 0, fontFamily: 'inherit' }}>
            Envoyer
          </button>
        </form>
      </div>
    </div>
  )
}
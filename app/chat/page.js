'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { t } from '../../lib/theme'

export default function ChatPage() {
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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchMessages()
      })
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
    const { data } = await supabase
      .from('messages')
      .select('*, users:user_id(full_name, role)')
      .order('created_at', { ascending: true })
      .limit(100)
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
    await supabase.from('messages').insert({
      user_id: user.id,
      contenu: null,
      fichier_url: urlData.publicUrl,
      fichier_type: file.type,
      fichier_nom: file.name
    })
    setUploading(false)
    fileInputRef.current.value = ''
  }

  function getRoleColor(role) {
    if (role === 'admin') return t.purple
    if (role === 'prof') return t.teal
    return t.blue
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
    const roleColor = getRoleColor(msg.users?.role)
    if (msg.fichier_type && msg.fichier_type.startsWith('image/')) {
      return (
        <img
          src={msg.fichier_url}
          alt={msg.fichier_nom}
          style={{ maxWidth: '280px', borderRadius: '12px', cursor: 'pointer' }}
          onClick={() => window.open(msg.fichier_url, '_blank')}
        />
      )
    }
    return (
      <div
        onClick={() => window.open(msg.fichier_url, '_blank')}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 14px', borderRadius: '12px', cursor: 'pointer',
          background: isMe ? t.purple : t.surface,
          border: isMe ? 'none' : ('1px solid ' + t.border),
          color: isMe ? '#1a1228' : t.text,
          fontSize: '13px'
        }}
      >
        <span>📎</span>
        <span>{msg.fichier_nom}</span>
      </div>
    )
  }

  return (
    <div style={{ color: t.text, display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: ('1px solid ' + t.border), flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: t.text }}>Chat general</h1>
          <div style={{ fontSize: '11px', color: t.muted, marginTop: '2px' }}>Eleves · Profs · Admin</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: t.muted, padding: '60px 0', fontSize: '13px' }}>
            Aucun message pour le moment.
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.user_id === user?.id
          const showAvatar = i === 0 || messages[i - 1].user_id !== msg.user_id
          const roleColor = getRoleColor(msg.users?.role)

          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '10px', alignItems: 'flex-end' }}>
              {!isMe && (
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  background: roleColor + '22', color: roleColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: '600',
                  visibility: showAvatar ? 'visible' : 'hidden'
                }}>
                  {msg.users?.full_name?.split(' ').map(function(n) { return n[0] }).join('').slice(0, 2).toUpperCase()}
                </div>
              )}

              <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: '3px' }}>
                {showAvatar && !isMe && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: t.text }}>{msg.users?.full_name}</span>
                    <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '10px', background: roleColor + '22', color: roleColor }}>
                      {getRoleLabel(msg.users?.role)}
                    </span>
                  </div>
                )}

                {msg.contenu && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    background: isMe ? t.purple : t.surface,
                    color: isMe ? '#1a1228' : t.text,
                    fontSize: '13px', lineHeight: 1.5,
                    border: isMe ? 'none' : ('1px solid ' + t.border)
                  }}>
                    {msg.contenu}
                  </div>
                )}

                {renderFichier(msg, isMe)}

                <span style={{ fontSize: '10px', color: t.muted, marginTop: '2px' }}>
                  {formatTime(msg.created_at)}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '16px 28px', borderTop: ('1px solid ' + t.border), background: t.surface, flexShrink: 0 }}>
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            style={{ background: 'none', border: ('1px solid ' + t.border2), borderRadius: '8px', padding: '8px 10px', color: t.muted2, cursor: 'pointer', fontSize: '16px', flexShrink: 0 }}
          >
            {uploading ? '⏳' : '📎'}
          </button>
          <input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Ecrire un message..."
            style={{ flex: 1, padding: '10px 14px', background: t.surface2, border: ('1px solid ' + t.border2), borderRadius: '10px', color: t.text, fontSize: '13px', outline: 'none' }}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            style={{ padding: '10px 18px', background: t.purple, border: 'none', borderRadius: '10px', color: '#1a1228', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: (sending || !newMessage.trim()) ? 0.5 : 1, flexShrink: 0 }}
          >
            Envoyer
          </button>
        </form>
      </div>
    </div>
  )
}
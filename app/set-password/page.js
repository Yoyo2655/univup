'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function SetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(hash.replace('#', ''))
    const token = params.get('access_token')
    if (token) setReady(true)
    else setError('Lien invalide. Contacte UnivUp.')
  }, [])

  async function handleSetPassword(e) {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    if (password.length < 6) { setError('Minimum 6 caracteres'); return }
    setLoading(true)

    const hash = window.location.hash
    const params = new URLSearchParams(hash.replace('#', ''))
    const token = params.get('access_token')

    const res = await fetch('/api/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }

    await supabase.auth.signInWithPassword({ email: data.email, password })
    router.push('/')
  }

  if (!ready && !error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e0d0d', color: '#f0eeea', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
        <div style={{ fontSize: '14px', color: '#4a4847' }}>Verification du lien...</div>
      </div>
    </div>
  )

  if (error && !ready) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e0d0d', color: '#f0eeea', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center', maxWidth: '360px', padding: '40px' }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>❌</div>
        <div style={{ fontSize: '14px', color: '#e07080' }}>{error}</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e0d0d', fontFamily: 'system-ui' }}>
      <div style={{ width: '100%', maxWidth: '360px', padding: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#f0eeea', marginBottom: '8px' }}>Choisir mon mot de passe</h2>
        <p style={{ fontSize: '13px', color: '#4a4847', marginBottom: '32px' }}>Bienvenue sur UnivUp — choisis ton mot de passe pour acceder a ton espace.</p>
        <form onSubmit={handleSetPassword}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#6e6c66', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Min. 6 caracteres"
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f0eeea', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#6e6c66', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Confirmer</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              placeholder="Retape ton mot de passe"
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f0eeea', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          {error && <div style={{ color: '#e07080', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '13px', background: loading ? '#2a2838' : '#f0eeea', border: 'none', borderRadius: '8px', color: '#111010', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Enregistrement...' : 'Confirmer mon mot de passe'}
          </button>
        </form>
      </div>
    </div>
  )
}
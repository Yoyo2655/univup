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
    const res = await fetch('/api/set-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }
    await supabase.auth.signInWithPassword({ email: data.email, password })
    router.push('/')
  }

  const inputStyle = { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f0eeea', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }

  if (!ready && !error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e0d0d', color: '#f0eeea', fontFamily: "'DM Sans', system-ui" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
        <div style={{ fontSize: '14px', color: '#4a4847' }}>Verification du lien...</div>
      </div>
    </div>
  )

  if (error && !ready) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e0d0d', color: '#f0eeea', fontFamily: "'DM Sans', system-ui" }}>
      <div style={{ textAlign: 'center', maxWidth: '360px', padding: '40px' }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>❌</div>
        <div style={{ fontSize: '14px', color: '#e07080' }}>{error}</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0e0d0d', fontFamily: "'DM Sans', system-ui, sans-serif", position: 'relative', overflow: 'hidden' }}>
      <style>{`
        .sp-left { display: flex; }
        @media (max-width: 767px) {
          .sp-left { display: none !important; }
          .sp-right { padding: 60px 24px 40px !important; align-items: flex-start !important; }
          .sp-logo-mobile { display: block !important; }
        }
      `}</style>

      {/* Panneau gauche — caché sur mobile */}
      <div className="sp-left" style={{ width: '420px', flexShrink: 0, background: '#111010', flexDirection: 'column', justifyContent: 'space-between', padding: '52px 48px', position: 'relative', overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, display: 'flex', flexDirection: 'row' }}>
          <div style={{ width: '5px', background: '#111010' }} />
          <div style={{ width: '5px', background: '#9b8ec4' }} />
          <div style={{ width: '5px', background: '#8a1c30' }} />
        </div>
        <img src="/Logo1w_univup-removebg.png" alt="UnivUp" style={{ position: 'absolute', top: '40px', left: '40px', width: '280px', objectFit: 'contain', zIndex: 2 }} />
        <div style={{ height: '60px' }} />
        <div>
          <div style={{ display: 'flex', marginBottom: '28px' }}>
            <div style={{ height: '3px', width: '48px', background: '#f0eeea' }} />
            <div style={{ height: '3px', width: '48px', background: '#9b8ec4' }} />
            <div style={{ height: '3px', width: '48px', background: '#8a1c30' }} />
          </div>
          <p style={{ fontSize: '22px', fontWeight: '300', color: '#f0eeea', lineHeight: 1.4, letterSpacing: '-0.3px', marginBottom: '16px' }}>
            Bienvenue sur UnivUp.<br />
            <span style={{ color: '#9b8ec4', fontWeight: '500' }}>Choisis ton mot de passe.</span>
          </p>
          <p style={{ fontSize: '13px', color: '#4a4847', lineHeight: 1.6 }}>
            Tu n'auras a le faire qu'une seule fois.<br />Garde-le bien.
          </p>
        </div>
        <div style={{ fontSize: '11px', color: '#2e2d2b', letterSpacing: '0.3px' }}>© {new Date().getFullYear()} UnivUp</div>
      </div>

      {/* Panneau droit */}
      <div className="sp-right" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative' }}>
        <svg style={{ position: 'absolute', top: 0, right: 0, opacity: 0.06, pointerEvents: 'none' }} width="400" height="400" viewBox="0 0 400 400">
          <polyline points="400,0 180,0 80,200 400,200" fill="none" stroke="#f0eeea" strokeWidth="12" />
          <polyline points="400,14 186,14 86,214 400,214" fill="none" stroke="#9b8ec4" strokeWidth="12" />
          <polyline points="400,28 192,28 92,228 400,228" fill="none" stroke="#8a1c30" strokeWidth="12" />
        </svg>

        <div style={{ width: '100%', maxWidth: '360px', position: 'relative', zIndex: 1 }}>

          {/* Logo mobile uniquement */}

          <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#f0eeea', letterSpacing: '-0.5px', marginBottom: '8px' }}>Choisir mon mot de passe</h2>
          <p style={{ fontSize: '13px', color: '#4a4847', marginBottom: '32px' }}>Bienvenue sur UnivUp — choisis ton mot de passe pour acceder a ton espace.</p>

          <form onSubmit={handleSetPassword}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6e6c66', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 6 caracteres" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(155,142,196,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6e6c66', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Confirmer</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Retape ton mot de passe" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(155,142,196,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
            </div>
            {error && <div style={{ color: '#e07080', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px', background: loading ? '#2a2838' : '#f0eeea', border: 'none', borderRadius: '8px', color: '#111010', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => { if (!loading) e.target.style.background = '#ffffff' }}
              onMouseLeave={e => { if (!loading) e.target.style.background = '#f0eeea' }}>
              {loading ? 'Enregistrement...' : 'Confirmer mon mot de passe'}
            </button>
          </form>

          <div style={{ display: 'flex', marginTop: '36px' }}>
            <div style={{ height: '2px', flex: 3, background: 'rgba(240,238,234,0.08)' }} />
            <div style={{ height: '2px', flex: 1, background: 'rgba(155,142,196,0.3)' }} />
            <div style={{ height: '2px', flex: 1, background: 'rgba(138,28,48,0.3)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
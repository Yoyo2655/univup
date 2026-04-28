'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
  }, [])

  async function handleReset(e) {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    if (password.length < 6) { setError('Minimum 6 caracteres'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
    setLoading(false)
    setTimeout(() => router.push('/'), 3000)
  }

  const inputStyle = { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f0eeea', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s', fontFamily: 'inherit' }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0e0d0d', fontFamily: "'DM Sans', system-ui, sans-serif", position: 'relative', overflow: 'hidden' }}>
      <style>{`
        .rp-left { display: flex; }
        .rp-right { padding: 40px; }
        @media (max-width: 767px) {
          .rp-left { display: none !important; }
          .rp-right { padding: 60px 24px 40px !important; align-items: flex-start !important; }
        }
      `}</style>

      {/* Panneau gauche */}
      <div className="rp-left" style={{ width: '420px', flexShrink: 0, background: '#111010', flexDirection: 'column', justifyContent: 'space-between', padding: '52px 48px', position: 'relative', overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
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
            Nouveau mot de passe.<br />
            <span style={{ color: '#9b8ec4', fontWeight: '500' }}>Choisis-en un solide.</span>
          </p>
          <p style={{ fontSize: '13px', color: '#4a4847', lineHeight: 1.6 }}>
            Minimum 6 caracteres.<br />Tu seras redirige automatiquement.
          </p>
        </div>
        <div style={{ fontSize: '11px', color: '#2e2d2b', letterSpacing: '0.3px' }}>© {new Date().getFullYear()} UnivUp</div>
      </div>

      {/* Panneau droit */}
      <div className="rp-right" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <svg style={{ position: 'absolute', top: 0, right: 0, opacity: 0.06, pointerEvents: 'none' }} width="400" height="400" viewBox="0 0 400 400">
          <polyline points="400,0 180,0 80,200 400,200" fill="none" stroke="#f0eeea" strokeWidth="12" />
          <polyline points="400,14 186,14 86,214 400,214" fill="none" stroke="#9b8ec4" strokeWidth="12" />
          <polyline points="400,28 192,28 92,228 400,228" fill="none" stroke="#8a1c30" strokeWidth="12" />
        </svg>
        <div style={{ width: '100%', maxWidth: '360px', position: 'relative', zIndex: 1 }}>

          {done ? (
            <>
              <div style={{ fontSize: '40px', marginBottom: '20px' }}>✅</div>
              <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#f0eeea', letterSpacing: '-0.5px', marginBottom: '12px' }}>Mot de passe mis a jour !</h2>
              <p style={{ fontSize: '13px', color: '#4a4847', lineHeight: 1.7 }}>
                Tu vas etre redirige vers la page de connexion dans quelques secondes...
              </p>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#f0eeea', letterSpacing: '-0.5px', marginBottom: '6px' }}>Nouveau mot de passe</h2>
              <p style={{ fontSize: '13px', color: '#4a4847', marginBottom: '36px' }}>Choisis ton nouveau mot de passe</p>

              <form onSubmit={handleReset}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6e6c66', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Nouveau mot de passe</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 6 caracteres" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(155,142,196,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6e6c66', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Confirmer</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Retape ton mot de passe" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(155,142,196,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>

                {error && <div style={{ background: 'rgba(138,28,48,0.15)', border: '1px solid rgba(138,28,48,0.35)', borderRadius: '8px', padding: '10px 14px', color: '#e07080', fontSize: '13px', marginBottom: '20px' }}>{error}</div>}

                <button type="submit" disabled={loading}
                  style={{ width: '100%', padding: '13px', background: loading ? '#2a2838' : '#f0eeea', border: 'none', borderRadius: '8px', color: '#111010', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s', fontFamily: 'inherit' }}
                  onMouseEnter={e => { if (!loading) e.target.style.background = '#ffffff' }}
                  onMouseLeave={e => { if (!loading) e.target.style.background = '#f0eeea' }}>
                  {loading ? 'Mise a jour...' : 'Mettre a jour'}
                </button>
              </form>
            </>
          )}

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
'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://univup.vercel.app/reset-password'
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  const inputStyle = { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f0eeea', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s', fontFamily: 'inherit' }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0e0d0d', fontFamily: "'DM Sans', system-ui, sans-serif", position: 'relative', overflow: 'hidden' }}>
      <style>{`
        .fp-left { display: flex; }
        .fp-right { padding: 40px; }
        @media (max-width: 767px) {
          .fp-left { display: none !important; }
          .fp-right { padding: 60px 24px 40px !important; align-items: flex-start !important; }
        }
      `}</style>

      {/* Panneau gauche */}
      <div className="fp-left" style={{ width: '420px', flexShrink: 0, background: '#111010', flexDirection: 'column', justifyContent: 'space-between', padding: '52px 48px', position: 'relative', overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
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
            Pas de panique.<br />
            <span style={{ color: '#9b8ec4', fontWeight: '500' }}>On va regler ca.</span>
          </p>
          <p style={{ fontSize: '13px', color: '#4a4847', lineHeight: 1.6 }}>
            Entre ton email et on t'envoie<br />un lien pour reinitialiser ton mot de passe.
          </p>
        </div>
        <div style={{ fontSize: '11px', color: '#2e2d2b', letterSpacing: '0.3px' }}>© {new Date().getFullYear()} UnivUp</div>
      </div>

      {/* Panneau droit */}
      <div className="fp-right" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <svg style={{ position: 'absolute', top: 0, right: 0, opacity: 0.06, pointerEvents: 'none' }} width="400" height="400" viewBox="0 0 400 400">
          <polyline points="400,0 180,0 80,200 400,200" fill="none" stroke="#f0eeea" strokeWidth="12" />
          <polyline points="400,14 186,14 86,214 400,214" fill="none" stroke="#9b8ec4" strokeWidth="12" />
          <polyline points="400,28 192,28 92,228 400,228" fill="none" stroke="#8a1c30" strokeWidth="12" />
        </svg>
        <div style={{ width: '100%', maxWidth: '360px', position: 'relative', zIndex: 1 }}>

          {!sent ? (
            <>
              <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#f0eeea', letterSpacing: '-0.5px', marginBottom: '6px' }}>Mot de passe oublie</h2>
              <p style={{ fontSize: '13px', color: '#4a4847', marginBottom: '36px' }}>Entre ton email pour recevoir un lien de reinitialisation</p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6e6c66', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="ton@email.com"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(155,142,196,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>

                {error && <div style={{ background: 'rgba(138,28,48,0.15)', border: '1px solid rgba(138,28,48,0.35)', borderRadius: '8px', padding: '10px 14px', color: '#e07080', fontSize: '13px', marginBottom: '20px' }}>{error}</div>}

                <button type="submit" disabled={loading}
                  style={{ width: '100%', padding: '13px', background: loading ? '#2a2838' : '#f0eeea', border: 'none', borderRadius: '8px', color: '#111010', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s', fontFamily: 'inherit' }}
                  onMouseEnter={e => { if (!loading) e.target.style.background = '#ffffff' }}
                  onMouseLeave={e => { if (!loading) e.target.style.background = '#f0eeea' }}>
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ fontSize: '40px', marginBottom: '20px' }}>📬</div>
              <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#f0eeea', letterSpacing: '-0.5px', marginBottom: '12px' }}>Email envoye !</h2>
              <p style={{ fontSize: '13px', color: '#4a4847', lineHeight: 1.7, marginBottom: '32px' }}>
                Un lien de reinitialisation a ete envoye a <strong style={{ color: '#f0eeea' }}>{email}</strong>. Verifie ta boite mail et clique sur le lien.
              </p>
              <div style={{ padding: '14px 16px', background: 'rgba(155,142,196,0.08)', border: '1px solid rgba(155,142,196,0.2)', borderRadius: '8px', fontSize: '12px', color: '#9b8ec4', lineHeight: 1.6 }}>
                Le lien expire apres 24 heures. Si tu ne vois pas l'email, verifie tes spams.
              </div>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link href="/" style={{ fontSize: '13px', color: '#9b8ec4', textDecoration: 'none', fontWeight: '500' }}>
              ← Retour a la connexion
            </Link>
          </div>

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
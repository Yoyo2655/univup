'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email ou mot de passe incorrect'); setLoading(false); return }
    const { data: userData } = await supabase.from('users').select('role').eq('id', data.user.id).single()
    if (userData?.role === 'admin') router.push('/admin')
    else if (userData?.role === 'prof') router.push('/prof')
    else if (userData?.role === 'eleve') router.push('/eleve')
  }

  const inputStyle = { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f0eeea', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s', fontFamily: 'inherit' }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0e0d0d', fontFamily: "'DM Sans', system-ui, sans-serif", position: 'relative', overflow: 'hidden' }}>
      <style>{`
        .login-left { display: flex; }
        .login-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; position: relative; }
        @media (max-width: 767px) {
          .login-left { display: none !important; }
          .login-right { padding: 40px 24px; align-items: flex-start; padding-top: 60px; }
        }
      `}</style>

      {/* Panneau gauche — caché sur mobile */}
      <div className="login-left" style={{ width: '420px', flexShrink: 0, background: '#111010', flexDirection: 'column', justifyContent: 'space-between', padding: '52px 48px', position: 'relative', overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
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
            Prepare ton concours.<br />
            <span style={{ color: '#9b8ec4', fontWeight: '500' }}>Suis ta progression.</span>
          </p>
          <p style={{ fontSize: '13px', color: '#4a4847', lineHeight: 1.6 }}>
            Kholles, planning, resultats —<br />tout au meme endroit.
          </p>
        </div>
        <div>
          <Link href="/cgv" style={{ fontSize: '11px', color: '#9b8ec4', textDecoration: 'none', letterSpacing: '0.3px', display: 'block', marginBottom: '6px' }}>
            Conditions Generales de Vente →
          </Link>
          <div style={{ fontSize: '11px', color: '#9b8ec4', letterSpacing: '0.3px' }}>© {new Date().getFullYear()} UnivUp</div>
        </div>
      </div>

      {/* Panneau droit */}
      <div className="login-right">
        <svg style={{ position: 'absolute', top: 0, right: 0, opacity: 0.06, pointerEvents: 'none' }} width="400" height="400" viewBox="0 0 400 400">
          <polyline points="400,0 180,0 80,200 400,200" fill="none" stroke="#f0eeea" strokeWidth="12" />
          <polyline points="400,14 186,14 86,214 400,214" fill="none" stroke="#9b8ec4" strokeWidth="12" />
          <polyline points="400,28 192,28 92,228 400,228" fill="none" stroke="#8a1c30" strokeWidth="12" />
        </svg>

        <div style={{ width: '100%', maxWidth: '360px', position: 'relative', zIndex: 1 }}>

          {/* Logo visible uniquement sur mobile */}
          <div style={{ marginBottom: '32px' }}>
            <style>{`.login-logo-mobile { display: none; } @media (max-width: 767px) { .login-logo-mobile { display: block; } }`}</style>
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#f0eeea', letterSpacing: '-0.5px', marginBottom: '6px' }}>Connexion</h2>
          <p style={{ fontSize: '13px', color: '#4a4847', marginBottom: '36px' }}>Accede a ton espace personnel</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6e6c66', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="ton@email.com"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(155,142,196,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6e6c66', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(155,142,196,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
            </div>

            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <Link href="/forgot-password" style={{ fontSize: '12px', color: '#9b8ec4', textDecoration: 'none' }}>
                Mot de passe oublie ?
              </Link>
            </div>

            {error && <div style={{ background: 'rgba(138,28,48,0.15)', border: '1px solid rgba(138,28,48,0.35)', borderRadius: '8px', padding: '10px 14px', color: '#e07080', fontSize: '13px', marginBottom: '20px' }}>{error}</div>}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px', background: loading ? '#2a2838' : '#f0eeea', border: 'none', borderRadius: '8px', color: '#111010', fontSize: '14px', fontWeight: '700', letterSpacing: '0.2px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s', fontFamily: 'inherit' }}
              onMouseEnter={e => { if (!loading) e.target.style.background = '#ffffff' }}
              onMouseLeave={e => { if (!loading) e.target.style.background = '#f0eeea' }}>
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span style={{ fontSize: '13px', color: '#4a4847' }}>Pas encore de compte ? </span>
            <Link href="/register" style={{ fontSize: '13px', color: '#9b8ec4', textDecoration: 'none', fontWeight: '500' }}>Creer mon compte</Link>
          </div>

          <div style={{ display: 'flex', marginTop: '36px' }}>
            <div style={{ height: '2px', flex: 3, background: 'rgba(240,238,234,0.08)' }} />
            <div style={{ height: '2px', flex: 1, background: 'rgba(155,142,196,0.3)' }} />
            <div style={{ height: '2px', flex: 1, background: 'rgba(138,28,48,0.3)' }} />
          </div>

          {/* CGV mobile */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <style>{`.cgv-mobile { display: none; } @media (max-width: 767px) { .cgv-mobile { display: block; } }`}</style>
            <Link href="/cgv" className="cgv-mobile" style={{ fontSize: '11px', color: '#9b8ec4', textDecoration: 'none' }}>
              Conditions Generales de Vente →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
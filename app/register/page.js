'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [role, setRole] = useState('eleve')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRegister(e) {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    if (password.length < 6) { setError('Minimum 6 caracteres'); return }
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    const { error: dbError } = await supabase.from('users').insert({
      id: data.user.id,
      email,
      full_name: fullName,
      role,
      is_active: false
    })

    if (dbError) { setError(dbError.message); setLoading(false); return }

    router.push(role === 'prof' ? '/prof' : '/eleve')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#0e0d0d',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Panneau gauche */}
      <div style={{
        width: '420px',
        flexShrink: 0,
        background: '#111010',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '52px 48px',
        position: 'relative',
        overflow: 'hidden',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, display: 'flex', flexDirection: 'row' }}>
          <div style={{ width: '5px', background: '#111010' }} />
          <div style={{ width: '5px', background: '#9b8ec4' }} />
          <div style={{ width: '5px', background: '#8a1c30' }} />
        </div>

        <img
          src="/Logo1w_univup-removebg.png"
          alt="UnivUp"
          style={{ position: 'absolute', top: '40px', left: '40px', width: '280px', objectFit: 'contain', zIndex: 2 }}
        />

        <div style={{ height: '60px' }} />

        <div>
          <div style={{ display: 'flex', marginBottom: '28px' }}>
            <div style={{ height: '3px', width: '48px', background: '#f0eeea' }} />
            <div style={{ height: '3px', width: '48px', background: '#9b8ec4' }} />
            <div style={{ height: '3px', width: '48px', background: '#8a1c30' }} />
          </div>
          <p style={{ fontSize: '22px', fontWeight: '300', color: '#f0eeea', lineHeight: 1.4, letterSpacing: '-0.3px', marginBottom: '16px' }}>
            Rejoins UnivUp.<br />
            <span style={{ color: '#9b8ec4', fontWeight: '500' }}>Prepare ton concours.</span>
          </p>
          <p style={{ fontSize: '13px', color: '#4a4847', lineHeight: 1.6 }}>
            Cree ton compte gratuitement.<br />
            Ton acces sera active apres confirmation.
          </p>
        </div>

        <div style={{ fontSize: '11px', color: '#2e2d2b', letterSpacing: '0.3px' }}>
          © {new Date().getFullYear()} UnivUp
        </div>
      </div>

      {/* Panneau droit */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative' }}>
        <svg style={{ position: 'absolute', top: 0, right: 0, opacity: 0.06, pointerEvents: 'none' }} width="400" height="400" viewBox="0 0 400 400">
          <polyline points="400,0 180,0 80,200 400,200" fill="none" stroke="#f0eeea" strokeWidth="12" />
          <polyline points="400,14 186,14 86,214 400,214" fill="none" stroke="#9b8ec4" strokeWidth="12" />
          <polyline points="400,28 192,28 92,228 400,228" fill="none" stroke="#8a1c30" strokeWidth="12" />
        </svg>

        <div style={{ width: '100%', maxWidth: '360px', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#f0eeea', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            Creer mon compte
          </h2>
          <p style={{ fontSize: '13px', color: '#4a4847', marginBottom: '36px' }}>
            Remplis les informations ci-dessous
          </p>

          <form onSubmit={handleRegister}>

            {/* Role */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6e6c66', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Je suis
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['eleve', 'prof'].map(r => (
                  <div
                    key={r}
                    onClick={() => setRole(r)}
                    style={{ flex: 1, padding: '12px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', border: role === r ? '1px solid rgba(155,142,196,0.5)' : '1px solid rgba(255,255,255,0.08)', background: role === r ? 'rgba(155,142,196,0.1)' : 'rgba(255,255,255,0.04)', color: role === r ? '#9b8ec4' : '#6e6c66', transition: 'all 0.15s' }}
                  >
                    {r === 'eleve' ? 'Un eleve' : 'Un professeur'}
                  </div>
                ))}
              </div>
            </div>

            {/* Nom */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6e6c66', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Nom complet
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                placeholder="Prenom Nom"
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f0eeea', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = 'rgba(155,142,196,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6e6c66', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="ton@email.com"
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f0eeea', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = 'rgba(155,142,196,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6e6c66', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Min. 6 caracteres"
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f0eeea', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = 'rgba(155,142,196,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            {/* Confirmer */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6e6c66', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                placeholder="Retape ton mot de passe"
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f0eeea', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = 'rgba(155,142,196,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(138,28,48,0.15)', border: '1px solid rgba(138,28,48,0.35)', borderRadius: '8px', padding: '10px 14px', color: '#e07080', fontSize: '13px', marginBottom: '20px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '13px', background: loading ? '#2a2838' : '#f0eeea', border: 'none', borderRadius: '8px', color: '#111010', fontSize: '14px', fontWeight: '700', letterSpacing: '0.2px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s', fontFamily: 'inherit' }}
              onMouseEnter={e => { if (!loading) e.target.style.background = '#ffffff' }}
              onMouseLeave={e => { if (!loading) e.target.style.background = '#f0eeea' }}
            >
              {loading ? 'Creation...' : 'Creer mon compte'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span style={{ fontSize: '13px', color: '#4a4847' }}>Deja un compte ? </span>
            <Link href="/" style={{ fontSize: '13px', color: '#9b8ec4', textDecoration: 'none', fontWeight: '500' }}>Se connecter</Link>
          </div>

          <div style={{ fontSize: '11px', color: '#2e2d2b', textAlign: 'center', marginTop: '16px', lineHeight: 1.6 }}>
            Ton acces sera active manuellement par UnivUp apres confirmation.
          </div>

          <div style={{ display: 'flex', marginTop: '28px' }}>
            <div style={{ height: '2px', flex: 3, background: 'rgba(240,238,234,0.08)' }} />
            <div style={{ height: '2px', flex: 1, background: 'rgba(155,142,196,0.3)' }} />
            <div style={{ height: '2px', flex: 1, background: 'rgba(138,28,48,0.3)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

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

    if (error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
      return
    }

    // Récupérer le rôle de l'utilisateur
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (userData?.role === 'admin') router.push('/admin')
    else if (userData?.role === 'prof') router.push('/prof')
    else if (userData?.role === 'eleve') router.push('/eleve')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0f0f11', fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        background: '#18181c', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '400px'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: '#e8e6e0', fontSize: '24px', fontWeight: '600', marginBottom: '6px' }}>
            UnivUp
          </h1>
          <p style={{ color: '#6e6c66', fontSize: '14px' }}>Connecte-toi à ton espace</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#9e9c96', fontSize: '12px', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '10px 14px', background: '#1e1e24',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                color: '#e8e6e0', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#9e9c96', fontSize: '12px', marginBottom: '6px' }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '10px 14px', background: '#1e1e24',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                color: '#e8e6e0', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: '8px', padding: '10px 14px', color: '#f87171',
              fontSize: '13px', marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '11px', background: '#a78bfa',
              border: 'none', borderRadius: '8px', color: '#1a1228',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer', opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
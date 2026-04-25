'use client'
import { useState, useEffect } from 'react'

export default function ProfsPage() {
  const [profs, setProfs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchProfs() }, [])

  async function fetchProfs() {
    const { supabase } = await import('../../../lib/supabase')
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'prof')
      .order('created_at', { ascending: false })
    setProfs(data || [])
    setLoading(false)
  }

  async function createProf(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const res = await fetch('/api/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role: 'prof' })
    })

    const data = await res.json()
    if (data.error) { setError(data.error); setSaving(false); return }

    setForm({ full_name: '', email: '', password: '' })
    setShowForm(false)
    fetchProfs()
    setSaving(false)
  }

  async function toggleAccess(id, current) {
    const { supabase } = await import('../../../lib/supabase')
    await supabase.from('users').update({ is_active: !current }).eq('id', id)
    fetchProfs()
  }

  const s = {
    page: { color: 'var(--text)' },
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid var(--border)' },
    title: { fontSize: '18px', fontWeight: '600', color: 'var(--text)' },
    btn: { padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    btnPrimary: { background: 'var(--teal)', color: '#0d1f18' },
    btnGhost: { background: 'rgba(255,255,255,0.06)', color: 'var(--muted2)', border: '1px solid var(--border)' },
    content: { padding: '24px 28px' },
    card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', fontSize: '10px', fontWeight: '500', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px', borderBottom: '1px solid var(--border)' },
    td: { padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', color: 'var(--muted2)' },
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
    modalBox: { background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px' },
    label: { display: 'block', fontSize: '12px', color: 'var(--muted2)', marginBottom: '6px' },
    input: { width: '100%', padding: '9px 12px', background: 'var(--surface2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', outline: 'none', boxSizing: 'border-box', marginBottom: '14px' },
  }

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <h1 style={s.title}>Professeurs</h1>
        <button style={{...s.btn, ...s.btnPrimary}} onClick={() => setShowForm(true)}>+ Créer un prof</button>
      </div>

      <div style={s.content}>
        <div style={s.card}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Chargement…</div>
          ) : profs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
              Aucun prof pour le moment — crée le premier compte.
            </div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Nom</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Séances ce mois</th>
                  <th style={s.th}>Accès</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {profs.map(prof => (
                  <tr key={prof.id}>
                    <td style={{...s.td, color: 'var(--text)', fontWeight: '500'}}>{prof.full_name}</td>
                    <td style={s.td}>{prof.email}</td>
                    <td style={s.td}>—</td>
                    <td style={s.td}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
                        background: prof.is_active ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.1)',
                        color: prof.is_active ? 'var(--teal)' : 'var(--coral)'
                      }}>
                        {prof.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td style={s.td}>
                      <button
                        onClick={() => toggleAccess(prof.id, prof.is_active)}
                        style={{...s.btn, ...s.btnGhost, padding: '4px 10px', fontSize: '11px'}}
                      >
                        {prof.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <div style={s.modal} onClick={() => setShowForm(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
              Créer un prof
            </h2>
            <form onSubmit={createProf}>
              <label style={s.label}>Nom complet</label>
              <input style={s.input} value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required placeholder="Prénom Nom" />
              <label style={s.label}>Email</label>
              <input style={s.input} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="prof@email.com" />
              <label style={s.label}>Mot de passe provisoire</label>
              <input style={s.input} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required placeholder="Min. 6 caractères" minLength={6} />
              {error && <div style={{ color: 'var(--coral)', fontSize: '12px', marginBottom: '12px' }}>{error}</div>}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" style={{...s.btn, ...s.btnGhost}} onClick={() => setShowForm(false)}>Annuler</button>
                <button type="submit" style={{...s.btn, ...s.btnPrimary}} disabled={saving}>
                  {saving ? 'Création…' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
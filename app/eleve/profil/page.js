'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useTheme, getTheme } from '../../context/ThemeContext'

const ECOLES = ['CentraleSupelec', 'Centrale Lyon', 'Centrale Marseille', 'Centrale Nantes', 'Centrale Lille', 'Centrale Casablanca']
const ECOLES_GEI = ['X', 'Mines Paris', 'Mines Saint-Etienne', 'Mines Nancy', 'ENSTA', 'ENSAE', 'ESTP', 'Ponts et Chaussees', 'Telecom Paris', 'ISAE-Supaero']
const DOMINANTES = ['Maths', 'Physique', 'Info']

export default function ProfilPage() {
  const { theme, isDark } = useTheme()
  const c = getTheme(theme)

  const [user, setUser] = useState(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [profil, setProfil] = useState({ fac_origine: '', statut_etudiant: 'L3', annee_concours: new Date().getFullYear() + 1, dominante_centrale: 'Maths', concours_vises: [], ecoles_cibles: [], ecoles_gei: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { fetchProfil() }, [])

  async function fetchProfil() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUser(user)
    const { data: userData } = await supabase.from('users').select('full_name, email').eq('id', user.id).single()
    if (userData) { setUserName(userData.full_name); setUserEmail(userData.email) }
    const { data: profilData } = await supabase.from('profils_eleves').select('*').eq('eleve_id', user.id).single()
    if (profilData) setProfil(profilData)
    setLoading(false)
  }

  async function saveProfil(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('profils_eleves').upsert({ eleve_id: user.id, ...profil, updated_at: new Date().toISOString() })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function toggleItem(field, item) {
    setProfil(prev => {
      const list = prev[field] || []
      return { ...prev, [field]: list.includes(item) ? list.filter(x => x !== item) : [...list, item] }
    })
  }

  const s = {
    card: { background: c.surface, border: '1px solid ' + c.border, borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)' },
    cardTitle: { fontSize: '14px', fontWeight: '600', color: c.text, marginBottom: '16px' },
    label: { display: 'block', fontSize: '12px', color: c.muted, marginBottom: '6px', marginTop: '14px' },
    input: { width: '100%', padding: '9px 12px', background: c.surface2, border: '1px solid ' + c.border2, borderRadius: '8px', color: c.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
    select: { width: '100%', padding: '9px 12px', background: c.surface2, border: '1px solid ' + c.border2, borderRadius: '8px', color: c.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
    chip: { padding: '5px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', border: '1px solid ' + c.border, fontWeight: '500', display: 'inline-block', margin: '3px', transition: 'all 0.15s' },
    btn: { padding: '9px 18px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' },
    btnPrimary: { background: c.purple, color: isDark ? '#1a1228' : '#ffffff' },
  }

  if (loading) return <div style={{ padding: '40px', color: c.muted, textAlign: 'center', background: c.bg, minHeight: '100vh' }}>Chargement...</div>

  return (
    <div style={{ color: c.text, background: c.bg, minHeight: '100vh', fontFamily: "'DM Sans', system-ui", transition: 'background 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid ' + c.border, background: c.surface, transition: 'background 0.2s' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: c.text, letterSpacing: '-0.3px', margin: 0 }}>Mon profil</h1>
        <button onClick={saveProfil} disabled={saving} style={{ ...s.btn, ...s.btnPrimary, opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Sauvegarde...' : saved ? '✓ Sauvegarde !' : 'Sauvegarder'}
        </button>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: '680px' }}>
        <form onSubmit={saveProfil}>

          {/* Infos personnelles */}
          <div style={s.card}>
            <div style={s.cardTitle}>Informations personnelles</div>
            <div style={{ display: 'flex', gap: '12px', padding: '10px 14px', background: c.surface2, borderRadius: '8px', marginBottom: '16px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: isDark ? c.blue + '22' : c.blue + '15', color: c.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px' }}>
                {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: c.text }}>{userName}</div>
                <div style={{ fontSize: '12px', color: c.muted }}>{userEmail}</div>
              </div>
            </div>
            <label style={{ ...s.label, marginTop: 0 }}>Universite d'origine</label>
            <input style={s.input} value={profil.fac_origine || ''} onChange={e => setProfil({ ...profil, fac_origine: e.target.value })} placeholder="Ex: Universite Paris-Saclay, Sorbonne Universite..." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={s.label}>Statut</label>
                <select style={s.select} value={profil.statut_etudiant || 'L3'} onChange={e => setProfil({ ...profil, statut_etudiant: e.target.value })}>
                  <option value="L3">L3</option>
                  <option value="M1">M1</option>
                  <option value="redoublant">L3 redoublant</option>
                </select>
              </div>
              <div>
                <label style={s.label}>Annee de concours</label>
                <select style={s.select} value={profil.annee_concours || 2026} onChange={e => setProfil({ ...profil, annee_concours: parseInt(e.target.value) })}>
                  {[2025, 2026, 2027, 2028, 2029].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Concours Centrale */}
          <div style={s.card}>
            <div style={s.cardTitle}>Concours Centrale-Supelec</div>
            <label style={{ ...s.label, marginTop: 0 }}>Dominante</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {DOMINANTES.map(d => (
                <div key={d} onClick={() => setProfil({ ...profil, dominante_centrale: d })} style={{ ...s.chip, background: profil.dominante_centrale === d ? c.purple : 'none', color: profil.dominante_centrale === d ? (isDark ? '#1a1228' : '#ffffff') : c.muted2, borderColor: profil.dominante_centrale === d ? c.purple : c.border }}>
                  {d}
                </div>
              ))}
            </div>
            <label style={s.label}>Ecoles cibles</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {ECOLES.map(e => (
                <div key={e} onClick={() => toggleItem('ecoles_cibles', e)} style={{ ...s.chip, background: profil.ecoles_cibles?.includes(e) ? c.blue : 'none', color: profil.ecoles_cibles?.includes(e) ? (isDark ? '#0d1828' : '#ffffff') : c.muted2, borderColor: profil.ecoles_cibles?.includes(e) ? c.blue : c.border, fontSize: '11px' }}>
                  {e}
                </div>
              ))}
            </div>
          </div>

          {/* GEI */}
          <div style={s.card}>
            <div style={s.cardTitle}>Ecoles GEI visees</div>
            <div style={{ fontSize: '12px', color: c.muted, marginBottom: '12px' }}>Selectionne les ecoles pour lesquelles tu veux t'entrainer aux QCM GEI</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {ECOLES_GEI.map(e => (
                <div key={e} onClick={() => toggleItem('ecoles_gei', e)} style={{ ...s.chip, background: profil.ecoles_gei?.includes(e) ? c.amber : 'none', color: profil.ecoles_gei?.includes(e) ? (isDark ? '#1a1228' : '#ffffff') : c.muted2, borderColor: profil.ecoles_gei?.includes(e) ? c.amber : c.border }}>
                  {e}
                </div>
              ))}
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}
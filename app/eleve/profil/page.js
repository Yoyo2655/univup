'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { t } from '../../../lib/theme'

const CONCOURS = ['Centrale-Supélec', 'Mines-Ponts', 'X-ENS', 'CCINP']
const ECOLES = ['CentraleSupélec', 'Centrale Lyon', 'Centrale Marseille', 'Centrale Nantes', 'Centrale Lille', 'Centrale Casablanca']
const ECOLES_GEI = ['X', 'Mines Paris', 'Mines Saint-Etienne', 'Mines Nancy', 'ENSTA', 'ENSAE', 'ESTP', 'Ponts et Chaussées', 'Télécom Paris', 'ISAE-Supaero']
const DOMINANTES = ['Maths', 'Physique', 'Info']

export default function ProfilPage() {
  const [user, setUser] = useState(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [profil, setProfil] = useState({
    fac_origine: '',
    statut_etudiant: 'L3',
    annee_concours: new Date().getFullYear() + 1,
    dominante_centrale: 'Maths',
    concours_vises: [],
    ecoles_cibles: [],
    ecoles_gei: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { fetchProfil() }, [])

  async function fetchProfil() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUser(user)

    const { data: userData } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', user.id)
      .single()
    if (userData) {
      setUserName(userData.full_name)
      setUserEmail(userData.email)
    }

    const { data: profilData } = await supabase
      .from('profils_eleves')
      .select('*')
      .eq('eleve_id', user.id)
      .single()

    if (profilData) setProfil(profilData)
    setLoading(false)
  }

  async function saveProfil(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('profils_eleves').upsert({
      eleve_id: user.id,
      ...profil,
      updated_at: new Date().toISOString()
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function toggleItem(field, item) {
    setProfil(prev => {
      const list = prev[field] || []
      return {
        ...prev,
        [field]: list.includes(item) ? list.filter(x => x !== item) : [...list, item]
      }
    })
  }

  const s = {
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: `1px solid ${t.border}` },
    title: { fontSize: '18px', fontWeight: '600', color: t.text },
    content: { padding: '24px 28px', maxWidth: '680px' },
    card: { background: t.surface, border: `1px solid ${t.border}`, borderRadius: '12px', padding: '24px', marginBottom: '16px' },
    cardTitle: { fontSize: '14px', fontWeight: '600', color: t.text, marginBottom: '16px' },
    label: { display: 'block', fontSize: '12px', color: t.muted, marginBottom: '6px', marginTop: '14px' },
    input: { width: '100%', padding: '9px 12px', background: t.surface2, border: `1px solid ${t.border2}`, borderRadius: '8px', color: t.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
    select: { width: '100%', padding: '9px 12px', background: t.surface2, border: `1px solid ${t.border2}`, borderRadius: '8px', color: t.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
    chip: { padding: '5px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', border: `1px solid ${t.border2}`, fontWeight: '500', display: 'inline-block', margin: '3px' },
    btn: { padding: '9px 18px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    btnPrimary: { background: t.purple, color: '#1a1228' },
  }

  if (loading) return <div style={{ padding: '40px', color: t.muted, textAlign: 'center' }}>Chargement…</div>

  return (
    <div style={{ color: t.text }}>
      <div style={s.topbar}>
        <h1 style={s.title}>Mon profil</h1>
        <button
          onClick={saveProfil}
          disabled={saving}
          style={{ ...s.btn, ...s.btnPrimary, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Sauvegarde…' : saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
        </button>
      </div>

      <div style={s.content}>
        <form onSubmit={saveProfil}>

          {/* Infos personnelles */}
          <div style={s.card}>
            <div style={s.cardTitle}>Informations personnelles</div>
            <div style={{ display: 'flex', gap: '12px', padding: '10px 14px', background: t.surface2, borderRadius: '8px', marginBottom: '16px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${t.blue}22`, color: t.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px' }}>
                {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: t.text }}>{userName}</div>
                <div style={{ fontSize: '12px', color: t.muted }}>{userEmail}</div>
              </div>
            </div>

            <label style={{ ...s.label, marginTop: 0 }}>Université d'origine</label>
            <input
              style={s.input}
              value={profil.fac_origine || ''}
              onChange={e => setProfil({ ...profil, fac_origine: e.target.value })}
              placeholder="Ex: Université Paris-Saclay, Sorbonne Université…"
            />

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
                <label style={s.label}>Année de concours</label>
                <select style={s.select} value={profil.annee_concours || 2026} onChange={e => setProfil({ ...profil, annee_concours: parseInt(e.target.value) })}>
                  {[2025, 2026, 2027, 2028,2029].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Concours Centrale */}
          <div style={s.card}>
            <div style={s.cardTitle}>Concours Centrale-Supélec</div>

            <label style={{ ...s.label, marginTop: 0 }}>Dominante</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {DOMINANTES.map(d => (
                <div
                  key={d}
                  onClick={() => setProfil({ ...profil, dominante_centrale: d })}
                  style={{
                    ...s.chip,
                    background: profil.dominante_centrale === d ? t.purple : 'none',
                    color: profil.dominante_centrale === d ? '#1a1228' : t.muted2,
                    borderColor: profil.dominante_centrale === d ? t.purple : t.border2,
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
            <label style={s.label}>Écoles cibles</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {ECOLES.map(e => (
                <div
                  key={e}
                  onClick={() => toggleItem('ecoles_cibles', e)}
                  style={{
                    ...s.chip,
                    background: profil.ecoles_cibles?.includes(e) ? t.blue : 'none',
                    color: profil.ecoles_cibles?.includes(e) ? '#0d1828' : t.muted2,
                    borderColor: profil.ecoles_cibles?.includes(e) ? t.blue : t.border2,
                    fontSize: '11px'
                  }}
                >
                  {e}
                </div>
              ))}
            </div>
          </div>

          {/* GEI */}
          <div style={s.card}>
            <div style={s.cardTitle}>Écoles GEI visées</div>
            <div style={{ fontSize: '12px', color: t.muted, marginBottom: '12px' }}>
              Sélectionne les écoles pour lesquelles tu veux t'entraîner aux QCM GEI
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {ECOLES_GEI.map(e => (
                <div
                  key={e}
                  onClick={() => toggleItem('ecoles_gei', e)}
                  style={{
                    ...s.chip,
                    background: profil.ecoles_gei?.includes(e) ? t.amber : 'none',
                    color: profil.ecoles_gei?.includes(e) ? '#1a1228' : t.muted2,
                    borderColor: profil.ecoles_gei?.includes(e) ? t.amber : t.border2,
                  }}
                >
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
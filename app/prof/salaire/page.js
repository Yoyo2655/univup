'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useTheme, getTheme } from '../../context/ThemeContext'

export default function ProfSalairePage() {
  const { theme, isDark } = useTheme()
  const c = getTheme(theme)

  const [seances, setSeances] = useState([])
  const [bareme, setBareme] = useState(null)
  const [versements, setVersements] = useState([])
  const [loading, setLoading] = useState(true)
  const [mois, setMois] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const MOIS_LABELS = ['Janvier','Fevrier','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre']

  useEffect(() => { fetchData() }, [mois])

  async function fetchData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [year, month] = mois.split('-').map(Number)
    const debut = `${mois}-01`
    const fin = new Date(year, month, 1).toISOString()
    const [seancesRes, baremeRes, versRes] = await Promise.all([
      supabase.from('seances').select('*, seance_eleves(eleve_id)').eq('prof_id', user.id).eq('statut', 'effectuee').gte('date_debut', debut).lt('date_debut', fin).order('date_debut', { ascending: false }),
      supabase.from('bareme_profs').select('*').eq('prof_id', user.id).single(),
      supabase.from('salaires_profs').select('*').eq('prof_id', user.id).eq('mois', `${mois}-01`).order('date_versement', { ascending: false })
    ])
    setSeances(seancesRes.data || [])
    setBareme(baremeRes.data || null)
    setVersements(versRes.data || [])
    setLoading(false)
  }

  function calculMontant(seance) {
    if (!bareme) return 0
    const dureeH = (new Date(seance.date_fin) - new Date(seance.date_debut)) / 3600000
    const nbEleves = seance.seance_eleves?.length || 0
    if (seance.type === 'kholle') return bareme.tarif_kholle * dureeH
    if (nbEleves <= 1) return bareme.tarif_cours_solo * dureeH
    const supplement = nbEleves > bareme.seuil_eleves ? (nbEleves - bareme.seuil_eleves) * bareme.tarif_par_eleve : 0
    return (bareme.tarif_cours_groupe + supplement) * dureeH
  }

  const totalDu = seances.reduce((sum, s) => sum + calculMontant(s), 0)
  const totalVerse = versements.reduce((sum, v) => sum + parseFloat(v.montant_verse || 0), 0)
  const resteARecevoir = totalDu - totalVerse

  const TYPES = {
    cours: { label: 'Cours', color: c.purple },
    kholle: { label: 'Kholle', color: c.teal },
    entretien: { label: 'Entretien', color: c.coral }
  }

  const card = { background: c.surface, border: '1px solid ' + c.border, borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)' }
  const cardHeader = { padding: '14px 20px', borderBottom: '1px solid ' + c.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
  const th = { textAlign: 'left', fontSize: '10px', fontWeight: '500', color: c.muted, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px', borderBottom: '1px solid ' + c.border }
  const td = { padding: '12px 16px', borderBottom: '1px solid ' + c.border, fontSize: '13px', color: c.muted2 }
  const statCard = { background: c.surface, border: '1px solid ' + c.border, borderRadius: '12px', padding: '16px', boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)' }

  const moisOptions = Array.from({ length: 12 }, (_, i) => {
    const now = new Date()
    const d = new Date(now.getFullYear(), i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return <option key={val} value={val}>{MOIS_LABELS[i]} {d.getFullYear()}</option>
  })

  if (loading) return (
    <div style={{ padding: '40px', color: c.muted, textAlign: 'center', background: c.bg, minHeight: '100vh' }}>Chargement...</div>
  )

  return (
    <div style={{ color: c.text, background: c.bg, minHeight: '100vh', fontFamily: "'DM Sans', system-ui", transition: 'background 0.2s' }}>

      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid ' + c.border, background: c.surface, transition: 'background 0.2s' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: c.text, letterSpacing: '-0.3px', margin: 0 }}>Mon salaire</h1>
        <select value={mois} onChange={e => setMois(e.target.value)} style={{ background: c.surface2, border: '1px solid ' + c.border2, borderRadius: '8px', padding: '7px 12px', color: c.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}>
          {moisOptions}
        </select>
      </div>

      <div style={{ padding: '28px 32px' }}>
        {!bareme ? (
          <div style={card}>
            <div style={{ padding: '40px', textAlign: 'center', color: c.muted }}>
              Aucun bareme defini — contacte l'admin pour configurer ton tarif.
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
              <div style={{ ...statCard, borderTop: isDark ? 'none' : '3px solid ' + c.purple }}>
                <div style={{ fontSize: '11px', color: c.muted, marginBottom: '8px' }}>Total du</div>
                <div style={{ fontSize: '28px', fontWeight: '600', color: c.purple }}>{totalDu.toFixed(2)}EUR</div>
                <div style={{ fontSize: '11px', color: c.muted, marginTop: '4px' }}>{seances.length} seance{seances.length > 1 ? 's' : ''}</div>
              </div>
              <div style={{ ...statCard, borderTop: isDark ? 'none' : '3px solid ' + c.teal }}>
                <div style={{ fontSize: '11px', color: c.muted, marginBottom: '8px' }}>Deja verse</div>
                <div style={{ fontSize: '28px', fontWeight: '600', color: c.teal }}>{totalVerse.toFixed(2)}EUR</div>
                <div style={{ fontSize: '11px', color: c.muted, marginTop: '4px' }}>{versements.length} versement{versements.length > 1 ? 's' : ''}</div>
              </div>
              <div style={{ ...statCard, borderTop: isDark ? 'none' : '3px solid ' + (resteARecevoir > 0 ? c.amber : c.teal) }}>
                <div style={{ fontSize: '11px', color: c.muted, marginBottom: '8px' }}>Reste a recevoir</div>
                <div style={{ fontSize: '28px', fontWeight: '600', color: resteARecevoir > 0 ? c.amber : c.teal }}>
                  {resteARecevoir > 0 ? resteARecevoir.toFixed(2) + 'EUR' : 'Solde'}
                </div>
              </div>
            </div>

            {/* Séances */}
            <div style={card}>
              <div style={cardHeader}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: c.text }}>Seances effectuees</span>
                <span style={{ fontSize: '11px', color: c.muted }}>{seances.length} seance{seances.length > 1 ? 's' : ''}</span>
              </div>
              {seances.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: c.muted, fontSize: '13px' }}>Aucune seance effectuee ce mois.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Date', 'Titre', 'Type', 'Duree', 'Eleves', 'Montant'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {seances.map(seance => {
                      const dureeH = (new Date(seance.date_fin) - new Date(seance.date_debut)) / 3600000
                      const nbEleves = seance.seance_eleves?.length || 0
                      const montant = calculMontant(seance)
                      return (
                        <tr key={seance.id}>
                          <td style={td}>{new Date(seance.date_debut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</td>
                          <td style={{ ...td, color: c.text }}>{seance.titre}</td>
                          <td style={td}>
                            <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: TYPES[seance.type]?.color + (isDark ? '22' : '15'), color: TYPES[seance.type]?.color }}>
                              {TYPES[seance.type]?.label}
                            </span>
                          </td>
                          <td style={td}>{dureeH}h</td>
                          <td style={td}>{nbEleves}</td>
                          <td style={{ ...td, color: c.purple, fontFamily: 'monospace', fontWeight: '600' }}>{montant.toFixed(2)}EUR</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Versements */}
            {versements.length > 0 && (
              <div style={card}>
                <div style={cardHeader}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: c.text }}>Versements recus</span>
                  <span style={{ fontSize: '11px', color: c.muted }}>{versements.length} versement{versements.length > 1 ? 's' : ''}</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Date', 'Montant', 'Statut'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {versements.map(v => (
                      <tr key={v.id}>
                        <td style={td}>{new Date(v.date_versement).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                        <td style={{ ...td, color: c.teal, fontFamily: 'monospace', fontWeight: '600' }}>+{v.montant_verse}EUR</td>
                        <td style={td}>
                          <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: v.statut === 'solde' ? (isDark ? 'rgba(52,211,153,0.12)' : 'rgba(5,150,105,0.08)') : (isDark ? 'rgba(251,191,36,0.1)' : 'rgba(217,119,6,0.08)'), color: v.statut === 'solde' ? c.teal : c.amber }}>
                            {v.statut === 'solde' ? 'Solde' : 'Partiel'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Barème */}
            <div style={card}>
              <div style={cardHeader}><span style={{ fontSize: '13px', fontWeight: '600', color: c.text }}>Mon bareme</span></div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                  {[
                    { label: 'Kholle', value: bareme.tarif_kholle + 'EUR/h' },
                    { label: 'Cours individuel', value: bareme.tarif_cours_solo + 'EUR/h' },
                    { label: 'Cours collectif', value: bareme.tarif_cours_groupe + 'EUR/h' },
                  ].map(item => (
                    <div key={item.label} style={{ background: c.surface2, borderRadius: '8px', padding: '12px 14px' }}>
                      <div style={{ fontSize: '11px', color: c.muted, marginBottom: '4px' }}>{item.label}</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', fontFamily: 'monospace', color: c.text }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                {bareme.tarif_par_eleve && (
                  <div style={{ fontSize: '12px', color: c.muted, marginTop: '12px' }}>
                    + {bareme.tarif_par_eleve}EUR/eleve/h au-dela de {bareme.seuil_eleves} eleves
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
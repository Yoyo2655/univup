'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function ProfSalairePage() {
  const [seances, setSeances] = useState([])
  const [bareme, setBareme] = useState(null)
  const [versements, setVersements] = useState([])
  const [loading, setLoading] = useState(true)
  const [mois, setMois] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const MOIS_LABELS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

  useEffect(() => { fetchData() }, [mois])

  async function fetchData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [year, month] = mois.split('-').map(Number)
    const debut = `${mois}-01`
    const fin = new Date(year, month, 1).toISOString()

    const [seancesRes, baremeRes, versRes] = await Promise.all([
      supabase.from('seances')
        .select(`*, seance_eleves(eleve_id)`)
        .eq('prof_id', user.id)
        .eq('statut', 'effectuee')
        .gte('date_debut', debut)
        .lt('date_debut', fin)
        .order('date_debut', { ascending: false }),
      supabase.from('bareme_profs')
        .select('*')
        .eq('prof_id', user.id)
        .single(),
      supabase.from('salaires_profs')
        .select('*')
        .eq('prof_id', user.id)
        .eq('mois', `${mois}-01`)
        .order('date_versement', { ascending: false })
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
    cours: { label: 'Cours', color: '#a78bfa' },
    kholle: { label: 'Khôlle', color: '#34d399' },
    entretien: { label: 'Entretien', color: '#f87171' }
  }

  const s = {
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
    title: { fontSize: '18px', fontWeight: '600', color: '#e8e6e0' },
    content: { padding: '24px 28px' },
    card: { background: '#18181c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' },
    cardHeader: { padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    cardTitle: { fontSize: '13px', fontWeight: '600', color: '#e8e6e0' },
    cardBody: { padding: '20px' },
    th: { textAlign: 'left', fontSize: '10px', fontWeight: '500', color: '#6e6c66', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
    td: { padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', color: '#9e9c96' },
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' },
    statCard: { background: '#18181c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px' },
  }

  if (loading) return (
    <div style={{ padding: '40px', color: '#6e6c66', textAlign: 'center' }}>Chargement…</div>
  )

  return (
    <div style={{ color: '#e8e6e0' }}>
      <div style={s.topbar}>
        <h1 style={s.title}>Mon salaire</h1>
        <select
          value={mois}
          onChange={e => setMois(e.target.value)}
          style={{ background: '#1e1e24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '7px 12px', color: '#e8e6e0', fontSize: '13px', outline: 'none' }}
        >
          {Array.from({ length: 12 }, (_, i) => {
            const d = new Date(2026, i, 1)
            const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            return <option key={val} value={val}>{MOIS_LABELS[i]} 2026</option>
          })}
        </select>
      </div>

      <div style={s.content}>
        {!bareme ? (
          <div style={{ ...s.card }}>
            <div style={{ padding: '40px', textAlign: 'center', color: '#6e6c66' }}>
              Aucun barème défini — contacte l'admin pour configurer ton tarif.
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
              <div style={s.statCard}>
                <div style={{ fontSize: '11px', color: '#6e6c66', marginBottom: '8px' }}>Total dû</div>
                <div style={{ fontSize: '28px', fontWeight: '600', color: '#a78bfa' }}>{totalDu.toFixed(2)}€</div>
                <div style={{ fontSize: '11px', color: '#6e6c66', marginTop: '4px' }}>{seances.length} séance{seances.length > 1 ? 's' : ''}</div>
              </div>
              <div style={s.statCard}>
                <div style={{ fontSize: '11px', color: '#6e6c66', marginBottom: '8px' }}>Déjà versé</div>
                <div style={{ fontSize: '28px', fontWeight: '600', color: '#34d399' }}>{totalVerse.toFixed(2)}€</div>
                <div style={{ fontSize: '11px', color: '#6e6c66', marginTop: '4px' }}>{versements.length} versement{versements.length > 1 ? 's' : ''}</div>
              </div>
              <div style={s.statCard}>
                <div style={{ fontSize: '11px', color: '#6e6c66', marginBottom: '8px' }}>Reste à recevoir</div>
                <div style={{ fontSize: '28px', fontWeight: '600', color: resteARecevoir > 0 ? '#fbbf24' : '#34d399' }}>
                  {resteARecevoir > 0 ? `${resteARecevoir.toFixed(2)}€` : '✓ Soldé'}
                </div>
              </div>
            </div>

            {/* Détail séances */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}>Séances effectuées</span>
                <span style={{ fontSize: '11px', color: '#6e6c66' }}>{seances.length} séance{seances.length > 1 ? 's' : ''}</span>
              </div>
              {seances.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#6e6c66', fontSize: '13px' }}>
                  Aucune séance effectuée ce mois.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Date', 'Titre', 'Type', 'Durée', 'Élèves', 'Montant'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {seances.map(seance => {
                      const dureeH = (new Date(seance.date_fin) - new Date(seance.date_debut)) / 3600000
                      const nbEleves = seance.seance_eleves?.length || 0
                      const montant = calculMontant(seance)
                      return (
                        <tr key={seance.id}>
                          <td style={s.td}>
                            {new Date(seance.date_debut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                          </td>
                          <td style={{ ...s.td, color: '#e8e6e0' }}>{seance.titre}</td>
                          <td style={s.td}>
                            <span style={{
                              padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
                              background: TYPES[seance.type]?.color + '22',
                              color: TYPES[seance.type]?.color
                            }}>
                              {TYPES[seance.type]?.label}
                            </span>
                          </td>
                          <td style={s.td}>{dureeH}h</td>
                          <td style={s.td}>{nbEleves}</td>
                          <td style={{ ...s.td, color: '#a78bfa', fontFamily: 'monospace', fontWeight: '600' }}>
                            {montant.toFixed(2)}€
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Historique versements */}
            {versements.length > 0 && (
              <div style={s.card}>
                <div style={s.cardHeader}>
                  <span style={s.cardTitle}>Versements reçus</span>
                  <span style={{ fontSize: '11px', color: '#6e6c66' }}>{versements.length} versement{versements.length > 1 ? 's' : ''}</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Date', 'Montant', 'Statut'].map(h => <th key={h} style={s.th}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {versements.map(v => (
                      <tr key={v.id}>
                        <td style={s.td}>
                          {new Date(v.date_versement).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </td>
                        <td style={{ ...s.td, color: '#34d399', fontFamily: 'monospace', fontWeight: '600' }}>
                          +{v.montant_verse}€
                        </td>
                        <td style={s.td}>
                          <span style={{
                            padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
                            background: v.statut === 'solde' ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.1)',
                            color: v.statut === 'solde' ? '#34d399' : '#fbbf24'
                          }}>
                            {v.statut === 'solde' ? 'Soldé' : 'Partiel'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Barème info */}
            <div style={s.card}>
              <div style={s.cardHeader}><span style={s.cardTitle}>Mon barème</span></div>
              <div style={s.cardBody}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                  {[
                    { label: 'Khôlle', value: `${bareme.tarif_kholle}€/h` },
                    { label: 'Cours individuel', value: `${bareme.tarif_cours_solo}€/h` },
                    { label: 'Cours collectif', value: `${bareme.tarif_cours_groupe}€/h` },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#1e1e24', borderRadius: '8px', padding: '12px 14px' }}>
                      <div style={{ fontSize: '11px', color: '#6e6c66', marginBottom: '4px' }}>{item.label}</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', fontFamily: 'monospace', color: '#e8e6e0' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                {bareme.tarif_par_eleve && (
                  <div style={{ fontSize: '12px', color: '#6e6c66', marginTop: '12px' }}>
                    + {bareme.tarif_par_eleve}€/élève/h au-delà de {bareme.seuil_eleves} élèves
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
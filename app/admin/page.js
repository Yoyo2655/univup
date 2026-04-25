'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ elevesActifs: 0, elevesAttente: 0, seancesMois: 0, seancesRestantes: 0, salairesAVerser: 0, paiementsAttente: 0 })
  const [alertes, setAlertes] = useState({ abosExpirent: [], abosEnAttente: [], seancesNonPointees: [] })
  const [prochainesSeances, setProchainesSeances] = useState([])
  const [financier, setFinancier] = useState({ recettesRecues: 0, recettesAttendues: 0, chargesVersees: 0, chargesDues: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const now = new Date()
    const moisDebut = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const moisFin = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
    const dans14j = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const il7yA = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [
      elevesRes, abosRes, seancesMoisRes, prochainesRes,
      seancesPasseesRes, salairesRes, paiementsRes
    ] = await Promise.all([
      supabase.from('users').select('id, is_active').eq('role', 'eleve'),
      supabase.from('abonnements').select('*, users:eleve_id(full_name, email)'),
      supabase.from('seances').select('id, statut').gte('date_debut', moisDebut).lt('date_debut', moisFin),
      supabase.from('seances').select(`*, prof:prof_id(full_name)`).gte('date_debut', now.toISOString()).order('date_debut').limit(5),
      supabase.from('seances').select('id, statut, titre, prof:prof_id(full_name), date_debut').lt('date_debut', now.toISOString()).eq('statut', 'planifiee'),
      supabase.from('salaires_profs').select('montant_du, montant_verse, mois'),
      supabase.from('paiements_eleves').select('montant'),
    ])

    const eleves = elevesRes.data || []
    const abos = abosRes.data || []
    const seancesMois = seancesMoisRes.data || []
    const salaires = salairesRes.data || []
    const paiements = paiementsRes.data || []

    // Stats
    const elevesActifs = eleves.filter(e => e.is_active).length
    const elevesAttente = abos.filter(a => a.statut === 'en_attente').length
    const seancesRestantes = seancesMois.filter(s => s.statut === 'planifiee').length

    // Salaires à verser ce mois
    const moisKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const salMois = salaires.filter(s => s.mois === moisKey)
    const totalDu = salMois.reduce((sum, s) => sum + parseFloat(s.montant_du || 0), 0)
    const totalVerse = salMois.reduce((sum, s) => sum + parseFloat(s.montant_verse || 0), 0)
    const salairesAVerser = totalDu - totalVerse

    // Paiements élèves en attente
    const abosEnAttente = abos.filter(a => a.statut === 'en_attente')
    const paiementsAttente = abosEnAttente.reduce((sum, a) => sum + parseFloat(a.montant || 0), 0)

    // Alertes
    const abosExpirent = abos.filter(a => a.statut === 'actif' && a.date_fin && a.date_fin <= dans14j && a.date_fin >= now.toISOString().split('T')[0])
    const abosAttenteVieux = abos.filter(a => a.statut === 'en_attente' && a.created_at <= il7yA)

    // Financier
    const recettesRecues = paiements.reduce((sum, p) => sum + parseFloat(p.montant || 0), 0)
    const recettesAttendues = abos.reduce((sum, a) => sum + parseFloat(a.montant || 0), 0)
    const chargesVersees = salaires.reduce((sum, s) => sum + parseFloat(s.montant_verse || 0), 0)
    const chargesDues = salaires.reduce((sum, s) => sum + parseFloat(s.montant_du || 0), 0)

    setStats({ elevesActifs, elevesAttente, seancesMois: seancesMois.length, seancesRestantes, salairesAVerser, paiementsAttente })
    setAlertes({ abosExpirent, abosEnAttente: abosAttenteVieux, seancesNonPointees: seancesPasseesRes.data || [] })
    setProchainesSeances(prochainesRes.data || [])
    setFinancier({ recettesRecues, recettesAttendues, chargesVersees, chargesDues })
    setLoading(false)
  }

  const TYPES = {
    cours: { label: 'Cours', color: '#a78bfa' },
    kholle: { label: 'Khôlle', color: '#34d399' },
    entretien: { label: 'Entretien', color: '#f87171' }
  }

  const totalAlertes = alertes.abosExpirent.length + alertes.abosEnAttente.length + alertes.seancesNonPointees.length

  const s = {
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
    title: { fontSize: '18px', fontWeight: '600', color: '#e8e6e0' },
    content: { padding: '24px 28px' },
    statCard: { background: '#18181c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px' },
    card: { background: '#18181c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' },
    cardHeader: { padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    cardTitle: { fontSize: '13px', fontWeight: '600', color: '#e8e6e0' },
    cardBody: { padding: '16px 20px' },
    alerte: { display: 'flex', gap: '10px', padding: '10px 14px', borderRadius: '8px', marginBottom: '8px', fontSize: '12px', alignItems: 'flex-start' },
    alerteAmber: { background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' },
    alerteCoral: { display: 'flex', gap: '10px', padding: '10px 14px', borderRadius: '8px', marginBottom: '8px', fontSize: '12px', alignItems: 'flex-start', background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' },
    seanceItem: { display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    stripe: { width: '3px', borderRadius: '2px', alignSelf: 'stretch', minHeight: '36px', flexShrink: 0 },
    progressBar: { height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden', marginTop: '8px' },
  }

  if (loading) return (
    <div style={{ padding: '40px', color: '#6e6c66', textAlign: 'center' }}>Chargement…</div>
  )

  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div style={{ color: '#e8e6e0' }}>
      <div style={s.topbar}>
        <h1 style={s.title}>Tableau de bord</h1>
        <span style={{ fontSize: '12px', color: '#6e6c66', textTransform: 'capitalize' }}>{dateStr}</span>
      </div>

      <div style={s.content}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
          <div style={s.statCard}>
            <div style={{ fontSize: '11px', color: '#6e6c66', marginBottom: '8px' }}>Élèves actifs</div>
            <div style={{ fontSize: '26px', fontWeight: '600', color: '#a78bfa' }}>{stats.elevesActifs}</div>
            <div style={{ fontSize: '11px', color: stats.elevesAttente > 0 ? '#fbbf24' : '#6e6c66', marginTop: '4px' }}>
              {stats.elevesAttente > 0 ? `⚠ ${stats.elevesAttente} en attente de paiement` : 'Tous à jour'}
            </div>
          </div>
          <div style={s.statCard}>
            <div style={{ fontSize: '11px', color: '#6e6c66', marginBottom: '8px' }}>Séances ce mois</div>
            <div style={{ fontSize: '26px', fontWeight: '600', color: '#34d399' }}>{stats.seancesMois}</div>
            <div style={{ fontSize: '11px', color: '#6e6c66', marginTop: '4px' }}>{stats.seancesRestantes} restantes</div>
          </div>
          <div style={s.statCard}>
            <div style={{ fontSize: '11px', color: '#6e6c66', marginBottom: '8px' }}>Salaires à verser</div>
            <div style={{ fontSize: '26px', fontWeight: '600', color: stats.salairesAVerser > 0 ? '#fbbf24' : '#34d399' }}>
              {stats.salairesAVerser > 0 ? `${stats.salairesAVerser.toFixed(0)}€` : '✓ Soldé'}
            </div>
            <div style={{ fontSize: '11px', color: '#6e6c66', marginTop: '4px' }}>ce mois</div>
          </div>
          <div style={s.statCard}>
            <div style={{ fontSize: '11px', color: '#6e6c66', marginBottom: '8px' }}>Paiements en attente</div>
            <div style={{ fontSize: '26px', fontWeight: '600', color: stats.paiementsAttente > 0 ? '#f87171' : '#34d399' }}>
              {stats.paiementsAttente > 0 ? `${stats.paiementsAttente.toFixed(0)}€` : '✓'}
            </div>
            <div style={{ fontSize: '11px', color: '#6e6c66', marginTop: '4px' }}>{alertes.abosEnAttente.length + (stats.elevesAttente - alertes.abosEnAttente.length)} élève{stats.elevesAttente > 1 ? 's' : ''}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

          {/* Alertes */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Alertes</span>
              {totalAlertes > 0 && (
                <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>
                  {totalAlertes}
                </span>
              )}
            </div>
            <div style={s.cardBody}>
              {totalAlertes === 0 ? (
                <div style={{ color: '#6e6c66', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                  ✓ Aucune alerte — tout est en ordre
                </div>
              ) : (
                <>
                  {alertes.abosExpirent.map(a => (
                    <div key={a.id} style={{ ...s.alerte, ...s.alerteAmber }}>
                      <span>⏰</span>
                      <span><strong>{a.users?.full_name}</strong> — abonnement expire le {new Date(a.date_fin).toLocaleDateString('fr-FR')}</span>
                    </div>
                  ))}
                  {alertes.abosEnAttente.map(a => (
                    <div key={a.id} style={s.alerteCoral}>
                      <span>💳</span>
                      <span><strong>{a.users?.full_name}</strong> — virement en attente depuis +7 jours</span>
                    </div>
                  ))}
                  {alertes.seancesNonPointees.map(s2 => (
                    <div key={s2.id} style={{ ...s.alerte, ...s.alerteAmber }}>
                      <span>📋</span>
                      <span><strong>{s2.prof?.full_name}</strong> — séance "{s2.titre}" non pointée ({new Date(s2.date_debut).toLocaleDateString('fr-FR')})</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Prochaines séances */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Prochaines séances</span>
              <Link href="/admin/planning" style={{ fontSize: '11px', color: '#a78bfa', textDecoration: 'none' }}>Voir tout →</Link>
            </div>
            <div style={s.cardBody}>
              {prochainesSeances.length === 0 ? (
                <div style={{ color: '#6e6c66', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                  Aucune séance à venir.
                </div>
              ) : (
                prochainesSeances.map(seance => (
                  <div key={seance.id} style={{ ...s.seanceItem }}>
                    <div style={{ ...s.stripe, background: TYPES[seance.type]?.color }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#e8e6e0', marginBottom: '2px' }}>{seance.titre}</div>
                      <div style={{ fontSize: '11px', color: '#6e6c66' }}>
                        {new Date(seance.date_debut).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}
                        {' · '}
                        {new Date(seance.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        {seance.prof?.full_name && ` · ${seance.prof.full_name}`}
                      </div>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: TYPES[seance.type]?.color + '22', color: TYPES[seance.type]?.color, flexShrink: 0 }}>
                      {TYPES[seance.type]?.label}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Financier */}
        <div style={s.card}>
          <div style={s.cardHeader}><span style={s.cardTitle}>Aperçu financier global</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
            <div style={{ padding: '20px', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: '12px', color: '#6e6c66', marginBottom: '12px' }}>Recettes élèves</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#9e9c96' }}>Reçu</span>
                <span style={{ fontFamily: 'monospace', color: '#34d399', fontWeight: '600' }}>{financier.recettesRecues.toFixed(0)}€</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#9e9c96' }}>Total attendu</span>
                <span style={{ fontFamily: 'monospace', color: '#e8e6e0' }}>{financier.recettesAttendues.toFixed(0)}€</span>
              </div>
              <div style={s.progressBar}>
                <div style={{ height: '100%', borderRadius: '3px', background: '#34d399', width: `${financier.recettesAttendues > 0 ? Math.min((financier.recettesRecues / financier.recettesAttendues) * 100, 100) : 0}%`, transition: 'width 0.5s' }} />
              </div>
              <div style={{ fontSize: '11px', color: '#6e6c66', marginTop: '6px' }}>
                {financier.recettesAttendues > 0 ? `${Math.round((financier.recettesRecues / financier.recettesAttendues) * 100)}% collecté` : '—'}
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', color: '#6e6c66', marginBottom: '12px' }}>Charges profs</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#9e9c96' }}>Versé</span>
                <span style={{ fontFamily: 'monospace', color: '#34d399', fontWeight: '600' }}>{financier.chargesVersees.toFixed(0)}€</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#9e9c96' }}>Total dû</span>
                <span style={{ fontFamily: 'monospace', color: '#e8e6e0' }}>{financier.chargesDues.toFixed(0)}€</span>
              </div>
              <div style={s.progressBar}>
                <div style={{ height: '100%', borderRadius: '3px', background: '#a78bfa', width: `${financier.chargesDues > 0 ? Math.min((financier.chargesVersees / financier.chargesDues) * 100, 100) : 0}%`, transition: 'width 0.5s' }} />
              </div>
              <div style={{ fontSize: '11px', color: '#6e6c66', marginTop: '6px' }}>
                {financier.chargesDues > 0 ? `${Math.round((financier.chargesVersees / financier.chargesDues) * 100)}% versé` : '—'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
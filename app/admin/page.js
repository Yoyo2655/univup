'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { useTheme, getTheme } from '../context/ThemeContext'

export default function AdminDashboard() {
  const { theme, isDark } = useTheme()
  const c = getTheme(theme)

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

    const [elevesRes, abosRes, seancesMoisRes, prochainesRes, seancesPasseesRes, salairesRes, paiementsRes] = await Promise.all([
      supabase.from('users').select('id, is_active').eq('role', 'eleve'),
      supabase.from('abonnements').select('*, users:eleve_id(full_name, email)'),
      supabase.from('seances').select('id, statut').gte('date_debut', moisDebut).lt('date_debut', moisFin),
      supabase.from('seances').select('*, prof:prof_id(full_name)').gte('date_debut', now.toISOString()).order('date_debut').limit(5),
      supabase.from('seances').select('id, statut, titre, prof:prof_id(full_name), date_debut').lt('date_debut', now.toISOString()).eq('statut', 'planifiee'),
      supabase.from('salaires_profs').select('montant_du, montant_verse, mois'),
      supabase.from('paiements_eleves').select('montant'),
    ])

    const eleves = elevesRes.data || []
    const abos = abosRes.data || []
    const seancesMois = seancesMoisRes.data || []
    const salaires = salairesRes.data || []
    const paiements = paiementsRes.data || []

    const elevesActifs = eleves.filter(e => e.is_active).length
    const elevesAttente = abos.filter(a => a.statut === 'en_attente').length
    const seancesRestantes = seancesMois.filter(s => s.statut === 'planifiee').length
    const moisKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const salMois = salaires.filter(s => s.mois === moisKey)
    const totalDu = salMois.reduce((sum, s) => sum + parseFloat(s.montant_du || 0), 0)
    const totalVerse = salMois.reduce((sum, s) => sum + parseFloat(s.montant_verse || 0), 0)
    const salairesAVerser = totalDu - totalVerse
    const abosEnAttente = abos.filter(a => a.statut === 'en_attente')
    const paiementsAttente = abosEnAttente.reduce((sum, a) => sum + parseFloat(a.montant || 0), 0)
    const abosExpirent = abos.filter(a => a.statut === 'actif' && a.date_fin && a.date_fin <= dans14j && a.date_fin >= now.toISOString().split('T')[0])
    const abosAttenteVieux = abos.filter(a => a.statut === 'en_attente' && a.created_at <= il7yA)
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
    cours: { label: 'Cours', color: c.purple },
    kholle: { label: 'Kholle', color: c.teal },
    entretien: { label: 'Entretien', color: c.coral }
  }

  const totalAlertes = alertes.abosExpirent.length + alertes.abosEnAttente.length + alertes.seancesNonPointees.length
  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  const card = {
    background: c.surface,
    border: '1px solid ' + c.border,
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '16px',
    boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
    transition: 'background 0.2s',
  }

  if (loading) return (
    <div style={{ padding: '40px', color: c.muted, textAlign: 'center', background: c.bg, minHeight: '100vh', fontFamily: "'DM Sans', system-ui" }}>
      Chargement...
    </div>
  )

  return (
    <div style={{ color: c.text, fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: '100vh', background: c.bg, transition: 'background 0.2s' }}>

      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid ' + c.border, background: c.surface, transition: 'background 0.2s' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: c.text, letterSpacing: '-0.3px', margin: 0 }}>Tableau de bord</h1>
          <div style={{ fontSize: '11px', color: c.muted, marginTop: '3px', textTransform: 'capitalize' }}>{dateStr}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ height: '2px', width: '32px', background: isDark ? '#f0eeea' : '#111010' }} />
          <div style={{ height: '2px', width: '32px', background: '#9b8ec4' }} />
          <div style={{ height: '2px', width: '32px', background: '#8a1c30' }} />
        </div>
      </div>

      <div style={{ padding: '28px 32px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Eleves actifs', value: stats.elevesActifs, color: c.purple, sub: stats.elevesAttente > 0 ? `${stats.elevesAttente} en attente` : 'Tous a jour', subColor: stats.elevesAttente > 0 ? c.amber : c.muted },
            { label: 'Seances ce mois', value: stats.seancesMois, color: c.teal, sub: `${stats.seancesRestantes} restantes`, subColor: c.muted },
            { label: 'Salaires a verser', value: stats.salairesAVerser > 0 ? stats.salairesAVerser.toFixed(0) + 'EUR' : 'Solde', color: stats.salairesAVerser > 0 ? c.amber : c.teal, sub: 'ce mois', subColor: c.muted },
            { label: 'Paiements en attente', value: stats.paiementsAttente > 0 ? stats.paiementsAttente.toFixed(0) + 'EUR' : 'OK', color: stats.paiementsAttente > 0 ? c.coral : c.teal, sub: stats.elevesAttente + ' eleve' + (stats.elevesAttente > 1 ? 's' : ''), subColor: c.muted },
          ].map((s, i) => (
            <div key={i} style={{ ...card, padding: '20px', marginBottom: 0, borderTop: isDark ? 'none' : '3px solid ' + s.color }}>
              <div style={{ fontSize: '10px', color: c.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>{s.label}</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: s.color, letterSpacing: '-0.5px', marginBottom: '6px' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: s.subColor }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

          {/* Alertes */}
          <div style={card}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid ' + c.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: c.text }}>Alertes</span>
              {totalAlertes > 0 && (
                <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: isDark ? 'rgba(248,113,113,0.15)' : 'rgba(220,38,38,0.08)', color: c.coral, border: '1px solid ' + (isDark ? 'rgba(248,113,113,0.2)' : 'rgba(220,38,38,0.15)') }}>
                  {totalAlertes}
                </span>
              )}
            </div>
            <div style={{ padding: '16px 20px' }}>
              {totalAlertes === 0 ? (
                <div style={{ color: c.muted, fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>✓ Aucune alerte</div>
              ) : (
                <>
                  {alertes.abosExpirent.map(a => (
                    <div key={a.id} style={{ display: 'flex', gap: '10px', padding: '10px 12px', borderRadius: '8px', marginBottom: '8px', fontSize: '12px', alignItems: 'flex-start', background: isDark ? 'rgba(251,191,36,0.08)' : 'rgba(217,119,6,0.06)', color: c.amber, border: '1px solid ' + (isDark ? 'rgba(251,191,36,0.15)' : 'rgba(217,119,6,0.15)') }}>
                      <span>⏰</span>
                      <span><strong>{a.users?.full_name}</strong> — abonnement expire le {new Date(a.date_fin).toLocaleDateString('fr-FR')}</span>
                    </div>
                  ))}
                  {alertes.abosEnAttente.map(a => (
                    <div key={a.id} style={{ display: 'flex', gap: '10px', padding: '10px 12px', borderRadius: '8px', marginBottom: '8px', fontSize: '12px', alignItems: 'flex-start', background: isDark ? 'rgba(248,113,113,0.08)' : 'rgba(220,38,38,0.06)', color: c.coral, border: '1px solid ' + (isDark ? 'rgba(248,113,113,0.15)' : 'rgba(220,38,38,0.15)') }}>
                      <span>💳</span>
                      <span><strong>{a.users?.full_name}</strong> — virement en attente depuis +7 jours</span>
                    </div>
                  ))}
                  {alertes.seancesNonPointees.map(s2 => (
                    <div key={s2.id} style={{ display: 'flex', gap: '10px', padding: '10px 12px', borderRadius: '8px', marginBottom: '8px', fontSize: '12px', alignItems: 'flex-start', background: isDark ? 'rgba(251,191,36,0.08)' : 'rgba(217,119,6,0.06)', color: c.amber, border: '1px solid ' + (isDark ? 'rgba(251,191,36,0.15)' : 'rgba(217,119,6,0.15)') }}>
                      <span>📋</span>
                      <span><strong>{s2.prof?.full_name}</strong> — "{s2.titre}" non pointee ({new Date(s2.date_debut).toLocaleDateString('fr-FR')})</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Prochaines séances */}
          <div style={card}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid ' + c.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: c.text }}>Prochaines seances</span>
              <Link href="/admin/planning" style={{ fontSize: '11px', color: c.purple, textDecoration: 'none' }}>Voir tout →</Link>
            </div>
            <div style={{ padding: '8px 20px' }}>
              {prochainesSeances.length === 0 ? (
                <div style={{ color: c.muted, fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Aucune seance a venir.</div>
              ) : (
                prochainesSeances.map(seance => (
                  <div key={seance.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 0', borderBottom: '1px solid ' + c.border }}>
                    <div style={{ width: '3px', borderRadius: '2px', alignSelf: 'stretch', minHeight: '36px', background: TYPES[seance.type]?.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: c.text, marginBottom: '2px' }}>{seance.titre}</div>
                      <div style={{ fontSize: '11px', color: c.muted }}>
                        {new Date(seance.date_debut).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}
                        {' · '}
                        {new Date(seance.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        {seance.prof?.full_name && ` · ${seance.prof.full_name}`}
                      </div>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: TYPES[seance.type]?.color + (isDark ? '22' : '15'), color: TYPES[seance.type]?.color, flexShrink: 0 }}>
                      {TYPES[seance.type]?.label}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Financier */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid ' + c.border }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: c.text }}>Apercu financier global</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {[
              { label: 'Recettes eleves', recu: financier.recettesRecues, total: financier.recettesAttendues, color: c.teal, pct: financier.recettesAttendues > 0 ? Math.min((financier.recettesRecues / financier.recettesAttendues) * 100, 100) : 0, pctLabel: 'collecte' },
              { label: 'Charges profs', recu: financier.chargesVersees, total: financier.chargesDues, color: c.purple, pct: financier.chargesDues > 0 ? Math.min((financier.chargesVersees / financier.chargesDues) * 100, 100) : 0, pctLabel: 'verse' },
            ].map((f, i) => (
              <div key={i} style={{ padding: '24px', borderRight: i === 0 ? '1px solid ' + c.border : 'none' }}>
                <div style={{ fontSize: '11px', color: c.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>{f.label}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: c.muted2 }}>Recu / verse</span>
                  <span style={{ fontFamily: 'monospace', color: f.color, fontWeight: '600' }}>{f.recu.toFixed(0)}EUR</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span style={{ fontSize: '13px', color: c.muted2 }}>Total</span>
                  <span style={{ fontFamily: 'monospace', color: c.text }}>{f.total.toFixed(0)}EUR</span>
                </div>
                <div style={{ height: '4px', background: c.surface2, borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ height: '100%', borderRadius: '2px', background: f.color, width: f.pct + '%', transition: 'width 0.5s' }} />
                </div>
                <div style={{ fontSize: '11px', color: c.muted }}>
                  {f.total > 0 ? Math.round(f.pct) + '% ' + f.pctLabel : '-'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Séparateur tricolore */}
        <div style={{ display: 'flex', marginTop: '16px' }}>
          <div style={{ height: '2px', flex: 3, background: isDark ? 'rgba(240,238,234,0.04)' : 'rgba(0,0,0,0.06)' }} />
          <div style={{ height: '2px', flex: 1, background: 'rgba(155,142,196,0.3)' }} />
          <div style={{ height: '2px', flex: 1, background: 'rgba(138,28,48,0.2)' }} />
        </div>

      </div>
    </div>
  )
}
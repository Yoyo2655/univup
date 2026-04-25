'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function ElevePlanning() {
  const [seances, setSeances] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchSeances() }, [])

  async function fetchSeances() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('seance_eleves')
      .select(`*, seance:seance_id(*, prof:prof_id(full_name))`)
      .eq('eleve_id', user.id)
      .order('seance_id', { ascending: true })

    setSeances(data || [])
    setLoading(false)
  }

  const TYPES = {
    cours: { label: 'Cours', color: 'var(--purple)' },
    kholle: { label: 'Khôlle', color: 'var(--teal)' },
    entretien: { label: 'Entretien', color: 'var(--coral)' }
  }

  const upcoming = seances.filter(s => new Date(s.seance?.date_debut) >= new Date())
  const past = seances.filter(s => new Date(s.seance?.date_debut) < new Date())

  const s = {
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid var(--border)' },
    title: { fontSize: '18px', fontWeight: '600', color: 'var(--text)' },
    content: { padding: '24px 28px' },
    card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '10px' },
    seanceCard: { padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' },
    stripe: { width: '3px', borderRadius: '2px', alignSelf: 'stretch', minHeight: '40px', flexShrink: 0 },
    sectionLabel: { fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' },
  }

  return (
    <div style={{ color: 'var(--text)' }}>
      <div style={s.topbar}>
        <h1 style={s.title}>Mon planning</h1>
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
          {upcoming.length} séance{upcoming.length > 1 ? 's' : ''} à venir
        </span>
      </div>

      <div style={s.content}>
        {loading ? (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px' }}>Chargement…</div>
        ) : seances.length === 0 ? (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px' }}>
            Aucune séance planifiée pour le moment.
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <div style={s.sectionLabel}>À venir</div>
                {upcoming.map(item => (
                  <div key={item.seance_id} style={s.card}>
                    <div style={s.seanceCard}>
                      <div style={{ ...s.stripe, background: TYPES[item.seance?.type]?.color }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                          {item.seance?.titre}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          {new Date(item.seance?.date_debut).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
                          {' · '}
                          {new Date(item.seance?.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {' – '}
                          {new Date(item.seance?.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {item.seance?.salle && ` · ${item.seance.salle}`}
                        </div>
                        {item.seance?.prof?.full_name && (
                          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '3px' }}>
                            Prof. {item.seance.prof.full_name}
                          </div>
                        )}
                      </div>
                      <span style={{
                        padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
                        background: TYPES[item.seance?.type]?.color + '22',
                        color: TYPES[item.seance?.type]?.color
                      }}>
                        {TYPES[item.seance?.type]?.label}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {past.length > 0 && (
              <>
                <div style={{ ...s.sectionLabel, marginTop: '24px' }}>Passées</div>
                {past.map(item => (
                  <div key={item.seance_id} style={{ ...s.card, opacity: 0.6 }}>
                    <div style={s.seanceCard}>
                      <div style={{ ...s.stripe, background: TYPES[item.seance?.type]?.color }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                          {item.seance?.titre}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          {new Date(item.seance?.date_debut).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
                          {' · '}
                          {new Date(item.seance?.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {item.seance?.salle && ` · ${item.seance.salle}`}
                        </div>
                        {item.seance?.prof?.full_name && (
                          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '3px' }}>
                            Prof. {item.seance.prof.full_name}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
                          background: TYPES[item.seance?.type]?.color + '22',
                          color: TYPES[item.seance?.type]?.color
                        }}>
                          {TYPES[item.seance?.type]?.label}
                        </span>
                        {item.note && (
                          <span style={{
                            padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
                            background: 'rgba(52,211,153,0.12)', color: 'var(--teal)'
                          }}>
                            {item.note}/20
                          </span>
                        )}
                      </div>
                    </div>
                    {item.feedback && (
                      <div style={{
                        padding: '10px 20px 14px', borderTop: '1px solid rgba(255,255,255,0.05)',
                        fontSize: '12px', color: 'var(--muted2)', fontStyle: 'italic'
                      }}>
                        💬 {item.feedback}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { t } from '../../lib/theme'

export default function ProfPlanning() {
  const [seances, setSeances] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchSeances() }, [])

  async function fetchSeances() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('seances')
      .select('*')
      .eq('prof_id', user.id)
      .order('date_debut', { ascending: true })

    setSeances(data || [])
    setLoading(false)
  }

  async function marquerEffectuee(id) {
    await supabase.from('seances').update({ statut: 'effectuee' }).eq('id', id)
    fetchSeances()
  }

  const TYPES = {
    cours: { label: 'Cours', color: t.purple },
    kholle: { label: 'Khôlle', color: t.teal },
    entretien: { label: 'Entretien', color: t.coral }
  }

  const s = {
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid t.border' },
    title: { fontSize: '18px', fontWeight: '600', color: t.text },
    content: { padding: '24px 28px' },
    card: { background: t.surface, border: '1px solid t.border', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' },
    seanceCard: { padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' },
    stripe: { width: '3px', borderRadius: '2px', alignSelf: 'stretch', minHeight: '40px', flexShrink: 0 },
    btn: { padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
    btnGhost: { background: 'rgba(255,255,255,0.06)', color: t.muted2, border: '1px solid t.border' },
    btnTeal: { background: t.teal, color: '#0d1f18' },
  }

  const today = new Date().toDateString()
  const upcoming = seances.filter(s => new Date(s.date_debut) >= new Date())
  const past = seances.filter(s => new Date(s.date_debut) < new Date())

  return (
    <div style={{ color: t.text }}>
      <div style={s.topbar}>
        <h1 style={s.title}>Mon planning</h1>
        <span style={{ fontSize: '12px', color: t.muted }}>
          {upcoming.length} séance{upcoming.length > 1 ? 's' : ''} à venir
        </span>
      </div>

      <div style={s.content}>
        {loading ? (
          <div style={{ color: t.muted, textAlign: 'center', padding: '40px' }}>Chargement…</div>
        ) : seances.length === 0 ? (
          <div style={{ color: t.muted, textAlign: 'center', padding: '40px' }}>
            Aucune séance planifiée pour le moment.
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <div style={{ fontSize: '11px', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                  À venir
                </div>
                {upcoming.map(seance => (
                  <div key={seance.id} style={s.card}>
                    <div style={s.seanceCard}>
                      <div style={{ ...s.stripe, background: TYPES[seance.type]?.color }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{seance.titre}</div>
                        <div style={{ fontSize: '12px', color: t.muted }}>
                          {new Date(seance.date_debut).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
                          {' · '}
                          {new Date(seance.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {' – '}
                          {new Date(seance.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {seance.salle && ` · ${seance.salle}`}
                        </div>
                      </div>
                      <span style={{
                        padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
                        background: TYPES[seance.type]?.color + '22', color: TYPES[seance.type]?.color
                      }}>
                        {TYPES[seance.type]?.label}
                      </span>
                      <Link href={`/prof/appel?seance=${seance.id}`}>
                        <button style={{ ...s.btn, ...s.btnTeal }}>Feuille d'appel →</button>
                      </Link>
                    </div>
                  </div>
                ))}
              </>
            )}

            {past.length > 0 && (
              <>
                <div style={{ fontSize: '11px', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '20px 0 10px' }}>
                  Passées
                </div>
                {past.map(seance => (
                  <div key={seance.id} style={{ ...s.card, opacity: 0.6 }}>
                    <div style={s.seanceCard}>
                      <div style={{ ...s.stripe, background: TYPES[seance.type]?.color }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{seance.titre}</div>
                        <div style={{ fontSize: '12px', color: t.muted }}>
                          {new Date(seance.date_debut).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
                          {' · '}
                          {new Date(seance.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <span style={{
                        padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
                        background: seance.statut === 'effectuee' ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.1)',
                        color: seance.statut === 'effectuee' ? t.teal : t.amber
                      }}>
                        {seance.statut === 'effectuee' ? 'Effectuée ✓' : 'Non pointée'}
                      </span>
                      {seance.statut !== 'effectuee' && (
                        <button onClick={() => marquerEffectuee(seance.id)} style={{ ...s.btn, ...s.btnGhost }}>
                          Marquer effectuée
                        </button>
                      )}
                    </div>
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
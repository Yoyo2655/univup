'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function ResultatsPage() {
  const [resultats, setResultats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchResultats() }, [])

  async function fetchResultats() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('seance_eleves')
      .select(`*, seance:seance_id(titre, type, matiere, date_debut, prof:prof_id(full_name))`)
      .eq('eleve_id', user.id)
      .not('presence', 'is', null)
      .order('seance_id', { ascending: false })

    setResultats(data || [])
    setLoading(false)
  }

  const notes = resultats.filter(r => r.note !== null)
  const moyenne = notes.length > 0
    ? (notes.reduce((sum, r) => sum + parseFloat(r.note), 0) / notes.length).toFixed(1)
    : null
  const presents = resultats.filter(r => r.presence === 'present').length
  const absents = resultats.filter(r => r.presence === 'absent').length
  const tauxPresence = resultats.length > 0
    ? Math.round((presents / resultats.length) * 100)
    : null

  const TYPES = {
    cours: { label: 'Cours', color: 'var(--purple)' },
    kholle: { label: 'Khôlle', color: 'var(--teal)' },
    entretien: { label: 'Entretien', color: 'var(--coral)' }
  }

  const PRESENCE = {
    present: { label: 'Présent', color: 'var(--teal)', bg: 'rgba(52,211,153,0.12)' },
    absent: { label: 'Absent', color: 'var(--coral)', bg: 'rgba(248,113,113,0.1)' },
    retard: { label: 'Retard', color: 'var(--amber)', bg: 'rgba(251,191,36,0.1)' },
  }

  function noteColor(note) {
    if (note >= 14) return 'var(--teal)'
    if (note >= 10) return 'var(--amber)'
    return 'var(--coral)'
  }

  const s = {
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid var(--border)' },
    title: { fontSize: '18px', fontWeight: '600', color: 'var(--text)' },
    content: { padding: '24px 28px' },
    statCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' },
    card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' },
  }

  return (
    <div style={{ color: 'var(--text)' }}>
      <div style={s.topbar}>
        <h1 style={s.title}>Mes résultats</h1>
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{resultats.length} séance{resultats.length > 1 ? 's' : ''} au total</span>
      </div>

      <div style={s.content}>
        {loading ? (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px' }}>Chargement…</div>
        ) : resultats.length === 0 ? (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px' }}>
            Aucun résultat pour le moment.
          </div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
              <div style={s.statCard}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>Moyenne khôlles</div>
                <div style={{ fontSize: '28px', fontWeight: '600', color: moyenne ? noteColor(parseFloat(moyenne)) : 'var(--muted)' }}>
                  {moyenne ? `${moyenne}/20` : '—'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>{notes.length} note{notes.length > 1 ? 's' : ''}</div>
              </div>
              <div style={s.statCard}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>Taux de présence</div>
                <div style={{ fontSize: '28px', fontWeight: '600', color: tauxPresence >= 80 ? 'var(--teal)' : 'var(--amber)' }}>
                  {tauxPresence !== null ? `${tauxPresence}%` : '—'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>{presents} présent · {absents} absent</div>
              </div>
              <div style={s.statCard}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>Séances suivies</div>
                <div style={{ fontSize: '28px', fontWeight: '600', color: 'var(--purple)' }}>{presents}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>sur {resultats.length} planifiées</div>
              </div>
            </div>

            {/* Historique */}
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
              Historique
            </div>
            {resultats.map(r => (
              <div key={r.seance_id} style={s.card}>
                <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Date */}
                  <div style={{ minWidth: '52px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', lineHeight: 1 }}>
                      {new Date(r.seance?.date_debut).toLocaleDateString('fr-FR', { day: '2-digit' })}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
                      {new Date(r.seance?.date_debut).toLocaleDateString('fr-FR', { month: 'short' })}
                    </div>
                  </div>

                  {/* Séparateur */}
                  <div style={{ width: '1px', background: 'var(--border)', alignSelf: 'stretch' }} />

                  {/* Info séance */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '3px' }}>{r.seance?.titre}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {r.seance?.matiere && `${r.seance.matiere} · `}
                      {r.seance?.prof?.full_name && `Prof. ${r.seance.prof.full_name}`}
                    </div>
                  </div>

                  {/* Type */}
                  <span style={{
                    padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
                    background: TYPES[r.seance?.type]?.color + '22',
                    color: TYPES[r.seance?.type]?.color
                  }}>
                    {TYPES[r.seance?.type]?.label}
                  </span>

                  {/* Présence */}
                  <span style={{
                    padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
                    background: PRESENCE[r.presence]?.bg,
                    color: PRESENCE[r.presence]?.color
                  }}>
                    {PRESENCE[r.presence]?.label}
                  </span>

                  {/* Note */}
                  {r.note && (
                    <span style={{
                      fontSize: '16px', fontWeight: '600', minWidth: '52px', textAlign: 'right',
                      color: noteColor(parseFloat(r.note))
                    }}>
                      {r.note}/20
                    </span>
                  )}
                </div>

                {/* Feedback */}
                {r.feedback && (
                  <div style={{
                    padding: '10px 20px 14px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    fontSize: '12px', color: 'var(--muted2)', fontStyle: 'italic',
                    display: 'flex', gap: '8px', alignItems: 'flex-start'
                  }}>
                    <span style={{ fontSize: '14px', flexShrink: 0 }}>💬</span>
                    <span>{r.feedback}</span>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
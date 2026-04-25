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
    cours: { label: 'Cours', color: '#a78bfa' },
    kholle: { label: 'Khôlle', color: '#34d399' },
    entretien: { label: 'Entretien', color: '#f87171' }
  }

  const PRESENCE = {
    present: { label: 'Présent', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
    absent: { label: 'Absent', color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
    retard: { label: 'Retard', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  }

  function noteColor(note) {
    if (note >= 14) return '#34d399'
    if (note >= 10) return '#fbbf24'
    return '#f87171'
  }

  const s = {
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
    title: { fontSize: '18px', fontWeight: '600', color: '#e8e6e0' },
    content: { padding: '24px 28px' },
    statCard: { background: '#18181c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px' },
    card: { background: '#18181c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' },
  }

  return (
    <div style={{ color: '#e8e6e0' }}>
      <div style={s.topbar}>
        <h1 style={s.title}>Mes résultats</h1>
        <span style={{ fontSize: '12px', color: '#6e6c66' }}>{resultats.length} séance{resultats.length > 1 ? 's' : ''} au total</span>
      </div>

      <div style={s.content}>
        {loading ? (
          <div style={{ color: '#6e6c66', textAlign: 'center', padding: '40px' }}>Chargement…</div>
        ) : resultats.length === 0 ? (
          <div style={{ color: '#6e6c66', textAlign: 'center', padding: '40px' }}>
            Aucun résultat pour le moment.
          </div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
              <div style={s.statCard}>
                <div style={{ fontSize: '11px', color: '#6e6c66', marginBottom: '8px' }}>Moyenne khôlles</div>
                <div style={{ fontSize: '28px', fontWeight: '600', color: moyenne ? noteColor(parseFloat(moyenne)) : '#6e6c66' }}>
                  {moyenne ? `${moyenne}/20` : '—'}
                </div>
                <div style={{ fontSize: '11px', color: '#6e6c66', marginTop: '4px' }}>{notes.length} note{notes.length > 1 ? 's' : ''}</div>
              </div>
              <div style={s.statCard}>
                <div style={{ fontSize: '11px', color: '#6e6c66', marginBottom: '8px' }}>Taux de présence</div>
                <div style={{ fontSize: '28px', fontWeight: '600', color: tauxPresence >= 80 ? '#34d399' : '#fbbf24' }}>
                  {tauxPresence !== null ? `${tauxPresence}%` : '—'}
                </div>
                <div style={{ fontSize: '11px', color: '#6e6c66', marginTop: '4px' }}>{presents} présent · {absents} absent</div>
              </div>
              <div style={s.statCard}>
                <div style={{ fontSize: '11px', color: '#6e6c66', marginBottom: '8px' }}>Séances suivies</div>
                <div style={{ fontSize: '28px', fontWeight: '600', color: '#a78bfa' }}>{presents}</div>
                <div style={{ fontSize: '11px', color: '#6e6c66', marginTop: '4px' }}>sur {resultats.length} planifiées</div>
              </div>
            </div>

            {/* Historique */}
            <div style={{ fontSize: '11px', color: '#6e6c66', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
              Historique
            </div>
            {resultats.map(r => (
              <div key={r.seance_id} style={s.card}>
                <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Date */}
                  <div style={{ minWidth: '52px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#e8e6e0', lineHeight: 1 }}>
                      {new Date(r.seance?.date_debut).toLocaleDateString('fr-FR', { day: '2-digit' })}
                    </div>
                    <div style={{ fontSize: '10px', color: '#6e6c66', marginTop: '2px' }}>
                      {new Date(r.seance?.date_debut).toLocaleDateString('fr-FR', { month: 'short' })}
                    </div>
                  </div>

                  {/* Séparateur */}
                  <div style={{ width: '1px', background: 'rgba(255,255,255,0.07)', alignSelf: 'stretch' }} />

                  {/* Info séance */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '3px' }}>{r.seance?.titre}</div>
                    <div style={{ fontSize: '11px', color: '#6e6c66' }}>
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
                    fontSize: '12px', color: '#9e9c96', fontStyle: 'italic',
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
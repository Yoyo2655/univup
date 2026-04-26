'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { t } from '../../../lib/theme'
import AccesProtege from '../AccesProtege'

export default function ResultatsPage() {
  const [resultats, setResultats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchResultats() }, [])

  async function fetchResultats() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('seance_eleves')
      .select('*, seance:seance_id(titre, type, matiere, date_debut, prof:prof_id(full_name))')
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

  const MATIERES_KHOLLE = ['Maths', 'Physique', 'Anglais', 'Motivation', 'Info']
  const moyennesParMatiere = MATIERES_KHOLLE.map(mat => {
    const notesMatiere = resultats.filter(r => r.note !== null && r.seance?.type === 'kholle' && r.seance?.matiere === mat)
    return {
      matiere: mat,
      moyenne: notesMatiere.length > 0
        ? (notesMatiere.reduce((sum, r) => sum + parseFloat(r.note), 0) / notesMatiere.length).toFixed(1)
        : null,
      count: notesMatiere.length
    }
  }).filter(m => m.count > 0)

  const presents = resultats.filter(r => r.presence === 'present').length
  const absents = resultats.filter(r => r.presence === 'absent').length
  const tauxPresence = resultats.length > 0
    ? Math.round((presents / resultats.length) * 100)
    : null

  const TYPES = {
    cours: { label: 'Cours', color: t.purple },
    kholle: { label: 'Kholle', color: t.teal },
    entretien: { label: 'Entretien', color: t.coral }
  }

  const PRESENCE = {
    present: { label: 'Present', color: t.teal, bg: 'rgba(52,211,153,0.12)' },
    absent: { label: 'Absent', color: t.coral, bg: 'rgba(248,113,113,0.1)' },
    retard: { label: 'Retard', color: t.amber, bg: 'rgba(251,191,36,0.1)' },
  }

  function noteColor(note) {
    if (note >= 14) return t.teal
    if (note >= 10) return t.amber
    return t.coral
  }

  const s = {
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid ' + t.border },
    title: { fontSize: '18px', fontWeight: '600', color: t.text },
    content: { padding: '24px 28px' },
    statCard: { background: t.surface, border: '1px solid ' + t.border, borderRadius: '12px', padding: '16px' },
    card: { background: t.surface, border: '1px solid ' + t.border, borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' },
  }

  return (
    <AccesProtege>
      <div style={{ color: t.text }}>
        <div style={s.topbar}>
          <h1 style={s.title}>Mes resultats</h1>
          <span style={{ fontSize: '12px', color: t.muted }}>{resultats.length} seance{resultats.length > 1 ? 's' : ''} au total</span>
        </div>

        <div style={s.content}>
          {loading ? (
            <div style={{ color: t.muted, textAlign: 'center', padding: '40px' }}>Chargement...</div>
          ) : resultats.length === 0 ? (
            <div style={{ color: t.muted, textAlign: 'center', padding: '40px' }}>
              Aucun resultat pour le moment.
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '16px' }}>
                <div style={s.statCard}>
                  <div style={{ fontSize: '11px', color: t.muted, marginBottom: '8px' }}>Moyenne generale kholles</div>
                  <div style={{ fontSize: '28px', fontWeight: '600', color: moyenne ? noteColor(parseFloat(moyenne)) : t.muted }}>
                    {moyenne ? moyenne + '/20' : '-'}
                  </div>
                  <div style={{ fontSize: '11px', color: t.muted, marginTop: '4px' }}>{notes.length} note{notes.length > 1 ? 's' : ''}</div>
                </div>
                <div style={s.statCard}>
                  <div style={{ fontSize: '11px', color: t.muted, marginBottom: '8px' }}>Taux de presence</div>
                  <div style={{ fontSize: '28px', fontWeight: '600', color: tauxPresence >= 80 ? t.teal : t.amber }}>
                    {tauxPresence !== null ? tauxPresence + '%' : '-'}
                  </div>
                  <div style={{ fontSize: '11px', color: t.muted, marginTop: '4px' }}>{presents} present · {absents} absent</div>
                </div>
                <div style={s.statCard}>
                  <div style={{ fontSize: '11px', color: t.muted, marginBottom: '8px' }}>Seances suivies</div>
                  <div style={{ fontSize: '28px', fontWeight: '600', color: t.purple }}>{presents}</div>
                  <div style={{ fontSize: '11px', color: t.muted, marginTop: '4px' }}>sur {resultats.length} planifiees</div>
                </div>
              </div>

              {moyennesParMatiere.length > 0 && (
                <>
                  <div style={{ fontSize: '11px', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                    Moyennes par matiere
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginBottom: '24px' }}>
                    {moyennesParMatiere.map(m => (
                      <div key={m.matiere} style={{ background: t.surface, border: '1px solid ' + t.border, borderRadius: '10px', padding: '14px' }}>
                        <div style={{ fontSize: '11px', color: t.muted, marginBottom: '6px' }}>Kholle {m.matiere}</div>
                        <div style={{ fontSize: '22px', fontWeight: '600', color: noteColor(parseFloat(m.moyenne)) }}>
                          {m.moyenne}/20
                        </div>
                        <div style={{ fontSize: '10px', color: t.muted, marginTop: '4px' }}>{m.count} note{m.count > 1 ? 's' : ''}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div style={{ fontSize: '11px', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                Historique
              </div>
              {resultats.map(r => (
                <div key={r.seance_id} style={s.card}>
                  <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ minWidth: '52px', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: t.text, lineHeight: 1 }}>
                        {new Date(r.seance?.date_debut).toLocaleDateString('fr-FR', { day: '2-digit' })}
                      </div>
                      <div style={{ fontSize: '10px', color: t.muted, marginTop: '2px' }}>
                        {new Date(r.seance?.date_debut).toLocaleDateString('fr-FR', { month: 'short' })}
                      </div>
                    </div>
                    <div style={{ width: '1px', background: t.border, alignSelf: 'stretch' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '3px' }}>{r.seance?.titre}</div>
                      <div style={{ fontSize: '11px', color: t.muted }}>
                        {r.seance?.matiere && r.seance.matiere + ' · '}
                        {r.seance?.prof?.full_name && 'Prof. ' + r.seance.prof.full_name}
                      </div>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: TYPES[r.seance?.type]?.color + '22', color: TYPES[r.seance?.type]?.color }}>
                      {TYPES[r.seance?.type]?.label}
                    </span>
                    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: PRESENCE[r.presence]?.bg, color: PRESENCE[r.presence]?.color }}>
                      {PRESENCE[r.presence]?.label}
                    </span>
                    {r.note && (
                      <span style={{ fontSize: '16px', fontWeight: '600', minWidth: '52px', textAlign: 'right', color: noteColor(parseFloat(r.note)) }}>
                        {r.note}/20
                      </span>
                    )}
                  </div>
                  {r.feedback && (
                    <div style={{ padding: '10px 20px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', color: t.muted2, fontStyle: 'italic', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
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
    </AccesProtege>
  )
}
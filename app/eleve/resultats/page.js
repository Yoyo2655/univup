'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useTheme, getTheme } from '../../context/ThemeContext'
import AccesProtege from '../AccesProtege'

export default function ResultatsPage() {
  const { theme, isDark } = useTheme()
  const c = getTheme(theme)

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
  const moyenne = notes.length > 0 ? (notes.reduce((sum, r) => sum + parseFloat(r.note), 0) / notes.length).toFixed(1) : null

  const MATIERES_KHOLLE = ['Maths', 'Physique', 'Anglais', 'Motivation', 'Info']
  const moyennesParMatiere = MATIERES_KHOLLE.map(mat => {
    const notesMatiere = resultats.filter(r => r.note !== null && r.seance?.type === 'kholle' && r.seance?.matiere === mat)
    return { matiere: mat, moyenne: notesMatiere.length > 0 ? (notesMatiere.reduce((sum, r) => sum + parseFloat(r.note), 0) / notesMatiere.length).toFixed(1) : null, count: notesMatiere.length }
  }).filter(m => m.count > 0)

  const presents = resultats.filter(r => r.presence === 'present').length
  const absents = resultats.filter(r => r.presence === 'absent').length
  const tauxPresence = resultats.length > 0 ? Math.round((presents / resultats.length) * 100) : null

  const TYPES = {
    cours: { label: 'Cours', color: c.purple },
    kholle: { label: 'Kholle', color: c.teal },
    entretien: { label: 'Entretien', color: c.coral }
  }

  const PRESENCE = {
    present: { label: 'Present', color: c.teal, bg: isDark ? 'rgba(52,211,153,0.12)' : 'rgba(5,150,105,0.08)' },
    absent: { label: 'Absent', color: c.coral, bg: isDark ? 'rgba(248,113,113,0.1)' : 'rgba(220,38,38,0.08)' },
    retard: { label: 'Retard', color: c.amber, bg: isDark ? 'rgba(251,191,36,0.1)' : 'rgba(217,119,6,0.08)' },
  }

  function noteColor(note) {
    if (note >= 14) return c.teal
    if (note >= 10) return c.amber
    return c.coral
  }

  const statCard = { background: c.surface, border: '1px solid ' + c.border, borderRadius: '12px', padding: '16px', boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)' }
  const card = { background: c.surface, border: '1px solid ' + c.border, borderRadius: '12px', overflow: 'hidden', marginBottom: '10px', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)' }

  return (
    <AccesProtege>
      <div style={{ color: c.text, background: c.bg, minHeight: '100vh', fontFamily: "'DM Sans', system-ui", transition: 'background 0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid ' + c.border, background: c.surface, transition: 'background 0.2s' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: c.text, letterSpacing: '-0.3px', margin: 0 }}>Mes resultats</h1>
          <span style={{ fontSize: '12px', color: c.muted }}>{resultats.length} seance{resultats.length > 1 ? 's' : ''} au total</span>
        </div>

        <div style={{ padding: '28px 32px' }}>
          {loading ? (
            <div style={{ color: c.muted, textAlign: 'center', padding: '40px' }}>Chargement...</div>
          ) : resultats.length === 0 ? (
            <div style={{ color: c.muted, textAlign: 'center', padding: '40px' }}>Aucun resultat pour le moment.</div>
          ) : (
            <>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '16px' }}>
                <div style={{ ...statCard, borderTop: isDark ? 'none' : '3px solid ' + (moyenne ? noteColor(parseFloat(moyenne)) : c.muted) }}>
                  <div style={{ fontSize: '11px', color: c.muted, marginBottom: '8px' }}>Moyenne generale kholles</div>
                  <div style={{ fontSize: '28px', fontWeight: '600', color: moyenne ? noteColor(parseFloat(moyenne)) : c.muted }}>
                    {moyenne ? moyenne + '/20' : '-'}
                  </div>
                  <div style={{ fontSize: '11px', color: c.muted, marginTop: '4px' }}>{notes.length} note{notes.length > 1 ? 's' : ''}</div>
                </div>
                <div style={{ ...statCard, borderTop: isDark ? 'none' : '3px solid ' + (tauxPresence >= 80 ? c.teal : c.amber) }}>
                  <div style={{ fontSize: '11px', color: c.muted, marginBottom: '8px' }}>Taux de presence</div>
                  <div style={{ fontSize: '28px', fontWeight: '600', color: tauxPresence >= 80 ? c.teal : c.amber }}>
                    {tauxPresence !== null ? tauxPresence + '%' : '-'}
                  </div>
                  <div style={{ fontSize: '11px', color: c.muted, marginTop: '4px' }}>{presents} present · {absents} absent</div>
                </div>
                <div style={{ ...statCard, borderTop: isDark ? 'none' : '3px solid ' + c.purple }}>
                  <div style={{ fontSize: '11px', color: c.muted, marginBottom: '8px' }}>Seances suivies</div>
                  <div style={{ fontSize: '28px', fontWeight: '600', color: c.purple }}>{presents}</div>
                  <div style={{ fontSize: '11px', color: c.muted, marginTop: '4px' }}>sur {resultats.length} planifiees</div>
                </div>
              </div>

              {/* Moyennes par matière */}
              {moyennesParMatiere.length > 0 && (
                <>
                  <div style={{ fontSize: '11px', color: c.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Moyennes par matiere</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginBottom: '24px' }}>
                    {moyennesParMatiere.map(m => (
                      <div key={m.matiere} style={{ background: c.surface, border: '1px solid ' + c.border, borderRadius: '10px', padding: '14px', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)', borderTop: isDark ? 'none' : '3px solid ' + noteColor(parseFloat(m.moyenne)) }}>
                        <div style={{ fontSize: '11px', color: c.muted, marginBottom: '6px' }}>Kholle {m.matiere}</div>
                        <div style={{ fontSize: '22px', fontWeight: '600', color: noteColor(parseFloat(m.moyenne)) }}>{m.moyenne}/20</div>
                        <div style={{ fontSize: '10px', color: c.muted, marginTop: '4px' }}>{m.count} note{m.count > 1 ? 's' : ''}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Historique */}
              <div style={{ fontSize: '11px', color: c.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Historique</div>
              {resultats.map(r => (
                <div key={r.seance_id} style={card}>
                  <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ minWidth: '52px', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: c.text, lineHeight: 1 }}>
                        {new Date(r.seance?.date_debut).toLocaleDateString('fr-FR', { day: '2-digit' })}
                      </div>
                      <div style={{ fontSize: '10px', color: c.muted, marginTop: '2px' }}>
                        {new Date(r.seance?.date_debut).toLocaleDateString('fr-FR', { month: 'short' })}
                      </div>
                    </div>
                    <div style={{ width: '1px', background: c.border, alignSelf: 'stretch' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: c.text, marginBottom: '3px' }}>{r.seance?.titre}</div>
                      <div style={{ fontSize: '11px', color: c.muted }}>
                        {r.seance?.matiere && r.seance.matiere + ' · '}
                        {r.seance?.prof?.full_name && 'Prof. ' + r.seance.prof.full_name}
                      </div>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: TYPES[r.seance?.type]?.color + (isDark ? '22' : '15'), color: TYPES[r.seance?.type]?.color }}>
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
                    <div style={{ padding: '10px 20px 14px', borderTop: '1px solid ' + c.border, fontSize: '12px', color: c.muted2, fontStyle: 'italic', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
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
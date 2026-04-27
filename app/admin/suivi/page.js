'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { t } from '../../../lib/theme'

const MATIERES = ['Maths', 'Physique', 'Anglais', 'Motivation', 'Info']

export default function SuiviPage() {
  const [eleves, setEleves] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('moyenne') // 'moyenne' | 'nom' | matiere

  useEffect(() => { fetchSuivi() }, [])

  async function fetchSuivi() {
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name, is_active')
      .eq('role', 'eleve')
      .order('full_name')

    if (!users) { setLoading(false); return }

    const { data: resultats } = await supabase
      .from('seance_eleves')
      .select('eleve_id, note, presence, seance:seance_id(type, matiere)')
      .not('presence', 'is', null)

    const elevesAvecStats = users.map(eleve => {
      const rows = (resultats || []).filter(r => r.eleve_id === eleve.id)
      const kholles = rows.filter(r => r.seance?.type === 'kholle' && r.note !== null)
      const presences = rows.filter(r => r.presence === 'present').length
      const tauxPresence = rows.length > 0 ? Math.round((presences / rows.length) * 100) : null

      const moyennesParMatiere = {}
      MATIERES.forEach(mat => {
        const notes = kholles.filter(r => r.seance?.matiere === mat).map(r => parseFloat(r.note))
        moyennesParMatiere[mat] = notes.length > 0
          ? (notes.reduce((a, b) => a + b, 0) / notes.length)
          : null
      })

      const toutesNotes = kholles.map(r => parseFloat(r.note))
      const moyenneGenerale = toutesNotes.length > 0
        ? (toutesNotes.reduce((a, b) => a + b, 0) / toutesNotes.length)
        : null

      return {
        ...eleve,
        moyennesParMatiere,
        moyenneGenerale,
        tauxPresence,
        nbKholles: kholles.length,
        nbSeances: rows.length,
      }
    })

    setEleves(elevesAvecStats)
    setLoading(false)
  }

  function noteColor(note) {
    if (note === null) return t.muted
    if (note >= 14) return t.teal
    if (note >= 10) return t.amber
    return t.coral
  }

  function noteColorBg(note) {
    if (note === null) return 'transparent'
    if (note >= 14) return 'rgba(52,211,153,0.1)'
    if (note >= 10) return 'rgba(251,191,36,0.1)'
    return 'rgba(248,113,113,0.1)'
  }

  // Stats globales
  const statsGlobales = MATIERES.map(mat => {
    const toutesNotes = eleves
      .map(e => e.moyennesParMatiere[mat])
      .filter(n => n !== null)
    return {
      matiere: mat,
      moyenne: toutesNotes.length > 0
        ? toutesNotes.reduce((a, b) => a + b, 0) / toutesNotes.length
        : null,
      nbEleves: toutesNotes.length
    }
  })

  const moyenneGlobale = eleves
    .map(e => e.moyenneGenerale)
    .filter(n => n !== null)
  const moyenneGlobaleVal = moyenneGlobale.length > 0
    ? moyenneGlobale.reduce((a, b) => a + b, 0) / moyenneGlobale.length
    : null

  // Tri + ranking
  const elevesTries = [...eleves].sort((a, b) => {
    if (sortBy === 'nom') return a.full_name.localeCompare(b.full_name)
    if (sortBy === 'moyenne') {
      if (a.moyenneGenerale === null) return 1
      if (b.moyenneGenerale === null) return -1
      return b.moyenneGenerale - a.moyenneGenerale
    }
    // tri par matiere
    const na = a.moyennesParMatiere[sortBy]
    const nb = b.moyennesParMatiere[sortBy]
    if (na === null) return 1
    if (nb === null) return -1
    return nb - na
  })

  const s = {
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid ' + t.border },
    title: { fontSize: '18px', fontWeight: '600', color: t.text },
    content: { padding: '24px 28px' },
    card: { background: t.surface, border: '1px solid ' + t.border, borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' },
    cardHeader: { padding: '14px 20px', borderBottom: '1px solid ' + t.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    cardTitle: { fontSize: '13px', fontWeight: '600', color: t.text },
    th: { textAlign: 'left', fontSize: '10px', fontWeight: '500', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px', borderBottom: '1px solid ' + t.border, whiteSpace: 'nowrap' },
    td: { padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', color: t.muted2, verticalAlign: 'middle' },
  }

  return (
    <div style={{ color: t.text }}>
      <div style={s.topbar}>
        <h1 style={s.title}>Suivi des eleves</h1>
        <div style={{ fontSize: '12px', color: t.muted }}>{eleves.length} eleve{eleves.length > 1 ? 's' : ''}</div>
      </div>

      <div style={s.content}>

        {/* Stats globales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: t.surface, border: '1px solid ' + t.border, borderRadius: '10px', padding: '14px', gridColumn: '1' }}>
            <div style={{ fontSize: '10px', color: t.muted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Moy. generale</div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: noteColor(moyenneGlobaleVal) }}>
              {moyenneGlobaleVal !== null ? moyenneGlobaleVal.toFixed(1) : '-'}
            </div>
            <div style={{ fontSize: '10px', color: t.muted, marginTop: '4px' }}>tous eleves</div>
          </div>
          {statsGlobales.map(sg => (
            <div key={sg.matiere} style={{ background: t.surface, border: '1px solid ' + t.border, borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '10px', color: t.muted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{sg.matiere}</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: noteColor(sg.moyenne) }}>
                {sg.moyenne !== null ? sg.moyenne.toFixed(1) : '-'}
              </div>
              <div style={{ fontSize: '10px', color: t.muted, marginTop: '4px' }}>{sg.nbEleves} eleve{sg.nbEleves > 1 ? 's' : ''}</div>
            </div>
          ))}
        </div>

        {/* Tableau des élèves */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>Classement et moyennes</span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: t.muted, marginRight: '4px' }}>Trier par</span>
              {['moyenne', 'nom', ...MATIERES].map(opt => (
                <button
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', border: 'none',
                    background: sortBy === opt ? t.purple : t.surface2,
                    color: sortBy === opt ? '#1a1228' : t.muted2,
                  }}
                >
                  {opt === 'moyenne' ? 'Moy. gen.' : opt === 'nom' ? 'Nom' : opt}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: t.muted }}>Chargement...</div>
          ) : eleves.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: t.muted }}>Aucun eleve.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...s.th, width: '40px' }}>#</th>
                  <th style={s.th}>Eleve</th>
                  <th style={{ ...s.th, textAlign: 'center' }}>Moy. gen.</th>
                  {MATIERES.map(m => (
                    <th key={m} style={{ ...s.th, textAlign: 'center' }}>{m}</th>
                  ))}
                  <th style={{ ...s.th, textAlign: 'center' }}>Presence</th>
                  <th style={{ ...s.th, textAlign: 'center' }}>Kholles</th>
                </tr>
              </thead>
              <tbody>
                {elevesTries.map((eleve, idx) => {
                  const rang = sortBy !== 'nom' ? idx + 1 : null
                  const medalColor = rang === 1 ? '#FFD700' : rang === 2 ? '#C0C0C0' : rang === 3 ? '#CD7F32' : null
                  return (
                    <tr key={eleve.id} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ ...s.td, textAlign: 'center', width: '40px' }}>
                        {rang !== null && (
                          <span style={{ fontSize: medalColor ? '16px' : '12px', color: medalColor || t.muted }}>
                            {medalColor ? (rang === 1 ? '🥇' : rang === 2 ? '🥈' : '🥉') : rang}
                          </span>
                        )}
                      </td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(167,139,250,0.12)', color: t.purple, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '600', flexShrink: 0 }}>
                            {eleve.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '500', color: t.text }}>{eleve.full_name}</div>
                            <div style={{ fontSize: '10px', color: eleve.is_active ? t.teal : t.coral }}>
                              {eleve.is_active ? 'Actif' : 'Inactif'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...s.td, textAlign: 'center' }}>
                        {eleve.moyenneGenerale !== null ? (
                          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', background: noteColorBg(eleve.moyenneGenerale), color: noteColor(eleve.moyenneGenerale) }}>
                            {eleve.moyenneGenerale.toFixed(1)}
                          </span>
                        ) : <span style={{ color: t.muted, fontSize: '12px' }}>-</span>}
                      </td>
                      {MATIERES.map(mat => {
                        const note = eleve.moyennesParMatiere[mat]
                        return (
                          <td key={mat} style={{ ...s.td, textAlign: 'center' }}>
                            {note !== null ? (
                              <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: noteColorBg(note), color: noteColor(note) }}>
                                {note.toFixed(1)}
                              </span>
                            ) : <span style={{ color: t.muted, fontSize: '11px' }}>-</span>}
                          </td>
                        )
                      })}
                      <td style={{ ...s.td, textAlign: 'center' }}>
                        {eleve.tauxPresence !== null ? (
                          <span style={{ fontSize: '12px', fontWeight: '600', color: eleve.tauxPresence >= 80 ? t.teal : eleve.tauxPresence >= 60 ? t.amber : t.coral }}>
                            {eleve.tauxPresence}%
                          </span>
                        ) : <span style={{ color: t.muted, fontSize: '11px' }}>-</span>}
                      </td>
                      <td style={{ ...s.td, textAlign: 'center', color: t.muted }}>
                        {eleve.nbKholles}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
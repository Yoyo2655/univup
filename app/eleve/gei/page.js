'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { t } from '../../../lib/theme'
import AccesProtege from '../AccesProtege'

const MATIERES = ['Maths', 'Physique', 'Proba', 'Info']

export default function GeiPage() {
  const [matiere, setMatiere] = useState('Maths')
  const [nbQuestions] = useState(5)
  const [mode, setMode] = useState(null)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selections, setSelections] = useState({})
  const [valide, setValide] = useState(false)
  const [scores, setScores] = useState([])
  const [error, setError] = useState('')
  const [sessions, setSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [showHistorique, setShowHistorique] = useState(false)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      fetchSessions(user.id)
    }
    init()
  }, [])

  async function fetchSessions(uid) {
    setLoadingSessions(true)
    const { data } = await supabase
      .from('gei_sessions')
      .select('*')
      .eq('eleve_id', uid)
      .order('created_at', { ascending: false })
      .limit(20)
    setSessions(data || [])
    setLoadingSessions(false)
  }

  async function startSession() {
    setMode('loading')
    setError('')
    setSelections({})
    setCurrent(0)
    setScores([])
    setValide(false)

    const res = await fetch('/api/gei/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matiere, nbQuestions })
    })

    const data = await res.json()
    if (data.error) { setError(data.error); setMode(null); return }
    setQuestions(data.questions || [])
    setMode('session')
  }

  async function saveSession(finalScores, finalSelections) {
    if (!userId) return
    const score = finalScores.filter(Boolean).length
    await supabase.from('gei_sessions').insert({
      eleve_id: userId,
      matiere,
      nb_questions: questions.length,
      score,
      questions,
      reponses: finalSelections
    })
    fetchSessions(userId)
  }

  function toggleSelection(idx) {
    if (valide) return
    setSelections(prev => {
      const curr = prev[current] || []
      return {
        ...prev,
        [current]: curr.includes(idx) ? curr.filter(i => i !== idx) : [...curr, idx]
      }
    })
  }

  function validerQuestion() {
    const q = questions[current]
    const sel = selections[current] || []
    const bonnes = q.bonnes_reponses
    const correct = bonnes.length === sel.length && bonnes.every(b => sel.includes(b))
    const newScores = [...scores, correct]
    setScores(newScores)
    setValide(true)
  }

  function next() {
    setValide(false)
    if (current + 1 >= questions.length) {
      const finalScores = [...scores]
      saveSession(finalScores, selections)
      setMode('results')
    } else {
      setCurrent(current + 1)
    }
  }

  function restart() {
    setMode(null)
    setQuestions([])
    setSelections({})
    setCurrent(0)
    setScores([])
    setValide(false)
  }

  const totalScore = scores.filter(Boolean).length

  function scoreColor(score, total) {
    if (score >= total * 0.7) return t.teal
    if (score >= total * 0.5) return t.amber
    return t.coral
  }

  const s = {
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid ' + t.border },
    title: { fontSize: '18px', fontWeight: '600', color: t.text },
    content: { padding: '24px 28px', maxWidth: '760px' },
    card: { background: t.surface, border: '1px solid ' + t.border, borderRadius: '12px', padding: '24px', marginBottom: '16px' },
    btn: { padding: '9px 18px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    btnPrimary: { background: t.purple, color: '#1a1228' },
    btnGhost: { background: 'none', border: '1px solid ' + t.border2, color: t.muted2 },
    chip: { padding: '6px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', border: '1px solid ' + t.border2, fontWeight: '500' },
  }

  return (
    <AccesProtege>
      <>
        {!mode && (
          <div style={{ color: t.text }}>
            <div style={s.topbar}>
              <h1 style={s.title}>Prepa GEI</h1>
              <button
                onClick={() => setShowHistorique(!showHistorique)}
                style={{ ...s.btn, ...s.btnGhost, fontSize: '12px' }}
              >
                {showHistorique ? 'Masquer historique' : 'Voir historique (' + sessions.length + ')'}
              </button>
            </div>
            <div style={s.content}>

              {/* Historique */}
              {showHistorique && (
                <div style={{ ...s.card, marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: t.text, marginBottom: '14px' }}>Historique des sessions</div>
                  {loadingSessions ? (
                    <div style={{ color: t.muted, fontSize: '13px' }}>Chargement...</div>
                  ) : sessions.length === 0 ? (
                    <div style={{ color: t.muted, fontSize: '13px' }}>Aucune session pour le moment.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {sessions.map(session => (
                        <div key={session.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: t.surface2, borderRadius: '8px', fontSize: '13px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: t.purple + '22', color: t.purple }}>{session.matiere}</span>
                            <span style={{ color: t.muted }}>{new Date(session.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: t.muted, fontSize: '12px' }}>{session.nb_questions} questions</span>
                            <span style={{ fontWeight: '700', fontSize: '15px', color: scoreColor(session.score, session.nb_questions) }}>
                              {session.score}/{session.nb_questions}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Stats rapides par matière */}
              {!showHistorique && sessions.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                  {MATIERES.map(mat => {
                    const sessionsMatiere = sessions.filter(s => s.matiere === mat)
                    if (sessionsMatiere.length === 0) return null
                    const moy = (sessionsMatiere.reduce((sum, s) => sum + (s.score / s.nb_questions), 0) / sessionsMatiere.length * 100).toFixed(0)
                    return (
                      <div key={mat} style={{ background: t.surface, border: '1px solid ' + t.border, borderRadius: '10px', padding: '12px 14px' }}>
                        <div style={{ fontSize: '11px', color: t.muted, marginBottom: '4px' }}>{mat}</div>
                        <div style={{ fontSize: '22px', fontWeight: '700', color: scoreColor(parseInt(moy), 100) }}>{moy}%</div>
                        <div style={{ fontSize: '10px', color: t.muted, marginTop: '2px' }}>{sessionsMatiere.length} session{sessionsMatiere.length > 1 ? 's' : ''}</div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div style={s.card}>
                <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Configurer une session de 5 questions</div>
                <div style={{ fontSize: '12px', color: t.muted, marginBottom: '20px' }}>
                  Format réel GEI — plusieurs bonnes réponses possibles par question
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', color: t.muted, marginBottom: '10px' }}>Matiere</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {MATIERES.map(m => (
                      <div key={m} onClick={() => setMatiere(m)} style={{
                        ...s.chip,
                        background: matiere === m ? t.purple : 'none',
                        color: matiere === m ? '#1a1228' : t.muted2,
                        borderColor: matiere === m ? t.purple : t.border2,
                      }}>
                        {m}
                      </div>
                    ))}
                  </div>
                </div>

                {error && <div style={{ color: t.coral, fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

                <button onClick={startSession} style={{ ...s.btn, ...s.btnPrimary, width: '100%', padding: '11px' }}>
                  Generer avec Mistral IA
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'loading' && (
          <div style={{ color: t.text }}>
            <div style={s.topbar}><h1 style={s.title}>Prepa GEI</h1></div>
            <div style={{ padding: '80px', textAlign: 'center', color: t.muted }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>✦</div>
              <div>Mistral genere {nbQuestions} questions de {matiere} au format GEI...</div>
              <div style={{ fontSize: '12px', marginTop: '8px', color: t.muted }}>Cela peut prendre 10-20 secondes</div>
            </div>
          </div>
        )}

        {mode === 'session' && (() => {
          const q = questions[current]
          const sel = selections[current] || []
          return (
            <div style={{ color: t.text }}>
              <div style={s.topbar}>
                <h1 style={s.title}>GEI {matiere}</h1>
                <span style={{ fontSize: '13px', color: t.muted }}>Question {current + 1} / {questions.length}</span>
              </div>
              <div style={s.content}>
                <div style={{ height: '4px', background: t.surface2, borderRadius: '2px', marginBottom: '24px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: t.purple, borderRadius: '2px', width: ((current + 1) / questions.length * 100) + '%', transition: 'width 0.3s' }} />
                </div>

                <div style={s.card}>
                  <div style={{ fontSize: '11px', color: t.muted, marginBottom: '12px', fontStyle: 'italic' }}>
                    Cochez toutes les affirmations vraies (entre 1 et 5 reponses correctes)
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '500', color: t.text, lineHeight: 1.7, marginBottom: '24px' }}>
                    {q.enonce}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {q.propositions.map((prop, i) => {
                      const isSelected = sel.includes(i)
                      const isBonne = q.bonnes_reponses.includes(i)
                      let bg = isSelected ? t.purple + '22' : t.surface2
                      let border = isSelected ? t.purple : t.border2
                      let color = t.text
                      if (valide) {
                        if (isBonne) { bg = 'rgba(52,211,153,0.15)'; border = t.teal; color = t.teal }
                        else if (isSelected && !isBonne) { bg = 'rgba(248,113,113,0.15)'; border = t.coral; color = t.coral }
                        else { bg = t.surface2; color = t.muted; border = t.border2 }
                      }
                      return (
                        <div
                          key={i}
                          onClick={() => toggleSelection(i)}
                          style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid ' + border, background: bg, color, cursor: valide ? 'default' : 'pointer', display: 'flex', gap: '12px', alignItems: 'flex-start', transition: 'all 0.15s', fontSize: '13px', lineHeight: 1.6 }}
                        >
                          <div style={{ width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0, border: '2px solid ' + (valide ? (isBonne ? t.teal : isSelected ? t.coral : t.border2) : (isSelected ? t.purple : t.border2)), background: isSelected ? (valide ? (isBonne ? t.teal : t.coral) : t.purple) : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', marginTop: '1px' }}>
                            {isSelected && '✓'}
                          </div>
                          <span>{prop}</span>
                          {valide && isBonne && <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '11px' }}>✓ Vraie</span>}
                          {valide && isSelected && !isBonne && <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '11px' }}>✗ Fausse</span>}
                        </div>
                      )
                    })}
                  </div>

                  {valide && (
                    <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: t.blue, fontWeight: '600', marginBottom: '6px' }}>Correction</div>
                      <div style={{ fontSize: '13px', color: t.muted2, lineHeight: 1.7 }}>{q.explication}</div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    {!valide ? (
                      <button onClick={validerQuestion} disabled={sel.length === 0} style={{ ...s.btn, ...s.btnPrimary, flex: 1, opacity: sel.length === 0 ? 0.5 : 1 }}>
                        Valider ma reponse
                      </button>
                    ) : (
                      <button onClick={next} style={{ ...s.btn, ...s.btnPrimary, flex: 1 }}>
                        {current + 1 >= questions.length ? 'Voir les resultats →' : 'Question suivante →'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        {mode === 'results' && (
          <div style={{ color: t.text }}>
            <div style={s.topbar}><h1 style={s.title}>Resultats GEI {matiere}</h1></div>
            <div style={s.content}>
              <div style={s.card}>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <div style={{ fontSize: '52px', fontWeight: '700', color: scoreColor(totalScore, questions.length) }}>
                    {totalScore}/{questions.length}
                  </div>
                  <div style={{ fontSize: '14px', color: t.muted, marginTop: '8px' }}>
                    {totalScore >= questions.length * 0.7 ? 'Excellent travail !' : totalScore >= questions.length * 0.5 ? 'Bon debut, continue !' : 'A retravailler — consulte les corrections'}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
                  {questions.map((q, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 14px', borderRadius: '8px', background: t.surface2, fontSize: '12px', alignItems: 'flex-start' }}>
                      <span style={{ color: scores[i] ? t.teal : t.coral, fontWeight: '700', flexShrink: 0, fontSize: '14px' }}>
                        {scores[i] ? '✓' : '✗'}
                      </span>
                      <span style={{ color: t.muted2, flex: 1, lineHeight: 1.5 }}>{q.enonce}</span>
                      <span style={{ color: t.muted, fontSize: '11px', flexShrink: 0 }}>
                        Rep: {q.bonnes_reponses.map(r => String.fromCharCode(65 + r)).join(', ')}
                      </span>
                    </div>
                  ))}
                </div>

                <button onClick={restart} style={{ ...s.btn, ...s.btnPrimary, width: '100%' }}>
                  Nouvelle session
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    </AccesProtege>
  )
}
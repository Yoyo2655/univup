'use client'
import { useState } from 'react'
import { t } from '../../../lib/theme'

const MATIERES = ['Maths', 'Physique', 'Proba', 'Info']

export default function GeiPage() {
  const [matiere, setMatiere] = useState('Maths')
  const [nbQuestions, setNbQuestions] = useState(10)
  const [mode, setMode] = useState(null)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selections, setSelections] = useState({})
  const [valide, setValide] = useState(false)
  const [scores, setScores] = useState([])
  const [error, setError] = useState('')

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
    setScores(prev => [...prev, correct])
    setValide(true)
  }

  function next() {
    setValide(false)
    if (current + 1 >= questions.length) {
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

  const s = {
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: `1px solid ${t.border}` },
    title: { fontSize: '18px', fontWeight: '600', color: t.text },
    content: { padding: '24px 28px', maxWidth: '760px' },
    card: { background: t.surface, border: `1px solid ${t.border}`, borderRadius: '12px', padding: '24px', marginBottom: '16px' },
    btn: { padding: '9px 18px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    btnPrimary: { background: t.purple, color: '#1a1228' },
    btnGhost: { background: 'none', border: `1px solid ${t.border2}`, color: t.muted2 },
    chip: { padding: '6px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', border: `1px solid ${t.border2}`, fontWeight: '500' },
  }

  // ═══ ACCUEIL ═══
  if (!mode) return (
    <div style={{ color: t.text }}>
      <div style={s.topbar}><h1 style={s.title}>Prépa GEI</h1></div>
      <div style={s.content}>
        <div style={s.card}>
          <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Configurer une session</div>
          <div style={{ fontSize: '12px', color: t.muted, marginBottom: '20px' }}>
            Format réel GEI — plusieurs bonnes réponses possibles par question
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: t.muted, marginBottom: '10px' }}>Matière</div>
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

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: t.muted, marginBottom: '10px' }}>Nombre de questions</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[5, 10, 20].map(n => (
                <div key={n} onClick={() => setNbQuestions(n)} style={{
                  ...s.chip,
                  background: nbQuestions === n ? t.purple : 'none',
                  color: nbQuestions === n ? '#1a1228' : t.muted2,
                  borderColor: nbQuestions === n ? t.purple : t.border2,
                }}>
                  {n} questions
                </div>
              ))}
            </div>
          </div>

          {error && <div style={{ color: t.coral, fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

          <button onClick={startSession} style={{ ...s.btn, ...s.btnPrimary, width: '100%', padding: '11px' }}>
            ✦ Générer avec Gemini IA
          </button>
        </div>
      </div>
    </div>
  )

  // ═══ LOADING ═══
  if (mode === 'loading') return (
    <div style={{ color: t.text }}>
      <div style={s.topbar}><h1 style={s.title}>Prépa GEI</h1></div>
      <div style={{ padding: '80px', textAlign: 'center', color: t.muted }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>✦</div>
        <div>Gemini génère {nbQuestions} questions de {matiere} au format GEI…</div>
        <div style={{ fontSize: '12px', marginTop: '8px', color: t.muted }}>Cela peut prendre 10-20 secondes</div>
      </div>
    </div>
  )

  // ═══ SESSION ═══
  if (mode === 'session') {
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
            <div style={{ height: '100%', background: t.purple, borderRadius: '2px', width: `${((current + 1) / questions.length) * 100}%`, transition: 'width 0.3s' }} />
          </div>

          <div style={s.card}>
            <div style={{ fontSize: '11px', color: t.muted, marginBottom: '12px', fontStyle: 'italic' }}>
              Cochez toutes les affirmations vraies (entre 1 et 5 réponses correctes)
            </div>
            <div style={{ fontSize: '15px', fontWeight: '500', color: t.text, lineHeight: 1.7, marginBottom: '24px' }}>
              {q.enonce}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {q.propositions.map((prop, i) => {
                const isSelected = sel.includes(i)
                const isBonne = q.bonnes_reponses.includes(i)

                let bg = isSelected ? `${t.purple}22` : t.surface2
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
                    style={{
                      padding: '12px 16px', borderRadius: '8px', border: `1px solid ${border}`,
                      background: bg, color, cursor: valide ? 'default' : 'pointer',
                      display: 'flex', gap: '12px', alignItems: 'flex-start',
                      transition: 'all 0.15s', fontSize: '13px', lineHeight: 1.6
                    }}
                  >
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                      border: `2px solid ${valide ? (isBonne ? t.teal : isSelected ? t.coral : t.border2) : (isSelected ? t.purple : t.border2)}`,
                      background: isSelected ? (valide ? (isBonne ? t.teal : t.coral) : t.purple) : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', color: '#fff', marginTop: '1px'
                    }}>
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
              <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(96,165,250,0.08)', border: `1px solid rgba(96,165,250,0.2)`, borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: t.blue, fontWeight: '600', marginBottom: '6px' }}>💡 Correction</div>
                <div style={{ fontSize: '13px', color: t.muted2, lineHeight: 1.7 }}>{q.explication}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              {!valide ? (
                <button
                  onClick={validerQuestion}
                  disabled={sel.length === 0}
                  style={{ ...s.btn, ...s.btnPrimary, flex: 1, opacity: sel.length === 0 ? 0.5 : 1 }}
                >
                  Valider ma réponse
                </button>
              ) : (
                <button onClick={next} style={{ ...s.btn, ...s.btnPrimary, flex: 1 }}>
                  {current + 1 >= questions.length ? 'Voir les résultats →' : 'Question suivante →'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ═══ RÉSULTATS ═══
  if (mode === 'results') return (
    <div style={{ color: t.text }}>
      <div style={s.topbar}><h1 style={s.title}>Résultats GEI {matiere}</h1></div>
      <div style={s.content}>
        <div style={s.card}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '52px', fontWeight: '700', color: totalScore >= questions.length * 0.7 ? t.teal : totalScore >= questions.length * 0.5 ? t.amber : t.coral }}>
              {totalScore}/{questions.length}
            </div>
            <div style={{ fontSize: '14px', color: t.muted, marginTop: '8px' }}>
              {totalScore >= questions.length * 0.7 ? '🎉 Excellent travail !' : totalScore >= questions.length * 0.5 ? '👍 Bon début, continue !' : '💪 À retravailler — consulte les corrections'}
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
                  Rép: {q.bonnes_reponses.map(r => String.fromCharCode(65 + r)).join(', ')}
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
  )
}
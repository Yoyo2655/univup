'use client'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '../../../lib/supabase'
import { useSearchParams } from 'next/navigation'
import { t } from '../../../lib/theme'

function AppelContent() {
  const searchParams = useSearchParams()
  const seanceId = searchParams.get('seance')

  const [seance, setSeance] = useState(null)
  const [eleves, setEleves] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (seanceId) fetchSeance()
  }, [seanceId])

  async function fetchSeance() {
    const { data: seanceData } = await supabase
      .from('seances')
      .select('*')
      .eq('id', seanceId)
      .single()
    setSeance(seanceData)

    const { data: eleveData } = await supabase
      .from('seance_eleves')
      .select(`*, eleve:eleve_id(id, full_name, email)`)
      .eq('seance_id', seanceId)

    setEleves(eleveData?.map(e => ({
      ...e,
      presence: e.presence || null,
      note: e.note || '',
      feedback: e.feedback || ''
    })) || [])
    setLoading(false)
  }

  function updateEleve(eleveId, field, value) {
    setEleves(prev => prev.map(e =>
      e.eleve_id === eleveId ? { ...e, [field]: value } : e
    ))
  }

  async function saveAppel() {
    setSaving(true)
    for (const e of eleves) {
      await supabase.from('seance_eleves').update({
        presence: e.presence,
        note: e.note || null,
        feedback: e.feedback || null,
        feedback_at: e.feedback ? new Date().toISOString() : null
      }).eq('seance_id', seanceId).eq('eleve_id', e.eleve_id)
    }
    await supabase.from('seances').update({ statut: 'effectuee' }).eq('id', seanceId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const TYPES = {
    cours: { label: 'Cours', color: t.purple },
    kholle: { label: 'Khôlle', color: t.teal },
    entretien: { label: 'Entretien', color: t.coral }
  }

  const presents = eleves.filter(e => e.presence === 'present').length
  const absents = eleves.filter(e => e.presence === 'absent').length
  const retards = eleves.filter(e => e.presence === 'retard').length

  const s = {
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid t.border' },
    title: { fontSize: '18px', fontWeight: '600', color: t.text },
    content: { padding: '24px 28px' },
    btn: { padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    btnTeal: { background: t.teal, color: '#0d1f18' },
    btnGhost: { background: 'rgba(255,255,255,0.06)', color: t.muted2, border: '1px solid t.border' },
    card: { background: t.surface, border: '1px solid t.border', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' },
    input: { padding: '6px 10px', background: t.surface2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: t.text, fontSize: '12px', outline: 'none' },
  }

  if (!seanceId) return (
    <div style={{ padding: '40px', color: t.muted, textAlign: 'center' }}>
      Accède à la feuille d'appel depuis ton planning.
    </div>
  )

  if (loading) return (
    <div style={{ padding: '40px', color: t.muted, textAlign: 'center' }}>Chargement…</div>
  )

  return (
    <div style={{ color: t.text }}>
      <div style={s.topbar}>
        <div>
          <h1 style={s.title}>{seance?.titre}</h1>
          <div style={{ fontSize: '12px', color: t.muted, marginTop: '3px' }}>
            {new Date(seance?.date_debut).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
            {' · '}
            {new Date(seance?.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            {' – '}
            {new Date(seance?.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            {seance?.salle && ` · ${seance.salle}`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
            <span style={{ color: t.teal }}>✓ {presents} présent{presents > 1 ? 's' : ''}</span>
            <span style={{ color: t.coral }}>✗ {absents} absent{absents > 1 ? 's' : ''}</span>
            <span style={{ color: t.amber }}>⏱ {retards} retard{retards > 1 ? 's' : ''}</span>
          </div>
          <button
            onClick={saveAppel}
            disabled={saving}
            style={{ ...s.btn, ...s.btnTeal, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Enregistrement…' : saved ? '✓ Enregistré !' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div style={s.content}>
        {eleves.length === 0 ? (
          <div style={{ color: t.muted, textAlign: 'center', padding: '40px' }}>
            Aucun élève associé à cette séance.
          </div>
        ) : (
          eleves.map(e => (
            <div key={e.eleve_id} style={s.card}>
              <div style={{ padding: '16px 20px' }}>
                {/* Ligne principale */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(96,165,250,0.12)', color: t.blue,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: '600'
                  }}>
                    {e.eleve?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{e.eleve?.full_name}</div>
                    <div style={{ fontSize: '11px', color: t.muted }}>{e.eleve?.email}</div>
                  </div>

                  {/* Boutons présence */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { val: 'present', label: '✓ Présent', bg: 'rgba(52,211,153,0.12)', color: t.teal, border: t.teal },
                      { val: 'absent', label: '✗ Absent', bg: 'rgba(248,113,113,0.1)', color: t.coral, border: t.coral },
                      { val: 'retard', label: '⏱ Retard', bg: 'rgba(251,191,36,0.1)', color: t.amber, border: t.amber },
                    ].map(opt => (
                      <button
                        key={opt.val}
                        onClick={() => updateEleve(e.eleve_id, 'presence', e.presence === opt.val ? null : opt.val)}
                        style={{
                          padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                          border: `1px solid ${e.presence === opt.val ? opt.border : 'rgba(255,255,255,0.1)'}`,
                          background: e.presence === opt.val ? opt.bg : 'none',
                          color: e.presence === opt.val ? opt.color : t.muted,
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note + feedback si présent */}
                {e.presence === 'present' && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: t.muted, minWidth: '55px' }}>Note /20</span>
                    <input
                      type="number" min="0" max="20" step="0.5"
                      value={e.note}
                      onChange={ev => updateEleve(e.eleve_id, 'note', ev.target.value)}
                      placeholder="—"
                      style={{ ...s.input, width: '70px', textAlign: 'center' }}
                    />
                    <span style={{ fontSize: '12px', color: t.muted, minWidth: '65px', marginLeft: '8px' }}>Feedback</span>
                    <input
                      type="text"
                      value={e.feedback}
                      onChange={ev => updateEleve(e.eleve_id, 'feedback', ev.target.value)}
                      placeholder="Commentaire pour l'élève…"
                      style={{ ...s.input, flex: 1 }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function AppelPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: t.muted }}>Chargement…</div>}>
      <AppelContent />
    </Suspense>
  )
}
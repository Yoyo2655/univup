'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { t } from '../../../lib/theme'

export default function PlanningPage() {
  const [seances, setSeances] = useState([])
  const [profs, setProfs] = useState([])
  const [eleves, setEleves] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    type: 'cours',
    titre: '',
    matiere: '',
    date: '',
    heure_debut: '',
    heure_fin: '',
    salle: '',
    prof_ids: [],
    eleve_ids: [],
  })

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    const [seancesRes, profsRes, elevesRes] = await Promise.all([
      supabase.from('seances').select(`*, prof:prof_id(full_name)`).order('date_debut', { ascending: false }),
      supabase.from('users').select('id, full_name').eq('role', 'prof').eq('is_active', true),
      supabase.from('users').select('id, full_name').eq('role', 'eleve').eq('is_active', true),
    ])
    setSeances(seancesRes.data || [])
    setProfs(profsRes.data || [])
    setEleves(elevesRes.data || [])
    setLoading(false)
  }

  function toggleId(list, id) {
    return list.includes(id) ? list.filter(x => x !== id) : [...list, id]
  }

  function toggleAll(field, items) {
    const allIds = items.map(i => i.id)
    const allSelected = allIds.every(id => form[field].includes(id))
    setForm({ ...form, [field]: allSelected ? [] : allIds })
  }

  async function createSeance(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    if (form.prof_ids.length === 0) { setError('Sélectionne au moins un prof'); setSaving(false); return }
    if (form.eleve_ids.length === 0) { setError('Sélectionne au moins un élève'); setSaving(false); return }

    const date_debut = `${form.date}T${form.heure_debut}:00`
    const date_fin = `${form.date}T${form.heure_fin}:00`

    // Pour chaque prof sélectionné, créer une séance
    for (const prof_id of form.prof_ids) {
      const { data: seanceData, error: seanceError } = await supabase
        .from('seances')
        .insert({
          type: form.type,
          titre: form.titre,
          matiere: form.matiere,
          date_debut,
          date_fin,
          salle: form.salle,
          prof_id,
          statut: 'planifiee'
        })
        .select()
        .single()

      if (seanceError) { setError(seanceError.message); setSaving(false); return }

      // Associer les élèves
      const eleveRows = form.eleve_ids.map(eleve_id => ({
        seance_id: seanceData.id,
        eleve_id
      }))
      await supabase.from('seance_eleves').insert(eleveRows)
    }

    setForm({
      type: 'cours', titre: '', matiere: '', date: '',
      heure_debut: '', heure_fin: '', salle: '', prof_ids: [], eleve_ids: []
    })
    setShowForm(false)
    fetchAll()
    setSaving(false)
  }

  const TYPES = { cours: { label: 'Cours', color: t.purple }, kholle: { label: 'Khôlle', color: t.teal }}
  const MATIERES = ['Maths', 'Physique', 'Motivation', 'Anglais', 'Info', 'Autre']

  const s = {
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid t.border' },
    title: { fontSize: '18px', fontWeight: '600', color: t.text },
    btn: { padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    btnPrimary: { background: t.purple, color: '#1a1228' },
    btnGhost: { background: 'rgba(255,255,255,0.06)', color: t.muted2, border: '1px solid t.border' },
    content: { padding: '24px 28px' },
    card: { background: t.surface, border: '1px solid t.border', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', fontSize: '10px', fontWeight: '500', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px', borderBottom: '1px solid t.border' },
    td: { padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', color: t.muted2, verticalAlign: 'top' },
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 50, overflowY: 'auto', padding: '40px 20px' },
    modalBox: { background: t.surface, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '560px' },
    label: { display: 'block', fontSize: '12px', color: t.muted2, marginBottom: '6px', marginTop: '14px' },
    input: { width: '100%', padding: '9px 12px', background: t.surface2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: t.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
    select: { width: '100%', padding: '9px 12px', background: t.surface2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: t.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    checkList: { background: t.surface2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', maxHeight: '160px', overflowY: 'auto' },
    checkItem: { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: t.muted2 },
  }

  return (
    <div style={{ color: t.text }}>
      <div style={s.topbar}>
        <h1 style={s.title}>Planning global</h1>
        <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowForm(true)}>+ Nouvelle séance</button>
      </div>

      <div style={s.content}>
        <div style={s.card}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: t.muted }}>Chargement…</div>
          ) : seances.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: t.muted }}>
              Aucune séance — crée la première.
            </div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Type</th>
                  <th style={s.th}>Titre</th>
                  <th style={s.th}>Date</th>
                  <th style={s.th}>Prof</th>
                  <th style={s.th}>Salle</th>
                  <th style={s.th}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {seances.map(s2 => (
                  <tr key={s2.id}>
                    <td style={s.td}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
                        background: TYPES[s2.type]?.color + '22',
                        color: TYPES[s2.type]?.color
                      }}>
                        {TYPES[s2.type]?.label}
                      </span>
                    </td>
                    <td style={{ ...s.td, color: t.text, fontWeight: '500' }}>
                      {s2.titre}
                      {s2.matiere && <div style={{ fontSize: '11px', color: t.muted, marginTop: '2px' }}>{s2.matiere}</div>}
                    </td>
                    <td style={s.td}>
                      {new Date(s2.date_debut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      <div style={{ fontSize: '11px', color: t.muted, marginTop: '2px' }}>
                        {new Date(s2.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        {' – '}
                        {new Date(s2.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td style={s.td}>{s2.prof?.full_name || '—'}</td>
                    <td style={s.td}>{s2.salle || '—'}</td>
                    <td style={s.td}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
                        background: s2.statut === 'effectuee' ? 'rgba(52,211,153,0.12)' : s2.statut === 'annulee' ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)',
                        color: s2.statut === 'effectuee' ? t.teal : s2.statut === 'annulee' ? t.coral : t.amber
                      }}>
                        {s2.statut === 'effectuee' ? 'Effectuée' : s2.statut === 'annulee' ? 'Annulée' : 'Planifiée'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <div style={s.modal} onClick={() => setShowForm(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: t.text, fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
              Nouvelle séance
            </h2>

            <form onSubmit={createSeance}>
              {/* Type */}
              <label style={s.label}>Type</label>
              <select style={s.select} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="cours">Cours</option>
                <option value="kholle">Khôlle</option>
              </select>

              {/* Titre + Matière */}
              <label style={s.label}>Titre</label>
              <input style={s.input} value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} required placeholder="Ex: Réduction des endomorphismes" />

              <label style={s.label}>Matière</label>
              <select style={s.select} value={form.matiere} onChange={e => setForm({ ...form, matiere: e.target.value })}>
                <option value="">— Choisir —</option>
                {MATIERES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>

              {/* Date + Heures */}
              <label style={s.label}>Date</label>
              <input style={s.input} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />

              <div style={{ ...s.grid2, marginTop: '14px' }}>
                <div>
                  <label style={{ ...s.label, marginTop: 0 }}>Heure début</label>
                  <input style={s.input} type="time" value={form.heure_debut} onChange={e => setForm({ ...form, heure_debut: e.target.value })} required />
                </div>
                <div>
                  <label style={{ ...s.label, marginTop: 0 }}>Heure fin</label>
                  <input style={s.input} type="time" value={form.heure_fin} onChange={e => setForm({ ...form, heure_fin: e.target.value })} required />
                </div>
              </div>

              {/* Salle */}
              <label style={s.label}>Salle</label>
              <input style={s.input} value={form.salle} onChange={e => setForm({ ...form, salle: e.target.value })} placeholder="Ex: Salle 204" />

              {/* Profs */}
              <label style={s.label}>
                Professeur(s)
                <button type="button" onClick={() => toggleAll('prof_ids', profs)}
                  style={{ marginLeft: '8px', fontSize: '10px', color: t.purple, background: 'none', border: 'none', cursor: 'pointer' }}>
                  {form.prof_ids.length === profs.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
              </label>
              <div style={s.checkList}>
                {profs.length === 0 ? <div style={{ color: t.muted, fontSize: '12px', padding: '8px' }}>Aucun prof actif</div> :
                  profs.map(prof => (
                    <div key={prof.id} style={{
                      ...s.checkItem,
                      background: form.prof_ids.includes(prof.id) ? 'rgba(167,139,250,0.1)' : 'none',
                      color: form.prof_ids.includes(prof.id) ? t.purple : t.muted2
                    }}
                      onClick={() => setForm({ ...form, prof_ids: toggleId(form.prof_ids, prof.id) })}>
                      <span style={{ fontSize: '14px' }}>{form.prof_ids.includes(prof.id) ? '☑' : '☐'}</span>
                      {prof.full_name}
                    </div>
                  ))
                }
              </div>

              {/* Élèves */}
              <label style={s.label}>
                Élève(s)
                <button type="button" onClick={() => toggleAll('eleve_ids', eleves)}
                  style={{ marginLeft: '8px', fontSize: '10px', color: t.purple, background: 'none', border: 'none', cursor: 'pointer' }}>
                  {form.eleve_ids.length === eleves.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
              </label>
              <div style={s.checkList}>
                {eleves.length === 0 ? <div style={{ color: t.muted, fontSize: '12px', padding: '8px' }}>Aucun élève actif</div> :
                  eleves.map(eleve => (
                    <div key={eleve.id} style={{
                      ...s.checkItem,
                      background: form.eleve_ids.includes(eleve.id) ? 'rgba(167,139,250,0.1)' : 'none',
                      color: form.eleve_ids.includes(eleve.id) ? t.purple : t.muted2
                    }}
                      onClick={() => setForm({ ...form, eleve_ids: toggleId(form.eleve_ids, eleve.id) })}>
                      <span style={{ fontSize: '14px' }}>{form.eleve_ids.includes(eleve.id) ? '☑' : '☐'}</span>
                      {eleve.full_name}
                    </div>
                  ))
                }
              </div>

              {error && <div style={{ color: t.coral, fontSize: '12px', margin: '12px 0' }}>{error}</div>}

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" style={{ ...s.btn, ...s.btnGhost }} onClick={() => setShowForm(false)}>Annuler</button>
                <button type="submit" style={{ ...s.btn, ...s.btnPrimary }} disabled={saving}>
                  {saving ? 'Création…' : 'Créer la séance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
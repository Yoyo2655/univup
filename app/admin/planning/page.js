'use client'
import { useState } from 'react'
import { t } from '../../../lib/theme'

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MOIS_LABELS = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']

function Calendrier({ seances, onSeanceClick }) {
  const [today] = useState(new Date())
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)) }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)) }

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const days = []
  for (let i = startDow - 1; i >= 0; i--) days.push({ date: new Date(year, month, -i), currentMonth: false })
  for (let i = 1; i <= lastDay.getDate(); i++) days.push({ date: new Date(year, month, i), currentMonth: true })
  while (days.length < 42) days.push({ date: new Date(year, month + 1, days.length - startDow - lastDay.getDate() + 1), currentMonth: false })

  function seancesForDay(date) {
    return seances.filter(s => {
      const d = new Date(s.date_debut)
      return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
    }).sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut))
  }

  function isToday(date) {
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
  }

  const COLORS = { cours: t.purple, kholle: t.teal, entretien: t.coral }

  return (
    <div style={{ background: t.surface, border: '1px solid ' + t.border, borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid ' + t.border }}>
        <button onClick={prevMonth} style={{ background: 'none', border: '1px solid ' + t.border2, borderRadius: '8px', padding: '6px 14px', color: t.muted2, cursor: 'pointer', fontSize: '16px' }}>←</button>
        <span style={{ fontSize: '16px', fontWeight: '600', color: t.text }}>{MOIS_LABELS[month]} {year}</span>
        <button onClick={nextMonth} style={{ background: 'none', border: '1px solid ' + t.border2, borderRadius: '8px', padding: '6px 14px', color: t.muted2, cursor: 'pointer', fontSize: '16px' }}>→</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid ' + t.border }}>
        {JOURS.map(j => (
          <div key={j} style={{ padding: '8px', textAlign: 'center', fontSize: '11px', fontWeight: '500', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{j}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {days.map((day, idx) => {
          const daySeances = seancesForDay(day.date)
          return (
            <div key={idx} style={{ minHeight: '100px', padding: '6px', borderRight: (idx + 1) % 7 === 0 ? 'none' : '1px solid ' + t.border, borderBottom: idx >= 35 ? 'none' : '1px solid ' + t.border, background: !day.currentMonth ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: isToday(day.date) ? '700' : '400', color: isToday(day.date) ? '#1a1228' : day.currentMonth ? t.text : t.muted, background: isToday(day.date) ? t.purple : 'none', marginBottom: '4px' }}>
                {day.date.getDate()}
              </div>
              {daySeances.slice(0, 3).map(seance => (
                <div key={seance.id} onClick={() => onSeanceClick(seance)} style={{ background: (COLORS[seance.type] || t.purple) + '22', borderLeft: '3px solid ' + (COLORS[seance.type] || t.purple), borderRadius: '4px', padding: '2px 5px', marginBottom: '2px', fontSize: '10px', color: COLORS[seance.type] || t.purple, cursor: 'pointer', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', lineHeight: 1.4 }}>
                  {new Date(seance.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} {seance.titre}
                </div>
              ))}
              {daySeances.length > 3 && <div style={{ fontSize: '10px', color: t.muted }}>+{daySeances.length - 3} autres</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function PlanningPage() {
  const [seances, setSeances] = useState([])
  const [profs, setProfs] = useState([])
  const [eleves, setEleves] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [vue, setVue] = useState('liste')
  const [seanceDetail, setSeanceDetail] = useState(null)
  const [form, setForm] = useState({
    type: 'cours', titre: '', matiere: '', date: '',
    heure_debut: '', heure_fin: '', salle: '', prof_ids: [], eleve_ids: [],
  })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [seancesRes, profsRes, elevesRes] = await Promise.all([
      supabase.from('seances').select('*, prof:prof_id(full_name)').order('date_debut', { ascending: false }),
      supabase.from('users').select('id, full_name').eq('role', 'prof').eq('is_active', true),
      supabase.from('users').select('id, full_name').eq('role', 'eleve').eq('is_active', true),
    ])
    setSeances(seancesRes.data || [])
    setProfs(profsRes.data || [])
    setEleves(elevesRes.data || [])
    setLoading(false)
  }

  function toggleId(list, id) { return list.includes(id) ? list.filter(x => x !== id) : [...list, id] }

  function toggleAll(field, items) {
    const allIds = items.map(i => i.id)
    const allSelected = allIds.every(id => form[field].includes(id))
    setForm({ ...form, [field]: allSelected ? [] : allIds })
  }

  async function createSeance(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    if (form.prof_ids.length === 0) { setError('Selectionne au moins un prof'); setSaving(false); return }
    if (form.eleve_ids.length === 0) { setError('Selectionne au moins un eleve'); setSaving(false); return }
    const date_debut = form.date + 'T' + form.heure_debut + ':00'
    const date_fin = form.date + 'T' + form.heure_fin + ':00'
    for (const prof_id of form.prof_ids) {
      const { data: seanceData, error: seanceError } = await supabase.from('seances').insert({
        type: form.type, titre: form.titre, matiere: form.matiere,
        date_debut, date_fin, salle: form.salle, prof_id, statut: 'planifiee'
      }).select().single()
      if (seanceError) { setError(seanceError.message); setSaving(false); return }
      await supabase.from('seance_eleves').insert(form.eleve_ids.map(eleve_id => ({ seance_id: seanceData.id, eleve_id })))
    }
    setForm({ type: 'cours', titre: '', matiere: '', date: '', heure_debut: '', heure_fin: '', salle: '', prof_ids: [], eleve_ids: [] })
    setShowForm(false)
    fetchAll()
    setSaving(false)
  }

  const TYPES = { cours: { label: 'Cours', color: t.purple }, kholle: { label: 'Kholle', color: t.teal } }
  const MATIERES = ['Maths', 'Physique', 'Motivation', 'Anglais', 'Info', 'Autre']

  const s = {
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid ' + t.border },
    title: { fontSize: '18px', fontWeight: '600', color: t.text },
    btn: { padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    btnPrimary: { background: t.purple, color: '#1a1228' },
    btnGhost: { background: 'rgba(255,255,255,0.06)', color: t.muted2, border: '1px solid ' + t.border },
    content: { padding: '24px 28px' },
    card: { background: t.surface, border: '1px solid ' + t.border, borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', fontSize: '10px', fontWeight: '500', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px', borderBottom: '1px solid ' + t.border },
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
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setVue('liste')} style={{ ...s.btn, ...(vue === 'liste' ? s.btnPrimary : s.btnGhost) }}>
            Liste
          </button>
          <button onClick={() => setVue('calendrier')} style={{ ...s.btn, ...(vue === 'calendrier' ? s.btnPrimary : s.btnGhost) }}>
            Calendrier
          </button>
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowForm(true)}>+ Nouvelle seance</button>
        </div>
      </div>

      <div style={s.content}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: t.muted }}>Chargement...</div>
        ) : vue === 'calendrier' ? (
          <Calendrier seances={seances} onSeanceClick={setSeanceDetail} />
        ) : (
          <div style={s.card}>
            {seances.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: t.muted }}>Aucune seance — cree la premiere.</div>
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
                    <tr key={s2.id} style={{ cursor: 'pointer' }} onClick={() => setSeanceDetail(s2)}>
                      <td style={s.td}>
                        <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: TYPES[s2.type]?.color + '22', color: TYPES[s2.type]?.color }}>
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
                          {' - '}
                          {new Date(s2.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td style={s.td}>{s2.prof?.full_name || '-'}</td>
                      <td style={s.td}>{s2.salle || '-'}</td>
                      <td style={s.td}>
                        <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: s2.statut === 'effectuee' ? 'rgba(52,211,153,0.12)' : s2.statut === 'annulee' ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)', color: s2.statut === 'effectuee' ? t.teal : s2.statut === 'annulee' ? t.coral : t.amber }}>
                          {s2.statut === 'effectuee' ? 'Effectuee' : s2.statut === 'annulee' ? 'Annulee' : 'Planifiee'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modale detail seance */}
      {seanceDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }} onClick={() => setSeanceDetail(null)}>
          <div style={{ background: t.surface, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: t.text }}>{seanceDetail.titre}</div>
                {seanceDetail.matiere && <div style={{ fontSize: '12px', color: t.muted, marginTop: '2px' }}>{seanceDetail.matiere}</div>}
              </div>
              <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: TYPES[seanceDetail.type]?.color + '22', color: TYPES[seanceDetail.type]?.color }}>
                {TYPES[seanceDetail.type]?.label}
              </span>
            </div>
            {[
              { label: 'Date', value: new Date(seanceDetail.date_debut).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) },
              { label: 'Horaire', value: new Date(seanceDetail.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(seanceDetail.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) },
              { label: 'Prof', value: seanceDetail.prof?.full_name || '-' },
              { label: 'Salle', value: seanceDetail.salle || '-' },
              { label: 'Statut', value: seanceDetail.statut === 'effectuee' ? 'Effectuee' : seanceDetail.statut === 'annulee' ? 'Annulee' : 'Planifiee' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
                <span style={{ color: t.muted }}>{item.label}</span>
                <span style={{ color: t.text, fontWeight: '500', textAlign: 'right', textTransform: 'capitalize' }}>{item.value}</span>
              </div>
            ))}
            <button onClick={() => setSeanceDetail(null)} style={{ ...s.btn, ...s.btnGhost, width: '100%', marginTop: '16px' }}>Fermer</button>
          </div>
        </div>
      )}

      {/* Modale creation seance */}
      {showForm && (
        <div style={s.modal} onClick={() => setShowForm(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: t.text, fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Nouvelle seance</h2>
            <form onSubmit={createSeance}>
              <label style={s.label}>Type</label>
              <select style={s.select} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="cours">Cours</option>
                <option value="kholle">Kholle</option>
              </select>
              <label style={s.label}>Titre</label>
              <input style={s.input} value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} required placeholder="Ex: Reduction des endomorphismes" />
              <label style={s.label}>Matiere</label>
              <select style={s.select} value={form.matiere} onChange={e => setForm({ ...form, matiere: e.target.value })}>
                <option value="">Choisir</option>
                {MATIERES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <label style={s.label}>Date</label>
              <input style={s.input} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
              <div style={{ ...s.grid2, marginTop: '14px' }}>
                <div>
                  <label style={{ ...s.label, marginTop: 0 }}>Heure debut</label>
                  <input style={s.input} type="time" value={form.heure_debut} onChange={e => setForm({ ...form, heure_debut: e.target.value })} required />
                </div>
                <div>
                  <label style={{ ...s.label, marginTop: 0 }}>Heure fin</label>
                  <input style={s.input} type="time" value={form.heure_fin} onChange={e => setForm({ ...form, heure_fin: e.target.value })} required />
                </div>
              </div>
              <label style={s.label}>Salle</label>
              <input style={s.input} value={form.salle} onChange={e => setForm({ ...form, salle: e.target.value })} placeholder="Ex: Salle 204" />
              <label style={s.label}>
                Professeur(s)
                <button type="button" onClick={() => toggleAll('prof_ids', profs)} style={{ marginLeft: '8px', fontSize: '10px', color: t.purple, background: 'none', border: 'none', cursor: 'pointer' }}>
                  {form.prof_ids.length === profs.length ? 'Tout deselectionner' : 'Tout selectionner'}
                </button>
              </label>
              <div style={s.checkList}>
                {profs.length === 0 ? <div style={{ color: t.muted, fontSize: '12px', padding: '8px' }}>Aucun prof actif</div> :
                  profs.map(prof => (
                    <div key={prof.id} style={{ ...s.checkItem, background: form.prof_ids.includes(prof.id) ? 'rgba(167,139,250,0.1)' : 'none', color: form.prof_ids.includes(prof.id) ? t.purple : t.muted2 }}
                      onClick={() => setForm({ ...form, prof_ids: toggleId(form.prof_ids, prof.id) })}>
                      <span style={{ fontSize: '14px' }}>{form.prof_ids.includes(prof.id) ? '☑' : '☐'}</span>
                      {prof.full_name}
                    </div>
                  ))}
              </div>
              <label style={s.label}>
                Eleve(s)
                <button type="button" onClick={() => toggleAll('eleve_ids', eleves)} style={{ marginLeft: '8px', fontSize: '10px', color: t.purple, background: 'none', border: 'none', cursor: 'pointer' }}>
                  {form.eleve_ids.length === eleves.length ? 'Tout deselectionner' : 'Tout selectionner'}
                </button>
              </label>
              <div style={s.checkList}>
                {eleves.length === 0 ? <div style={{ color: t.muted, fontSize: '12px', padding: '8px' }}>Aucun eleve actif</div> :
                  eleves.map(eleve => (
                    <div key={eleve.id} style={{ ...s.checkItem, background: form.eleve_ids.includes(eleve.id) ? 'rgba(167,139,250,0.1)' : 'none', color: form.eleve_ids.includes(eleve.id) ? t.purple : t.muted2 }}
                      onClick={() => setForm({ ...form, eleve_ids: toggleId(form.eleve_ids, eleve.id) })}>
                      <span style={{ fontSize: '14px' }}>{form.eleve_ids.includes(eleve.id) ? '☑' : '☐'}</span>
                      {eleve.full_name}
                    </div>
                  ))}
              </div>
              {error && <div style={{ color: t.coral, fontSize: '12px', margin: '12px 0' }}>{error}</div>}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" style={{ ...s.btn, ...s.btnGhost }} onClick={() => setShowForm(false)}>Annuler</button>
                <button type="submit" style={{ ...s.btn, ...s.btnPrimary }} disabled={saving}>{saving ? 'Creation...' : 'Creer la seance'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
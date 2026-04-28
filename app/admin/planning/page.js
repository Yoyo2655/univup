'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useTheme, getTheme } from '../../context/ThemeContext'

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MOIS_LABELS = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']

function Calendrier({ seances, onSeanceClick, c, isDark }) {
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

  const COLORS = { cours: c.purple, kholle: c.teal, entretien: c.coral }

  return (
    <div style={{ background: c.surface, border: '1px solid ' + c.border, borderRadius: '12px', overflow: 'hidden', boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid ' + c.border }}>
        <button onClick={prevMonth} style={{ background: 'none', border: '1px solid ' + c.border2, borderRadius: '8px', padding: '6px 14px', color: c.muted2, cursor: 'pointer', fontSize: '16px' }}>←</button>
        <span style={{ fontSize: '16px', fontWeight: '600', color: c.text }}>{MOIS_LABELS[month]} {year}</span>
        <button onClick={nextMonth} style={{ background: 'none', border: '1px solid ' + c.border2, borderRadius: '8px', padding: '6px 14px', color: c.muted2, cursor: 'pointer', fontSize: '16px' }}>→</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid ' + c.border }}>
        {JOURS.map(j => <div key={j} style={{ padding: '8px', textAlign: 'center', fontSize: '11px', fontWeight: '500', color: c.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{j}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {days.map((day, idx) => {
          const daySeances = seancesForDay(day.date)
          return (
            <div key={idx} style={{ minHeight: '100px', padding: '6px', borderRight: (idx + 1) % 7 === 0 ? 'none' : '1px solid ' + c.border, borderBottom: idx >= 35 ? 'none' : '1px solid ' + c.border, background: !day.currentMonth ? (isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)') : 'transparent' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: isToday(day.date) ? '700' : '400', color: isToday(day.date) ? (isDark ? '#1a1228' : '#ffffff') : day.currentMonth ? c.text : c.muted, background: isToday(day.date) ? c.purple : 'none', marginBottom: '4px' }}>
                {day.date.getDate()}
              </div>
              {daySeances.slice(0, 3).map(seance => (
                <div key={seance.id} onClick={() => onSeanceClick(seance)} style={{ background: (COLORS[seance.type] || c.purple) + (isDark ? '22' : '15'), borderLeft: '3px solid ' + (COLORS[seance.type] || c.purple), borderRadius: '4px', padding: '2px 5px', marginBottom: '2px', fontSize: '10px', color: COLORS[seance.type] || c.purple, cursor: 'pointer', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', lineHeight: 1.4 }}>
                  {new Date(seance.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} {seance.titre}
                </div>
              ))}
              {daySeances.length > 3 && <div style={{ fontSize: '10px', color: c.muted }}>+{daySeances.length - 3} autres</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function PlanningPage() {
  const { theme, isDark } = useTheme()
  const c = getTheme(theme)

  const [seances, setSeances] = useState([])
  const [profs, setProfs] = useState([])
  const [eleves, setEleves] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [vue, setVue] = useState('liste')
  const [seanceDetail, setSeanceDetail] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [form, setForm] = useState({ type: 'cours', titre: '', matiere: '', date: '', heure_debut: '', heure_fin: '', salle: '', prof_ids: [], eleve_ids: [] })

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

  async function deleteSeance() {
    if (!seanceDetail) return
    setDeleting(true)
    // Supprimer d'abord les lignes seance_eleves liées
    await supabase.from('seance_eleves').delete().eq('seance_id', seanceDetail.id)
    await supabase.from('seances').delete().eq('id', seanceDetail.id)
    setDeleting(false)
    setShowDeleteConfirm(false)
    setSeanceDetail(null)
    fetchAll()
  }

  const TYPES = { cours: { label: 'Cours', color: c.purple }, kholle: { label: 'Kholle', color: c.teal } }
  const MATIERES = ['Maths', 'Physique', 'Motivation', 'Anglais', 'Info', 'Autre']

  const s = {
    btn: { padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' },
    btnPrimary: { background: c.purple, color: isDark ? '#1a1228' : '#ffffff' },
    btnGhost: { background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: c.muted2, border: '1px solid ' + c.border },
    btnDanger: { background: isDark ? 'rgba(248,113,113,0.1)' : 'rgba(220,38,38,0.06)', color: c.coral, border: '1px solid ' + (isDark ? 'rgba(248,113,113,0.2)' : 'rgba(220,38,38,0.15)') },
    card: { background: c.surface, border: '1px solid ' + c.border, borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)' },
    th: { textAlign: 'left', fontSize: '10px', fontWeight: '500', color: c.muted, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px', borderBottom: '1px solid ' + c.border },
    td: { padding: '12px 16px', borderBottom: '1px solid ' + c.border, fontSize: '13px', color: c.muted2, verticalAlign: 'top' },
    input: { width: '100%', padding: '9px 12px', background: c.surface2, border: '1px solid ' + c.border2, borderRadius: '8px', color: c.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
    label: { display: 'block', fontSize: '12px', color: c.muted2, marginBottom: '6px', marginTop: '14px' },
    checkList: { background: c.surface2, border: '1px solid ' + c.border2, borderRadius: '8px', padding: '8px', maxHeight: '160px', overflowY: 'auto' },
    checkItem: { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: c.muted2 },
  }

  return (
    <div style={{ color: c.text, background: c.bg, minHeight: '100vh', fontFamily: "'DM Sans', system-ui", transition: 'background 0.2s' }}>
      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid ' + c.border, background: c.surface, transition: 'background 0.2s' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: c.text, letterSpacing: '-0.3px', margin: 0 }}>Planning global</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setVue('liste')} style={{ ...s.btn, ...(vue === 'liste' ? s.btnPrimary : s.btnGhost) }}>Liste</button>
          <button onClick={() => setVue('calendrier')} style={{ ...s.btn, ...(vue === 'calendrier' ? s.btnPrimary : s.btnGhost) }}>Calendrier</button>
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowForm(true)}>+ Nouvelle seance</button>
        </div>
      </div>

      <div style={{ padding: '28px 32px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: c.muted }}>Chargement...</div>
        ) : vue === 'calendrier' ? (
          <Calendrier seances={seances} onSeanceClick={setSeanceDetail} c={c} isDark={isDark} />
        ) : (
          <div style={s.card}>
            {seances.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: c.muted }}>Aucune seance — cree la premiere.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Type', 'Titre', 'Date', 'Prof', 'Salle', 'Statut'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {seances.map(s2 => (
                    <tr key={s2.id} style={{ cursor: 'pointer' }} onClick={() => setSeanceDetail(s2)}>
                      <td style={s.td}>
                        <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: TYPES[s2.type]?.color + (isDark ? '22' : '15'), color: TYPES[s2.type]?.color }}>
                          {TYPES[s2.type]?.label}
                        </span>
                      </td>
                      <td style={{ ...s.td, color: c.text, fontWeight: '500' }}>
                        {s2.titre}
                        {s2.matiere && <div style={{ fontSize: '11px', color: c.muted, marginTop: '2px' }}>{s2.matiere}</div>}
                      </td>
                      <td style={s.td}>
                        {new Date(s2.date_debut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        <div style={{ fontSize: '11px', color: c.muted, marginTop: '2px' }}>
                          {new Date(s2.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {' - '}
                          {new Date(s2.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td style={s.td}>{s2.prof?.full_name || '-'}</td>
                      <td style={s.td}>{s2.salle || '-'}</td>
                      <td style={s.td}>
                        <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: s2.statut === 'effectuee' ? (isDark ? 'rgba(52,211,153,0.12)' : 'rgba(5,150,105,0.08)') : s2.statut === 'annulee' ? (isDark ? 'rgba(248,113,113,0.1)' : 'rgba(220,38,38,0.08)') : (isDark ? 'rgba(251,191,36,0.1)' : 'rgba(217,119,6,0.08)'), color: s2.statut === 'effectuee' ? c.teal : s2.statut === 'annulee' ? c.coral : c.amber }}>
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
      {seanceDetail && !showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }} onClick={() => setSeanceDetail(null)}>
          <div style={{ background: c.surface, border: '1px solid ' + c.border, borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: c.text }}>{seanceDetail.titre}</div>
                {seanceDetail.matiere && <div style={{ fontSize: '12px', color: c.muted, marginTop: '2px' }}>{seanceDetail.matiere}</div>}
              </div>
              <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: TYPES[seanceDetail.type]?.color + (isDark ? '22' : '15'), color: TYPES[seanceDetail.type]?.color }}>
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
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid ' + c.border, fontSize: '13px' }}>
                <span style={{ color: c.muted }}>{item.label}</span>
                <span style={{ color: c.text, fontWeight: '500', textAlign: 'right', textTransform: 'capitalize' }}>{item.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button onClick={() => setSeanceDetail(null)} style={{ ...s.btn, ...s.btnGhost, flex: 1 }}>Fermer</button>
              <button onClick={() => setShowDeleteConfirm(true)} style={{ ...s.btn, ...s.btnDanger, flex: 1 }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale confirmation suppression */}
      {showDeleteConfirm && seanceDetail && (
        <div style={{ position: 'fixed', inset: 0, background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 70 }} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{ background: c.surface, border: '1px solid ' + c.border, borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: c.coral, fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Supprimer cette seance ?</h2>
            <p style={{ fontSize: '13px', color: c.muted, marginBottom: '8px', lineHeight: 1.6 }}>
              Tu es sur le point de supprimer <strong style={{ color: c.text }}>{seanceDetail.titre}</strong>.
            </p>
            <p style={{ fontSize: '13px', color: c.muted, marginBottom: '24px', lineHeight: 1.6 }}>
              Toutes les presences et notes associees seront egalement supprimees. Cette action est irreversible.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setShowDeleteConfirm(false) }} style={{ ...s.btn, ...s.btnGhost, flex: 1 }}>Annuler</button>
              <button onClick={deleteSeance} disabled={deleting} style={{ ...s.btn, background: c.coral, color: '#fff', border: 'none', flex: 1, cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {deleting ? 'Suppression...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale creation seance */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 50, overflowY: 'auto', padding: '40px 20px' }} onClick={() => setShowForm(false)}>
          <div style={{ background: c.surface, border: '1px solid ' + c.border, borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '560px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: c.text, fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Nouvelle seance</h2>
            <form onSubmit={createSeance}>
              <label style={s.label}>Type</label>
              <select style={s.input} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="cours">Cours</option>
                <option value="kholle">Kholle</option>
              </select>
              <label style={s.label}>Titre</label>
              <input style={s.input} value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} required placeholder="Ex: Reduction des endomorphismes" />
              <label style={s.label}>Matiere</label>
              <select style={s.input} value={form.matiere} onChange={e => setForm({ ...form, matiere: e.target.value })}>
                <option value="">Choisir</option>
                {MATIERES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <label style={s.label}>Date</label>
              <input style={s.input} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
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
                <button type="button" onClick={() => toggleAll('prof_ids', profs)} style={{ marginLeft: '8px', fontSize: '10px', color: c.purple, background: 'none', border: 'none', cursor: 'pointer' }}>
                  {form.prof_ids.length === profs.length ? 'Tout deselectionner' : 'Tout selectionner'}
                </button>
              </label>
              <div style={s.checkList}>
                {profs.length === 0 ? <div style={{ color: c.muted, fontSize: '12px', padding: '8px' }}>Aucun prof actif</div> :
                  profs.map(prof => (
                    <div key={prof.id} style={{ ...s.checkItem, background: form.prof_ids.includes(prof.id) ? (isDark ? 'rgba(167,139,250,0.1)' : 'rgba(124,58,237,0.08)') : 'none', color: form.prof_ids.includes(prof.id) ? c.purple : c.muted2 }}
                      onClick={() => setForm({ ...form, prof_ids: toggleId(form.prof_ids, prof.id) })}>
                      <span>{form.prof_ids.includes(prof.id) ? '☑' : '☐'}</span>
                      {prof.full_name}
                    </div>
                  ))}
              </div>
              <label style={s.label}>
                Eleve(s)
                <button type="button" onClick={() => toggleAll('eleve_ids', eleves)} style={{ marginLeft: '8px', fontSize: '10px', color: c.purple, background: 'none', border: 'none', cursor: 'pointer' }}>
                  {form.eleve_ids.length === eleves.length ? 'Tout deselectionner' : 'Tout selectionner'}
                </button>
              </label>
              <div style={s.checkList}>
                {eleves.length === 0 ? <div style={{ color: c.muted, fontSize: '12px', padding: '8px' }}>Aucun eleve actif</div> :
                  eleves.map(eleve => (
                    <div key={eleve.id} style={{ ...s.checkItem, background: form.eleve_ids.includes(eleve.id) ? (isDark ? 'rgba(167,139,250,0.1)' : 'rgba(124,58,237,0.08)') : 'none', color: form.eleve_ids.includes(eleve.id) ? c.purple : c.muted2 }}
                      onClick={() => setForm({ ...form, eleve_ids: toggleId(form.eleve_ids, eleve.id) })}>
                      <span>{form.eleve_ids.includes(eleve.id) ? '☑' : '☐'}</span>
                      {eleve.full_name}
                    </div>
                  ))}
              </div>
              {error && <div style={{ color: c.coral, fontSize: '12px', margin: '12px 0' }}>{error}</div>}
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
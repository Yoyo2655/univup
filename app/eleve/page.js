'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useTheme, getTheme } from '../context/ThemeContext'
import AccesProtege from './AccesProtege'

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
    return seances.filter(item => {
      const d = new Date(item.seance?.date_debut)
      return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
    }).sort((a, b) => new Date(a.seance?.date_debut) - new Date(b.seance?.date_debut))
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
        {JOURS.map(j => (
          <div key={j} style={{ padding: '8px', textAlign: 'center', fontSize: '11px', fontWeight: '500', color: c.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{j}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {days.map((day, idx) => {
          const daySeances = seancesForDay(day.date)
          return (
            <div key={idx} style={{ minHeight: '100px', padding: '6px', borderRight: (idx + 1) % 7 === 0 ? 'none' : '1px solid ' + c.border, borderBottom: idx >= 35 ? 'none' : '1px solid ' + c.border, background: !day.currentMonth ? (isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)') : 'transparent' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: isToday(day.date) ? '700' : '400', color: isToday(day.date) ? (isDark ? '#1a1228' : '#ffffff') : day.currentMonth ? c.text : c.muted, background: isToday(day.date) ? c.blue : 'none', marginBottom: '4px' }}>
                {day.date.getDate()}
              </div>
              {daySeances.slice(0, 3).map(item => (
                <div key={item.seance_id} onClick={() => onSeanceClick(item)} style={{ background: (COLORS[item.seance?.type] || c.blue) + (isDark ? '22' : '15'), borderLeft: '3px solid ' + (COLORS[item.seance?.type] || c.blue), borderRadius: '4px', padding: '2px 5px', marginBottom: '2px', fontSize: '10px', color: COLORS[item.seance?.type] || c.blue, cursor: 'pointer', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', lineHeight: 1.4 }}>
                  {new Date(item.seance?.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} {item.seance?.titre}
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

export default function ElevePlanning() {
  const { theme, isDark } = useTheme()
  const c = getTheme(theme)

  const [seances, setSeances] = useState([])
  const [loading, setLoading] = useState(true)
  const [vue, setVue] = useState('liste')
  const [seanceDetail, setSeanceDetail] = useState(null)

  useEffect(() => { fetchSeances() }, [])

  async function fetchSeances() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('seance_eleves').select('*, seance:seance_id(*, prof:prof_id(full_name))').eq('eleve_id', user.id).order('seance_id', { ascending: true })
    setSeances(data || [])
    setLoading(false)
  }

  const TYPES = {
    cours: { label: 'Cours', color: c.purple },
    kholle: { label: 'Kholle', color: c.teal },
    entretien: { label: 'Entretien', color: c.coral }
  }

  const upcoming = seances.filter(s => new Date(s.seance?.date_debut) >= new Date())
  const past = seances.filter(s => new Date(s.seance?.date_debut) < new Date())

  const s = {
    btn: { padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
    btnGhost: { background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: c.muted2, border: '1px solid ' + c.border },
    btnPrimary: { background: c.purple, color: isDark ? '#1a1228' : '#ffffff' },
    card: { background: c.surface, border: '1px solid ' + c.border, borderRadius: '12px', marginBottom: '10px', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)' },
    seanceCard: { padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' },
    stripe: { width: '3px', borderRadius: '2px', alignSelf: 'stretch', minHeight: '40px', flexShrink: 0 },
    sectionLabel: { fontSize: '11px', color: c.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' },
  }

  return (
    <AccesProtege>
      <div style={{ color: c.text, background: c.bg, minHeight: '100vh', fontFamily: "'DM Sans', system-ui", transition: 'background 0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid ' + c.border, background: c.surface, transition: 'background 0.2s' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: c.text, letterSpacing: '-0.3px', margin: 0 }}>Mon planning</h1>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => setVue('liste')} style={{ ...s.btn, ...(vue === 'liste' ? s.btnPrimary : s.btnGhost) }}>Liste</button>
            <button onClick={() => setVue('calendrier')} style={{ ...s.btn, ...(vue === 'calendrier' ? s.btnPrimary : s.btnGhost) }}>Calendrier</button>
            <span style={{ fontSize: '12px', color: c.muted, marginLeft: '8px' }}>{upcoming.length} seance{upcoming.length > 1 ? 's' : ''} a venir</span>
          </div>
        </div>

        <div style={{ padding: '28px 32px' }}>
          {loading ? (
            <div style={{ color: c.muted, textAlign: 'center', padding: '40px' }}>Chargement...</div>
          ) : seances.length === 0 ? (
            <div style={{ color: c.muted, textAlign: 'center', padding: '40px' }}>Aucune seance planifiee.</div>
          ) : vue === 'calendrier' ? (
            <Calendrier seances={seances} onSeanceClick={setSeanceDetail} c={c} isDark={isDark} />
          ) : (
            <>
              {upcoming.length > 0 && (
                <>
                  <div style={s.sectionLabel}>A venir</div>
                  {upcoming.map(item => (
                    <div key={item.seance_id} style={s.card}>
                      <div style={s.seanceCard}>
                        <div style={{ ...s.stripe, background: TYPES[item.seance?.type]?.color }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: c.text, marginBottom: '4px' }}>{item.seance?.titre}</div>
                          <div style={{ fontSize: '12px', color: c.muted }}>
                            {new Date(item.seance?.date_debut).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
                            {' · '}
                            {new Date(item.seance?.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(item.seance?.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            {item.seance?.salle && ' · ' + item.seance.salle}
                          </div>
                          {item.seance?.prof?.full_name && <div style={{ fontSize: '11px', color: c.muted, marginTop: '3px' }}>Prof. {item.seance.prof.full_name}</div>}
                        </div>
                        <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: TYPES[item.seance?.type]?.color + (isDark ? '22' : '15'), color: TYPES[item.seance?.type]?.color }}>
                          {TYPES[item.seance?.type]?.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}
              {past.length > 0 && (
                <>
                  <div style={{ ...s.sectionLabel, marginTop: '24px' }}>Passees</div>
                  {past.map(item => (
                    <div key={item.seance_id} style={{ ...s.card, opacity: 0.6 }}>
                      <div style={s.seanceCard}>
                        <div style={{ ...s.stripe, background: TYPES[item.seance?.type]?.color }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: c.text, marginBottom: '4px' }}>{item.seance?.titre}</div>
                          <div style={{ fontSize: '12px', color: c.muted }}>
                            {new Date(item.seance?.date_debut).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
                            {' · '}
                            {new Date(item.seance?.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            {item.seance?.salle && ' · ' + item.seance.salle}
                          </div>
                          {item.seance?.prof?.full_name && <div style={{ fontSize: '11px', color: c.muted, marginTop: '3px' }}>Prof. {item.seance.prof.full_name}</div>}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: TYPES[item.seance?.type]?.color + (isDark ? '22' : '15'), color: TYPES[item.seance?.type]?.color }}>
                            {TYPES[item.seance?.type]?.label}
                          </span>
                          {item.note && (
                            <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: isDark ? 'rgba(52,211,153,0.12)' : 'rgba(5,150,105,0.08)', color: c.teal }}>
                              {item.note}/20
                            </span>
                          )}
                        </div>
                      </div>
                      {item.feedback && (
                        <div style={{ padding: '10px 20px 14px', borderTop: '1px solid ' + c.border, fontSize: '12px', color: c.muted2, fontStyle: 'italic' }}>
                          {item.feedback}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>

        {/* Modale detail seance */}
        {seanceDetail && (
          <div style={{ position: 'fixed', inset: 0, background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }} onClick={() => setSeanceDetail(null)}>
            <div style={{ background: c.surface, border: '1px solid ' + c.border, borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: c.text }}>{seanceDetail.seance?.titre}</div>
                  {seanceDetail.seance?.matiere && <div style={{ fontSize: '12px', color: c.muted, marginTop: '2px' }}>{seanceDetail.seance.matiere}</div>}
                </div>
                <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: TYPES[seanceDetail.seance?.type]?.color + (isDark ? '22' : '15'), color: TYPES[seanceDetail.seance?.type]?.color }}>
                  {TYPES[seanceDetail.seance?.type]?.label}
                </span>
              </div>
              {[
                { label: 'Date', value: new Date(seanceDetail.seance?.date_debut).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) },
                { label: 'Horaire', value: new Date(seanceDetail.seance?.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(seanceDetail.seance?.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) },
                { label: 'Prof', value: seanceDetail.seance?.prof?.full_name || '-' },
                { label: 'Salle', value: seanceDetail.seance?.salle || '-' },
                seanceDetail.note ? { label: 'Note', value: seanceDetail.note + '/20' } : null,
              ].filter(Boolean).map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid ' + c.border, fontSize: '13px' }}>
                  <span style={{ color: c.muted }}>{item.label}</span>
                  <span style={{ color: item.label === 'Note' ? c.teal : c.text, fontWeight: '500', textAlign: 'right', textTransform: 'capitalize' }}>{item.value}</span>
                </div>
              ))}
              {seanceDetail.feedback && (
                <div style={{ marginTop: '12px', padding: '10px 12px', background: c.surface2, borderRadius: '8px', fontSize: '12px', color: c.muted2, fontStyle: 'italic' }}>
                  💬 {seanceDetail.feedback}
                </div>
              )}
              <button onClick={() => setSeanceDetail(null)} style={{ ...s.btn, ...s.btnGhost, width: '100%', marginTop: '16px' }}>Fermer</button>
            </div>
          </div>
        )}
      </div>
    </AccesProtege>
  )
}
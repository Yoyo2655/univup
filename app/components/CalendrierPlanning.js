'use client'
import { useState } from 'react'
import { t } from '../lib/theme'

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export default function CalendrierPlanning({ seances, onSeanceClick }) {
  const [today] = useState(new Date())
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // Construire les jours du mois
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  // Lundi = 0
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const days = []
  // Jours du mois précédent
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({ date: d, currentMonth: false })
  }
  // Jours du mois courant
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), currentMonth: true })
  }
  // Compléter jusqu'à 42 cases (6 semaines)
  while (days.length < 42) {
    const d = new Date(year, month + 1, days.length - startDow - lastDay.getDate() + 1)
    days.push({ date: d, currentMonth: false })
  }

  function seancesForDay(date) {
    return seances.filter(s => {
      const d = new Date(s.date_debut)
      return d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
    }).sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut))
  }

  function isToday(date) {
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
  }

  const TYPES = {
    cours: { color: t.purple },
    kholle: { color: t.teal },
    entretien: { color: t.coral }
  }

  return (
    <div style={{ background: t.surface, border: '1px solid ' + t.border, borderRadius: '12px', overflow: 'hidden' }}>
      {/* Header navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid ' + t.border }}>
        <button
          onClick={prevMonth}
          style={{ background: 'none', border: '1px solid ' + t.border2, borderRadius: '8px', padding: '6px 12px', color: t.muted2, cursor: 'pointer', fontSize: '16px' }}
        >
          ←
        </button>
        <span style={{ fontSize: '16px', fontWeight: '600', color: t.text }}>
          {MOIS[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          style={{ background: 'none', border: '1px solid ' + t.border2, borderRadius: '8px', padding: '6px 12px', color: t.muted2, cursor: 'pointer', fontSize: '16px' }}
        >
          →
        </button>
      </div>

      {/* En-têtes jours */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid ' + t.border }}>
        {JOURS.map(j => (
          <div key={j} style={{ padding: '8px', textAlign: 'center', fontSize: '11px', fontWeight: '500', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {j}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {days.map((day, idx) => {
          const daySeances = seancesForDay(day.date)
          const isLast = idx >= 35
          return (
            <div
              key={idx}
              style={{
                minHeight: '100px',
                padding: '6px',
                borderRight: (idx + 1) % 7 === 0 ? 'none' : '1px solid ' + t.border,
                borderBottom: isLast ? 'none' : '1px solid ' + t.border,
                background: !day.currentMonth ? 'rgba(0,0,0,0.1)' : 'transparent',
              }}
            >
              {/* Numéro du jour */}
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: isToday(day.date) ? '700' : '400',
                color: isToday(day.date) ? '#1a1228' : day.currentMonth ? t.text : t.muted,
                background: isToday(day.date) ? t.purple : 'none',
                marginBottom: '4px'
              }}>
                {day.date.getDate()}
              </div>

              {/* Séances du jour */}
              {daySeances.slice(0, 3).map(seance => (
                <div
                  key={seance.id}
                  onClick={() => onSeanceClick && onSeanceClick(seance)}
                  style={{
                    background: TYPES[seance.type]?.color + '22',
                    border: '1px solid ' + TYPES[seance.type]?.color + '44',
                    borderLeft: '3px solid ' + TYPES[seance.type]?.color,
                    borderRadius: '4px',
                    padding: '2px 5px',
                    marginBottom: '2px',
                    fontSize: '10px',
                    color: TYPES[seance.type]?.color,
                    cursor: onSeanceClick ? 'pointer' : 'default',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.4
                  }}
                >
                  {new Date(seance.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} {seance.titre}
                </div>
              ))}
              {daySeances.length > 3 && (
                <div style={{ fontSize: '10px', color: t.muted, marginTop: '2px' }}>+{daySeances.length - 3} autres</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function SalairesPage() {
  const [profs, setProfs] = useState([])
  const [selectedProf, setSelectedProf] = useState(null)
  const [seances, setSeances] = useState([])
  const [bareme, setBareme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')
  const [showBareme, setShowBareme] = useState(false)
  const [baremeForm, setBaremeForm] = useState({ tarif_kholle: '', tarif_cours_solo: '', tarif_cours_groupe: '', tarif_par_eleve: '', seuil_eleves: '' })
  const [paiForm, setPaiForm] = useState({ montant: '', date_versement: '' })
  const [versements, setVersements] = useState([])
  const [saving, setSaving] = useState(false)
  const [mois, setMois] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => { fetchProfs() }, [])

  async function fetchProfs() {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'prof')
      .eq('is_active', true)
      .order('full_name')
    setProfs(data || [])
    setLoading(false)
  }

  async function openProf(prof) {
    setSelectedProf(prof)
    setView('detail')
    await fetchProfData(prof.id)
  }

  async function fetchProfData(profId) {
    const [year, month] = mois.split('-').map(Number)
    const debut = `${mois}-01`
    const finDate = new Date(year, month, 1) // premier jour du mois suivant
    const fin = finDate.toISOString()

    const { data: seancesData } = await supabase
      .from('seances')
      .select(`*, seance_eleves(eleve_id)`)
      .eq('prof_id', profId)
      .eq('statut', 'effectuee')
      .gte('date_debut', debut)
      .lt('date_debut', fin)
      .order('date_debut', { ascending: false })
    setSeances(seancesData || [])

    const { data: baremeData } = await supabase
      .from('bareme_profs')
      .select('*')
      .eq('prof_id', profId)
      .single()
    setBareme(baremeData || null)

    const { data: versData } = await supabase
      .from('salaires_profs')
      .select('*')
      .eq('prof_id', profId)
      .eq('mois', `${mois}-01`)
    setVersements(versData || [])
  }

  function calculMontant(seance, bar) {
    if (!bar) return 0
    const dureeH = (new Date(seance.date_fin) - new Date(seance.date_debut)) / 3600000
    const nbEleves = seance.seance_eleves?.length || 0

    if (seance.type === 'kholle') return bar.tarif_kholle * dureeH
    if (seance.type === 'cours') {
      if (nbEleves <= 1) return bar.tarif_cours_solo * dureeH
      const supplement = nbEleves > bar.seuil_eleves ? (nbEleves - bar.seuil_eleves) * bar.tarif_par_eleve : 0
      return (bar.tarif_cours_groupe + supplement) * dureeH
    }
    return bar.tarif_cours_groupe * dureeH
  }

  const totalDu = seances.reduce((sum, s) => sum + calculMontant(s, bareme), 0)
  const totalVerse = versements.reduce((sum, v) => sum + parseFloat(v.montant_verse || 0), 0)
  const resteAVerser = totalDu - totalVerse

  async function saveBareme(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      prof_id: selectedProf.id,
      tarif_kholle: parseFloat(baremeForm.tarif_kholle),
      tarif_cours_solo: parseFloat(baremeForm.tarif_cours_solo),
      tarif_cours_groupe: parseFloat(baremeForm.tarif_cours_groupe),
      tarif_par_eleve: parseFloat(baremeForm.tarif_par_eleve),
      seuil_eleves: parseInt(baremeForm.seuil_eleves),
    }
    if (bareme) {
      await supabase.from('bareme_profs').update(payload).eq('id', bareme.id)
    } else {
      await supabase.from('bareme_profs').insert(payload)
    }
    setShowBareme(false)
    await fetchProfData(selectedProf.id)
    setSaving(false)
  }

  async function addVersement(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('salaires_profs').insert({
      prof_id: selectedProf.id,
      mois: `${mois}-01`,
      montant_du: totalDu,
      montant_verse: parseFloat(paiForm.montant),
      date_versement: paiForm.date_versement,
      statut: parseFloat(paiForm.montant) >= resteAVerser ? 'solde' : 'partiel'
    })
    setPaiForm({ montant: '', date_versement: '' })
    await fetchProfData(selectedProf.id)
    setSaving(false)
  }

  const TYPES = {
    cours: { label: 'Cours', color: '#a78bfa' },
    kholle: { label: 'Khôlle', color: '#34d399' },
    entretien: { label: 'Entretien', color: '#f87171' }
  }

  const MOIS_LABELS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

  const s = {
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
    title: { fontSize: '18px', fontWeight: '600', color: '#e8e6e0' },
    btn: { padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    btnPrimary: { background: '#a78bfa', color: '#1a1228' },
    btnTeal: { background: '#34d399', color: '#0d1f18' },
    btnGhost: { background: 'rgba(255,255,255,0.06)', color: '#9e9c96', border: '1px solid rgba(255,255,255,0.07)' },
    content: { padding: '24px 28px' },
    card: { background: '#18181c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' },
    cardHeader: { padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    cardTitle: { fontSize: '13px', fontWeight: '600', color: '#e8e6e0' },
    cardBody: { padding: '20px' },
    th: { textAlign: 'left', fontSize: '10px', fontWeight: '500', color: '#6e6c66', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
    td: { padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', color: '#9e9c96' },
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' },
    label: { display: 'block', fontSize: '12px', color: '#9e9c96', marginBottom: '6px', marginTop: '14px' },
    input: { width: '100%', padding: '9px 12px', background: '#1e1e24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e8e6e0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
    modalBox: { background: '#18181c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px' },
  }

  // ═══ VUE LISTE ═══
  if (view === 'list') return (
    <div style={{ color: '#e8e6e0' }}>
      <div style={s.topbar}>
        <h1 style={s.title}>Salaires profs</h1>
        <select
          value={mois}
          onChange={e => setMois(e.target.value)}
          style={{ background: '#1e1e24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '7px 12px', color: '#e8e6e0', fontSize: '13px', outline: 'none' }}
        >
          {Array.from({ length: 12 }, (_, i) => {
            const d = new Date(2026, i, 1)
            const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            return <option key={val} value={val}>{MOIS_LABELS[i]} 2026</option>
          })}
        </select>
      </div>
      <div style={s.content}>
        <div style={s.card}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6e6c66' }}>Chargement…</div>
          ) : profs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6e6c66' }}>Aucun prof actif.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={s.th}>Professeur</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Barème</th>
                  <th style={s.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {profs.map(prof => (
                  <tr key={prof.id} style={{ cursor: 'pointer' }} onClick={() => openProf(prof)}>
                    <td style={{ ...s.td, color: '#e8e6e0', fontWeight: '500' }}>{prof.full_name}</td>
                    <td style={s.td}>{prof.email}</td>
                    <td style={s.td}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
                        background: 'rgba(167,139,250,0.12)', color: '#a78bfa'
                      }}>
                        Voir détail →
                      </span>
                    </td>
                    <td style={s.td} onClick={e => e.stopPropagation()}>
                      <button onClick={() => openProf(prof)} style={{ ...s.btn, ...s.btnGhost, padding: '4px 10px', fontSize: '11px' }}>
                        Ouvrir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )

  // ═══ VUE DETAIL PROF ═══
  return (
    <div style={{ color: '#e8e6e0' }}>
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => { setView('list'); setSelectedProf(null) }}
            style={{ ...s.btn, ...s.btnGhost, padding: '6px 10px' }}>← Retour</button>
          <div>
            <h1 style={s.title}>{selectedProf?.full_name}</h1>
            <div style={{ fontSize: '12px', color: '#6e6c66', marginTop: '2px' }}>{selectedProf?.email}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={mois}
            onChange={async e => { setMois(e.target.value); await fetchProfData(selectedProf.id) }}
            style={{ background: '#1e1e24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '7px 12px', color: '#e8e6e0', fontSize: '13px', outline: 'none' }}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const d = new Date(2026, i, 1)
              const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
              return <option key={val} value={val}>{MOIS_LABELS[i]} 2026</option>
            })}
          </select>
          <button onClick={() => {
            setBaremeForm({
              tarif_kholle: bareme?.tarif_kholle || '',
              tarif_cours_solo: bareme?.tarif_cours_solo || '',
              tarif_cours_groupe: bareme?.tarif_cours_groupe || '',
              tarif_par_eleve: bareme?.tarif_par_eleve || '',
              seuil_eleves: bareme?.seuil_eleves || '',
            })
            setShowBareme(true)
          }} style={{ ...s.btn, ...s.btnGhost }}>
            {bareme ? 'Modifier barème' : 'Définir barème'}
          </button>
        </div>
      </div>

      <div style={s.content}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

          {/* Récap financier */}
          <div style={s.card}>
            <div style={s.cardHeader}><span style={s.cardTitle}>Récap {MOIS_LABELS[parseInt(mois.split('-')[1]) - 1]}</span></div>
            <div style={s.cardBody}>
              {!bareme ? (
                <div style={{ color: '#6e6c66', fontSize: '12px' }}>
                  Aucun barème défini — clique sur "Définir barème" pour commencer.
                </div>
              ) : (
                <>
                  <div style={s.row}>
                    <span style={{ color: '#6e6c66' }}>Séances effectuées</span>
                    <span style={{ fontFamily: 'monospace' }}>{seances.length}</span>
                  </div>
                  <div style={s.row}>
                    <span style={{ color: '#6e6c66' }}>Total dû</span>
                    <span style={{ fontFamily: 'monospace', color: '#a78bfa', fontWeight: '600' }}>{totalDu.toFixed(2)}€</span>
                  </div>
                  <div style={s.row}>
                    <span style={{ color: '#6e6c66' }}>Déjà versé</span>
                    <span style={{ fontFamily: 'monospace', color: '#34d399' }}>{totalVerse.toFixed(2)}€</span>
                  </div>
                  <div style={{ ...s.row, borderBottom: 'none' }}>
                    <span style={{ color: '#6e6c66' }}>Reste à verser</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: '600', color: resteAVerser > 0 ? '#fbbf24' : '#34d399' }}>
                      {resteAVerser > 0 ? `${resteAVerser.toFixed(2)}€` : '✓ Soldé'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Enregistrer versement */}
          {bareme && resteAVerser > 0 && (
            <div style={s.card}>
              <div style={s.cardHeader}><span style={s.cardTitle}>Enregistrer un versement</span></div>
              <div style={s.cardBody}>
                <form onSubmit={addVersement}>
                  <label style={{ ...s.label, marginTop: 0 }}>Montant versé (€)</label>
                  <input style={s.input} type="number" step="0.01" value={paiForm.montant}
                    onChange={e => setPaiForm({ ...paiForm, montant: e.target.value })} required
                    placeholder={`Max: ${resteAVerser.toFixed(2)}€`} />
                  <label style={s.label}>Date du versement</label>
                  <input style={s.input} type="date" value={paiForm.date_versement}
                    onChange={e => setPaiForm({ ...paiForm, date_versement: e.target.value })} required />
                  <button type="submit" style={{ ...s.btn, ...s.btnTeal, marginTop: '16px', width: '100%' }} disabled={saving}>
                    {saving ? 'Enregistrement…' : 'Confirmer le versement'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Détail séances */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>Séances effectuées ce mois</span>
            <span style={{ fontSize: '11px', color: '#6e6c66' }}>{seances.length} séance{seances.length > 1 ? 's' : ''}</span>
          </div>
          {seances.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#6e6c66', fontSize: '13px' }}>
              Aucune séance pointée ce mois.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Date', 'Titre', 'Type', 'Élèves', 'Durée', 'Montant'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {seances.map(seance => {
                  const dureeH = (new Date(seance.date_fin) - new Date(seance.date_debut)) / 3600000
                  const nbEleves = seance.seance_eleves?.length || 0
                  const montant = calculMontant(seance, bareme)
                  return (
                    <tr key={seance.id}>
                      <td style={s.td}>{new Date(seance.date_debut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</td>
                      <td style={{ ...s.td, color: '#e8e6e0' }}>{seance.titre}</td>
                      <td style={s.td}>
                        <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: TYPES[seance.type]?.color + '22', color: TYPES[seance.type]?.color }}>
                          {TYPES[seance.type]?.label}
                        </span>
                      </td>
                      <td style={s.td}>{nbEleves}</td>
                      <td style={s.td}>{dureeH}h</td>
                      <td style={{ ...s.td, color: '#a78bfa', fontFamily: 'monospace', fontWeight: '600' }}>
                        {bareme ? `${montant.toFixed(2)}€` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Historique versements */}
        {versements.length > 0 && (
          <div style={s.card}>
            <div style={s.cardHeader}><span style={s.cardTitle}>Versements effectués</span></div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Date', 'Montant', 'Statut'].map(h => <th key={h} style={s.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {versements.map(v => (
                  <tr key={v.id}>
                    <td style={s.td}>{new Date(v.date_versement).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                    <td style={{ ...s.td, color: '#34d399', fontFamily: 'monospace', fontWeight: '600' }}>+{v.montant_verse}€</td>
                    <td style={s.td}>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: v.statut === 'solde' ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.1)', color: v.statut === 'solde' ? '#34d399' : '#fbbf24' }}>
                        {v.statut === 'solde' ? 'Soldé' : 'Partiel'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal barème */}
      {showBareme && (
        <div style={s.modal} onClick={() => setShowBareme(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#e8e6e0', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
              Barème — {selectedProf?.full_name}
            </h2>
            <p style={{ color: '#6e6c66', fontSize: '12px', marginBottom: '16px' }}>Tarifs en €/heure</p>
            <form onSubmit={saveBareme}>
              <label style={{ ...s.label, marginTop: 0 }}>Khôlle (€/h)</label>
              <input style={s.input} type="number" step="0.5" value={baremeForm.tarif_kholle} onChange={e => setBaremeForm({ ...baremeForm, tarif_kholle: e.target.value })} required placeholder="Ex: 60" />
              <label style={s.label}>Cours individuel (€/h)</label>
              <input style={s.input} type="number" step="0.5" value={baremeForm.tarif_cours_solo} onChange={e => setBaremeForm({ ...baremeForm, tarif_cours_solo: e.target.value })} required placeholder="Ex: 80" />
              <label style={s.label}>Cours collectif — base (€/h)</label>
              <input style={s.input} type="number" step="0.5" value={baremeForm.tarif_cours_groupe} onChange={e => setBaremeForm({ ...baremeForm, tarif_cours_groupe: e.target.value })} required placeholder="Ex: 50" />
              <label style={s.label}>Supplément par élève (€/élève/h)</label>
              <input style={s.input} type="number" step="0.5" value={baremeForm.tarif_par_eleve} onChange={e => setBaremeForm({ ...baremeForm, tarif_par_eleve: e.target.value })} required placeholder="Ex: 8" />
              <label style={s.label}>Seuil élèves pour supplément</label>
              <input style={s.input} type="number" value={baremeForm.seuil_eleves} onChange={e => setBaremeForm({ ...baremeForm, seuil_eleves: e.target.value })} required placeholder="Ex: 4" />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" style={{ ...s.btn, ...s.btnGhost }} onClick={() => setShowBareme(false)}>Annuler</button>
                <button type="submit" style={{ ...s.btn, ...s.btnPrimary }} disabled={saving}>{saving ? 'Sauvegarde…' : 'Sauvegarder'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
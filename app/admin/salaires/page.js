'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { t } from '../../../lib/theme'

export default function SalairesPage() {
  const [profs, setProfs] = useState([])
  const [selectedProf, setSelectedProf] = useState(null)
  const [seances, setSeances] = useState([])
  const [bareme, setBareme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')
  const [showBareme, setShowBareme] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [baremeForm, setBaremeForm] = useState({ tarif_kholle: '', tarif_cours_solo: '', tarif_cours_groupe: '', tarif_par_eleve: '', seuil_eleves: '' })
  const [paiForm, setPaiForm] = useState({ montant: '', date_versement: '' })
  const [versements, setVersements] = useState([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
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
    const finDate = new Date(year, month, 1)
    const fin = finDate.toISOString()

    const { data: seancesData } = await supabase
      .from('seances')
      .select('*, seance_eleves(eleve_id)')
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

  async function deleteProf() {
    setDeleting(true)
    await supabase.from('users').delete().eq('id', selectedProf.id)
    await fetch('/api/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selectedProf.id })
    })
    setDeleting(false)
    setShowDeleteConfirm(false)
    setView('list')
    setSelectedProf(null)
    fetchProfs()
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
    cours: { label: 'Cours', color: t.purple },
    kholle: { label: 'Kholle', color: t.teal },
    entretien: { label: 'Entretien', color: t.coral }
  }

  const MOIS_LABELS = ['Janvier','Fevrier','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre']

  const s = {
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid ' + t.border },
    title: { fontSize: '18px', fontWeight: '600', color: t.text },
    btn: { padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    btnPrimary: { background: t.purple, color: '#1a1228' },
    btnTeal: { background: t.teal, color: '#0d1f18' },
    btnGhost: { background: 'rgba(255,255,255,0.06)', color: t.muted2, border: '1px solid ' + t.border },
    btnDanger: { background: 'rgba(248,113,113,0.1)', color: t.coral, border: '1px solid rgba(248,113,113,0.2)' },
    content: { padding: '24px 28px' },
    card: { background: t.surface, border: '1px solid ' + t.border, borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' },
    cardHeader: { padding: '14px 20px', borderBottom: '1px solid ' + t.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    cardTitle: { fontSize: '13px', fontWeight: '600', color: t.text },
    cardBody: { padding: '20px' },
    th: { textAlign: 'left', fontSize: '10px', fontWeight: '500', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px', borderBottom: '1px solid ' + t.border },
    td: { padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', color: t.muted2 },
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' },
    label: { display: 'block', fontSize: '12px', color: t.muted2, marginBottom: '6px', marginTop: '14px' },
    input: { width: '100%', padding: '9px 12px', background: t.surface2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: t.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
    modalBox: { background: t.surface, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px' },
  }

  const moisSelector = (
    <select
      value={mois}
      onChange={e => setMois(e.target.value)}
      style={{ background: t.surface2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '7px 12px', color: t.text, fontSize: '13px', outline: 'none' }}
    >
      {Array.from({ length: 12 }, (_, i) => {
        const now = new Date()
        const d = new Date(now.getFullYear(), i, 1)
        const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        return <option key={val} value={val}>{MOIS_LABELS[i]} {d.getFullYear()}</option>
      })}
    </select>
  )

  if (view === 'list') return (
    <div style={{ color: t.text }}>
      <div style={s.topbar}>
        <h1 style={s.title}>Salaires profs</h1>
        {moisSelector}
      </div>
      <div style={s.content}>
        <div style={s.card}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: t.muted }}>Chargement...</div>
          ) : profs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: t.muted }}>Aucun prof actif.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={s.th}>Professeur</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {profs.map(prof => (
                  <tr key={prof.id} style={{ cursor: 'pointer' }} onClick={() => openProf(prof)}>
                    <td style={{ ...s.td, color: t.text, fontWeight: '500' }}>{prof.full_name}</td>
                    <td style={s.td}>{prof.email}</td>
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

  return (
    <div style={{ color: t.text }}>
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => { setView('list'); setSelectedProf(null) }} style={{ ...s.btn, ...s.btnGhost, padding: '6px 10px' }}>Retour</button>
          <div>
            <h1 style={s.title}>{selectedProf?.full_name}</h1>
            <div style={{ fontSize: '12px', color: t.muted, marginTop: '2px' }}>{selectedProf?.email}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={mois}
            onChange={async e => { setMois(e.target.value); await fetchProfData(selectedProf.id) }}
            style={{ background: t.surface2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '7px 12px', color: t.text, fontSize: '13px', outline: 'none' }}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const now = new Date()
              const d = new Date(now.getFullYear(), i, 1)
              const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
              return <option key={val} value={val}>{MOIS_LABELS[i]} {d.getFullYear()}</option>
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
            {bareme ? 'Modifier bareme' : 'Definir bareme'}
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} style={{ ...s.btn, ...s.btnDanger }}>
            Supprimer
          </button>
        </div>
      </div>

      <div style={s.content}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div style={s.card}>
            <div style={s.cardHeader}><span style={s.cardTitle}>Recap {MOIS_LABELS[parseInt(mois.split('-')[1]) - 1]}</span></div>
            <div style={s.cardBody}>
              {!bareme ? (
                <div style={{ color: t.muted, fontSize: '12px' }}>Aucun bareme defini — clique sur "Definir bareme" pour commencer.</div>
              ) : (
                <>
                  <div style={s.row}><span style={{ color: t.muted }}>Seances effectuees</span><span style={{ fontFamily: 'monospace' }}>{seances.length}</span></div>
                  <div style={s.row}><span style={{ color: t.muted }}>Total du</span><span style={{ fontFamily: 'monospace', color: t.purple, fontWeight: '600' }}>{totalDu.toFixed(2)}EUR</span></div>
                  <div style={s.row}><span style={{ color: t.muted }}>Deja verse</span><span style={{ fontFamily: 'monospace', color: t.teal }}>{totalVerse.toFixed(2)}EUR</span></div>
                  <div style={{ ...s.row, borderBottom: 'none' }}>
                    <span style={{ color: t.muted }}>Reste a verser</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: '600', color: resteAVerser > 0 ? t.amber : t.teal }}>
                      {resteAVerser > 0 ? resteAVerser.toFixed(2) + 'EUR' : 'Solde'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {bareme && resteAVerser > 0 && (
            <div style={s.card}>
              <div style={s.cardHeader}><span style={s.cardTitle}>Enregistrer un versement</span></div>
              <div style={s.cardBody}>
                <form onSubmit={addVersement}>
                  <label style={{ ...s.label, marginTop: 0 }}>Montant verse (EUR)</label>
                  <input style={s.input} type="number" step="0.01" value={paiForm.montant} onChange={e => setPaiForm({ ...paiForm, montant: e.target.value })} required placeholder={'Max: ' + resteAVerser.toFixed(2)} />
                  <label style={s.label}>Date du versement</label>
                  <input style={s.input} type="date" value={paiForm.date_versement} onChange={e => setPaiForm({ ...paiForm, date_versement: e.target.value })} required />
                  <button type="submit" style={{ ...s.btn, ...s.btnTeal, marginTop: '16px', width: '100%' }} disabled={saving}>
                    {saving ? 'Enregistrement...' : 'Confirmer le versement'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>Seances effectuees ce mois</span>
            <span style={{ fontSize: '11px', color: t.muted }}>{seances.length} seance{seances.length > 1 ? 's' : ''}</span>
          </div>
          {seances.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: t.muted, fontSize: '13px' }}>Aucune seance pointee ce mois.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Date', 'Titre', 'Type', 'Eleves', 'Duree', 'Montant'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {seances.map(seance => {
                  const dureeH = (new Date(seance.date_fin) - new Date(seance.date_debut)) / 3600000
                  const nbEleves = seance.seance_eleves?.length || 0
                  const montant = calculMontant(seance, bareme)
                  return (
                    <tr key={seance.id}>
                      <td style={s.td}>{new Date(seance.date_debut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</td>
                      <td style={{ ...s.td, color: t.text }}>{seance.titre}</td>
                      <td style={s.td}>
                        <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: TYPES[seance.type]?.color + '22', color: TYPES[seance.type]?.color }}>
                          {TYPES[seance.type]?.label}
                        </span>
                      </td>
                      <td style={s.td}>{nbEleves}</td>
                      <td style={s.td}>{dureeH}h</td>
                      <td style={{ ...s.td, color: t.purple, fontFamily: 'monospace', fontWeight: '600' }}>
                        {bareme ? montant.toFixed(2) + 'EUR' : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {versements.length > 0 && (
          <div style={s.card}>
            <div style={s.cardHeader}><span style={s.cardTitle}>Versements effectues</span></div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Date', 'Montant', 'Statut'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {versements.map(v => (
                  <tr key={v.id}>
                    <td style={s.td}>{new Date(v.date_versement).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                    <td style={{ ...s.td, color: t.teal, fontFamily: 'monospace', fontWeight: '600' }}>+{v.montant_verse}EUR</td>
                    <td style={s.td}>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: v.statut === 'solde' ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.1)', color: v.statut === 'solde' ? t.teal : t.amber }}>
                        {v.statut === 'solde' ? 'Solde' : 'Partiel'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modale suppression */}
      {showDeleteConfirm && (
        <div style={s.modal} onClick={() => setShowDeleteConfirm(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: t.coral, fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Supprimer ce prof ?</h2>
            <p style={{ fontSize: '13px', color: t.muted, marginBottom: '8px', lineHeight: 1.6 }}>
              Tu es sur le point de supprimer <strong style={{ color: t.text }}>{selectedProf?.full_name}</strong>.
            </p>
            <p style={{ fontSize: '13px', color: t.muted, marginBottom: '24px', lineHeight: 1.6 }}>
              Cette action supprimera son compte et toutes ses donnees. Elle est irreversible.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ ...s.btn, ...s.btnGhost, flex: 1 }}>Annuler</button>
              <button onClick={deleteProf} disabled={deleting} style={{ ...s.btn, background: t.coral, color: '#fff', border: 'none', flex: 1, cursor: deleting ? 'not-allowed' : 'pointer' }}>
                {deleting ? 'Suppression...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal bareme */}
      {showBareme && (
        <div style={s.modal} onClick={() => setShowBareme(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: t.text, fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Bareme — {selectedProf?.full_name}</h2>
            <p style={{ color: t.muted, fontSize: '12px', marginBottom: '16px' }}>Tarifs en EUR/heure</p>
            <form onSubmit={saveBareme}>
              <label style={{ ...s.label, marginTop: 0 }}>Kholle (EUR/h)</label>
              <input style={s.input} type="number" step="0.5" value={baremeForm.tarif_kholle} onChange={e => setBaremeForm({ ...baremeForm, tarif_kholle: e.target.value })} required placeholder="Ex: 60" />
              <label style={s.label}>Cours individuel (EUR/h)</label>
              <input style={s.input} type="number" step="0.5" value={baremeForm.tarif_cours_solo} onChange={e => setBaremeForm({ ...baremeForm, tarif_cours_solo: e.target.value })} required placeholder="Ex: 80" />
              <label style={s.label}>Cours collectif — base (EUR/h)</label>
              <input style={s.input} type="number" step="0.5" value={baremeForm.tarif_cours_groupe} onChange={e => setBaremeForm({ ...baremeForm, tarif_cours_groupe: e.target.value })} required placeholder="Ex: 50" />
              <label style={s.label}>Supplement par eleve (EUR/eleve/h)</label>
              <input style={s.input} type="number" step="0.5" value={baremeForm.tarif_par_eleve} onChange={e => setBaremeForm({ ...baremeForm, tarif_par_eleve: e.target.value })} required placeholder="Ex: 8" />
              <label style={s.label}>Seuil eleves pour supplement</label>
              <input style={s.input} type="number" value={baremeForm.seuil_eleves} onChange={e => setBaremeForm({ ...baremeForm, seuil_eleves: e.target.value })} required placeholder="Ex: 4" />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" style={{ ...s.btn, ...s.btnGhost }} onClick={() => setShowBareme(false)}>Annuler</button>
                <button type="submit" style={{ ...s.btn, ...s.btnPrimary }} disabled={saving}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
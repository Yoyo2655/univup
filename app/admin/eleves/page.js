'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useTheme, getTheme } from '../../context/ThemeContext'

export default function ElevesPage() {
  const { theme, isDark } = useTheme()
  const c = getTheme(theme)

  const [eleves, setEleves] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEleve, setSelectedEleve] = useState(null)
  const [abonnement, setAbonnement] = useState(null)
  const [paiements, setPaiements] = useState([])
  const [profil, setProfil] = useState(null)
  const [packs, setPacks] = useState([])
  const [showChangePack, setShowChangePack] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [aboForm, setAboForm] = useState({ pack_nom: '', montant: '', date_debut: '', date_fin: '' })
  const [paiForm, setPaiForm] = useState({ montant: '', date_virement: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [view, setView] = useState('list')

  useEffect(() => { fetchEleves(); fetchPacks() }, [])

  async function fetchEleves() {
    const { data } = await supabase.from('users').select('*, abonnements(pack_nom, statut, date_fin, montant)').eq('role', 'eleve').order('created_at', { ascending: false })
    setEleves(data || [])
    setLoading(false)
  }

  async function fetchPacks() {
    const { data } = await supabase.from('packs').select('*').eq('actif', true).order('ordre')
    setPacks(data || [])
  }

  async function openEleve(eleve) {
    setSelectedEleve(eleve)
    setView('detail')
    setProfil(null)
    const { data: aboData } = await supabase.from('abonnements').select('*').eq('eleve_id', eleve.id).order('created_at', { ascending: false }).limit(1).single()
    setAbonnement(aboData || null)
    if (aboData) {
      const { data: paiData } = await supabase.from('paiements_eleves').select('*').eq('abonnement_id', aboData.id).order('date_virement', { ascending: false })
      setPaiements(paiData || [])
    } else { setPaiements([]) }
    const { data: profilData } = await supabase.from('profils_eleves').select('*').eq('eleve_id', eleve.id).single()
    setProfil(profilData || null)
  }

  async function deleteEleve() {
    setDeleting(true)
    await supabase.from('users').delete().eq('id', selectedEleve.id)
    await fetch('/api/delete-user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: selectedEleve.id }) })
    setDeleting(false)
    setShowDeleteConfirm(false)
    setView('list')
    setSelectedEleve(null)
    fetchEleves()
  }

  async function toggleAccess(id, current) {
    await supabase.from('users').update({ is_active: !current }).eq('id', id)
    fetchEleves()
    if (selectedEleve?.id === id) setSelectedEleve({ ...selectedEleve, is_active: !current })
  }

  async function createAbonnement(e) {
    e.preventDefault()
    setSaving(true)
    const ref = 'UNIVUP-' + selectedEleve.full_name.split(' ')[0].toUpperCase() + '-' + new Date().getFullYear()
    const { data } = await supabase.from('abonnements').insert({ eleve_id: selectedEleve.id, pack_nom: aboForm.pack_nom, montant: parseFloat(aboForm.montant), date_debut: aboForm.date_debut, date_fin: aboForm.date_fin, statut: 'en_attente', reference_virement: ref }).select().single()
    setAbonnement(data)
    setAboForm({ pack_nom: '', montant: '', date_debut: '', date_fin: '' })
    setSaving(false)
  }

  async function changerPack(pack) {
    setSaving(true)
    const totalVerse = paiements.reduce((s, p) => s + parseFloat(p.montant), 0)
    const nouveauMontant = parseFloat(pack.prix)
    await supabase.from('abonnements').update({ pack_nom: pack.nom, montant: nouveauMontant, statut: totalVerse >= nouveauMontant ? 'actif' : 'en_attente' }).eq('id', abonnement.id)
    if (totalVerse >= nouveauMontant) await supabase.from('users').update({ is_active: true }).eq('id', selectedEleve.id)
    setShowChangePack(false)
    setSaving(false)
    openEleve(selectedEleve)
  }

  async function addPaiement(e) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('paiements_eleves').insert({ abonnement_id: abonnement.id, montant: parseFloat(paiForm.montant), date_virement: paiForm.date_virement, valide_par: user.id })
    const newTotal = paiements.reduce((s, p) => s + parseFloat(p.montant), 0) + parseFloat(paiForm.montant)
    if (newTotal >= parseFloat(abonnement.montant)) {
      await supabase.from('abonnements').update({ statut: 'actif' }).eq('id', abonnement.id)
      await supabase.from('users').update({ is_active: true }).eq('id', selectedEleve.id)
      setAbonnement({ ...abonnement, statut: 'actif' })
    }
    setPaiForm({ montant: '', date_virement: '' })
    openEleve(selectedEleve)
    setSaving(false)
  }

  const totalVerse = paiements.reduce((s, p) => s + parseFloat(p.montant), 0)
  const resteAPayer = abonnement ? parseFloat(abonnement.montant) - totalVerse : 0

  const STATUT = {
    actif: { label: 'Actif', color: c.teal, bg: isDark ? 'rgba(52,211,153,0.12)' : 'rgba(5,150,105,0.08)' },
    en_attente: { label: 'En attente', color: c.amber, bg: isDark ? 'rgba(251,191,36,0.1)' : 'rgba(217,119,6,0.08)' },
    expire: { label: 'Expire', color: c.coral, bg: isDark ? 'rgba(248,113,113,0.1)' : 'rgba(220,38,38,0.08)' },
  }

  const s = {
    btn: { padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    btnPrimary: { background: c.purple, color: isDark ? '#1a1228' : '#ffffff' },
    btnTeal: { background: c.teal, color: isDark ? '#0d1f18' : '#ffffff' },
    btnGhost: { background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: c.muted2, border: '1px solid ' + c.border },
    btnDanger: { background: isDark ? 'rgba(248,113,113,0.1)' : 'rgba(220,38,38,0.06)', color: c.coral, border: '1px solid ' + (isDark ? 'rgba(248,113,113,0.2)' : 'rgba(220,38,38,0.15)') },
    card: { background: c.surface, border: '1px solid ' + c.border, borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)' },
    cardHeader: { padding: '14px 20px', borderBottom: '1px solid ' + c.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    cardTitle: { fontSize: '13px', fontWeight: '600', color: c.text },
    cardBody: { padding: '20px' },
    th: { textAlign: 'left', fontSize: '10px', fontWeight: '500', color: c.muted, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px', borderBottom: '1px solid ' + c.border },
    td: { padding: '12px 16px', borderBottom: '1px solid ' + c.border, fontSize: '13px', color: c.muted2 },
    modal: { position: 'fixed', inset: 0, background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
    label: { display: 'block', fontSize: '12px', color: c.muted2, marginBottom: '6px', marginTop: '14px' },
    input: { width: '100%', padding: '9px 12px', background: c.surface2, border: '1px solid ' + c.border2, borderRadius: '8px', color: c.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
    row: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid ' + c.border, fontSize: '13px', gap: '12px' },
  }

  if (view === 'list') return (
    <div style={{ color: c.text, background: c.bg, minHeight: '100vh', fontFamily: "'DM Sans', system-ui", transition: 'background 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid ' + c.border, background: c.surface, transition: 'background 0.2s' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: c.text, letterSpacing: '-0.3px', margin: 0 }}>Eleves et abonnements</h1>
        <div style={{ fontSize: '12px', color: c.muted }}>Les eleves s'inscrivent via la page d'inscription</div>
      </div>
      <div style={{ padding: '28px 32px' }}>
        <div style={s.card}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: c.muted }}>Chargement...</div>
          ) : eleves.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: c.muted }}>Aucun eleve inscrit.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Nom', 'Email', 'Pack', 'Acces', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {eleves.map(eleve => (
                  <tr key={eleve.id} style={{ cursor: 'pointer' }} onClick={() => openEleve(eleve)}>
                    <td style={{ ...s.td, color: c.text, fontWeight: '500' }}>{eleve.full_name}</td>
                    <td style={s.td}>{eleve.email}</td>
                    <td style={s.td}>{eleve.abonnements?.[0]?.pack_nom || <span style={{ color: c.muted }}>-</span>}</td>
                    <td style={s.td}>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: eleve.is_active ? STATUT.actif.bg : STATUT.expire.bg, color: eleve.is_active ? c.teal : c.coral }}>
                        {eleve.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td style={s.td} onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleAccess(eleve.id, eleve.is_active)} style={{ ...s.btn, ...s.btnGhost, padding: '4px 10px', fontSize: '11px' }}>
                        {eleve.is_active ? 'Desactiver' : 'Activer'}
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
    <div style={{ color: c.text, background: c.bg, minHeight: '100vh', fontFamily: "'DM Sans', system-ui", transition: 'background 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid ' + c.border, background: c.surface, transition: 'background 0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => { setView('list'); setSelectedEleve(null) }} style={{ ...s.btn, ...s.btnGhost, padding: '6px 10px' }}>Retour</button>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: c.text, letterSpacing: '-0.3px', margin: 0 }}>{selectedEleve?.full_name}</h1>
            <div style={{ fontSize: '12px', color: c.muted, marginTop: '2px' }}>{selectedEleve?.email}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => toggleAccess(selectedEleve.id, selectedEleve.is_active)} style={{ ...s.btn, ...(selectedEleve?.is_active ? s.btnGhost : s.btnTeal) }}>
            {selectedEleve?.is_active ? "Desactiver l'acces" : "Activer l'acces"}
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} style={{ ...s.btn, ...s.btnDanger }}>Supprimer</button>
        </div>
      </div>

      <div style={{ padding: '28px 32px' }}>
        <div style={s.card}>
          <div style={s.cardHeader}><span style={s.cardTitle}>Profil concours</span></div>
          <div style={s.cardBody}>
            {!profil ? (
              <div style={{ fontSize: '12px', color: c.muted }}>Profil non encore renseigne par l'eleve.</div>
            ) : (
              <>
                <div style={s.row}><span style={{ color: c.muted, flexShrink: 0 }}>Universite</span><span style={{ color: c.text, fontWeight: '500', textAlign: 'right' }}>{profil.fac_origine || '-'}</span></div>
                <div style={s.row}><span style={{ color: c.muted, flexShrink: 0 }}>Statut</span><span style={{ color: c.text }}>{profil.statut_etudiant || '-'}</span></div>
                <div style={s.row}><span style={{ color: c.muted, flexShrink: 0 }}>Annee concours</span><span style={{ color: c.text }}>{profil.annee_concours || '-'}</span></div>
                <div style={s.row}>
                  <span style={{ color: c.muted, flexShrink: 0 }}>Dominante Centrale</span>
                  <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: isDark ? 'rgba(167,139,250,0.12)' : 'rgba(124,58,237,0.08)', color: c.purple }}>{profil.dominante_centrale || '-'}</span>
                </div>
                <div style={s.row}>
                  <span style={{ color: c.muted, flexShrink: 0 }}>Ecoles cibles</span>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {profil.ecoles_cibles?.length > 0 ? profil.ecoles_cibles.map(e => (
                      <span key={e} style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', background: isDark ? 'rgba(96,165,250,0.12)' : 'rgba(37,99,235,0.08)', color: c.blue }}>{e}</span>
                    )) : <span style={{ color: c.muted }}>-</span>}
                  </div>
                </div>
                <div style={{ ...s.row, borderBottom: 'none' }}>
                  <span style={{ color: c.muted, flexShrink: 0 }}>Ecoles GEI</span>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {profil.ecoles_gei?.length > 0 ? profil.ecoles_gei.map(e => (
                      <span key={e} style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', background: isDark ? 'rgba(251,191,36,0.12)' : 'rgba(217,119,6,0.08)', color: c.amber }}>{e}</span>
                    )) : <span style={{ color: c.muted }}>-</span>}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Abonnement</span>
              {abonnement && <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: STATUT[abonnement.statut]?.bg, color: STATUT[abonnement.statut]?.color }}>{STATUT[abonnement.statut]?.label}</span>}
            </div>
            <div style={s.cardBody}>
              {!abonnement ? (
                <form onSubmit={createAbonnement}>
                  <div style={{ color: c.muted, fontSize: '12px', marginBottom: '16px' }}>Aucun abonnement.</div>
                  <label style={{ ...s.label, marginTop: 0 }}>Pack</label>
                  <select style={{ ...s.input, cursor: 'pointer' }} value={aboForm.pack_nom} onChange={e => { const pack = packs.find(p => p.nom === e.target.value); setAboForm({ ...aboForm, pack_nom: e.target.value, montant: pack ? pack.prix : aboForm.montant }) }} required>
                    <option value="">Choisir un pack</option>
                    {packs.map(p => <option key={p.id} value={p.nom}>{p.nom} - {p.prix}EUR</option>)}
                  </select>
                  <label style={s.label}>Montant total (EUR)</label>
                  <input style={s.input} type="number" value={aboForm.montant} onChange={e => setAboForm({ ...aboForm, montant: e.target.value })} required placeholder="Rempli automatiquement" />
                  <label style={s.label}>Date debut</label>
                  <input style={s.input} type="date" value={aboForm.date_debut} onChange={e => setAboForm({ ...aboForm, date_debut: e.target.value })} required />
                  <label style={s.label}>Date fin</label>
                  <input style={s.input} type="date" value={aboForm.date_fin} onChange={e => setAboForm({ ...aboForm, date_fin: e.target.value })} required />
                  <button type="submit" style={{ ...s.btn, ...s.btnPrimary, marginTop: '16px', width: '100%' }} disabled={saving}>{saving ? 'Creation...' : "Creer l'abonnement"}</button>
                </form>
              ) : (
                <>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: c.purple, marginBottom: '16px' }}>{abonnement.pack_nom}</div>
                  <div style={s.row}><span style={{ color: c.muted }}>Montant total</span><span style={{ fontFamily: 'monospace' }}>{abonnement.montant}EUR</span></div>
                  <div style={s.row}><span style={{ color: c.muted }}>Verse</span><span style={{ fontFamily: 'monospace', color: c.teal }}>{totalVerse.toFixed(2)}EUR</span></div>
                  <div style={{ ...s.row, borderBottom: 'none' }}>
                    <span style={{ color: c.muted }}>Reste</span>
                    <span style={{ fontFamily: 'monospace', color: resteAPayer > 0 ? c.amber : c.teal }}>{resteAPayer > 0 ? resteAPayer.toFixed(2) + 'EUR' : 'Solde'}</span>
                  </div>
                  <div style={{ marginTop: '14px', padding: '10px 12px', background: c.surface2, borderRadius: '8px' }}>
                    <div style={{ fontSize: '10px', color: c.muted, marginBottom: '4px' }}>Reference virement</div>
                    <div style={{ fontFamily: 'monospace', color: c.purple, fontSize: '14px' }}>{abonnement.reference_virement}</div>
                  </div>
                  <button onClick={() => setShowChangePack(true)} style={{ ...s.btn, ...s.btnGhost, marginTop: '12px', width: '100%', fontSize: '12px' }}>Changer de pack</button>
                </>
              )}
            </div>
          </div>

          {abonnement && resteAPayer > 0 && (
            <div style={s.card}>
              <div style={s.cardHeader}><span style={s.cardTitle}>Enregistrer un virement recu</span></div>
              <div style={s.cardBody}>
                <form onSubmit={addPaiement}>
                  <label style={{ ...s.label, marginTop: 0 }}>Montant recu (EUR)</label>
                  <input style={s.input} type="number" step="0.01" value={paiForm.montant} onChange={e => setPaiForm({ ...paiForm, montant: e.target.value })} required placeholder={'Max: ' + resteAPayer.toFixed(2)} />
                  <label style={s.label}>Date du virement</label>
                  <input style={s.input} type="date" value={paiForm.date_virement} onChange={e => setPaiForm({ ...paiForm, date_virement: e.target.value })} required />
                  <button type="submit" style={{ ...s.btn, ...s.btnTeal, marginTop: '16px', width: '100%' }} disabled={saving}>{saving ? 'Enregistrement...' : 'Confirmer le virement'}</button>
                  <div style={{ fontSize: '11px', color: c.muted, marginTop: '8px', textAlign: 'center' }}>Si le total atteint {abonnement.montant}EUR, l'acces sera active automatiquement.</div>
                </form>
              </div>
            </div>
          )}
        </div>

        {abonnement && (
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Historique des paiements</span>
              <span style={{ fontSize: '11px', color: c.muted }}>{paiements.length} virement{paiements.length > 1 ? 's' : ''}</span>
            </div>
            {paiements.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: c.muted, fontSize: '13px' }}>Aucun paiement enregistre.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{['Date', 'Montant', 'Valide par'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {paiements.map(p => (
                    <tr key={p.id}>
                      <td style={s.td}>{new Date(p.date_virement).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                      <td style={{ ...s.td, color: c.teal, fontFamily: 'monospace', fontWeight: '600' }}>+{p.montant}EUR</td>
                      <td style={s.td}>Admin</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modale suppression */}
      {showDeleteConfirm && (
        <div style={s.modal} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{ background: c.surface, border: '1px solid ' + c.border, borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: c.coral, fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Supprimer cet eleve ?</h2>
            <p style={{ fontSize: '13px', color: c.muted, marginBottom: '8px', lineHeight: 1.6 }}>Tu es sur le point de supprimer <strong style={{ color: c.text }}>{selectedEleve?.full_name}</strong>.</p>
            <p style={{ fontSize: '13px', color: c.muted, marginBottom: '24px', lineHeight: 1.6 }}>Cette action supprimera son compte, ses resultats, son abonnement et toutes ses donnees. Elle est irreversible.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ ...s.btn, ...s.btnGhost, flex: 1 }}>Annuler</button>
              <button onClick={deleteEleve} disabled={deleting} style={{ ...s.btn, background: c.coral, color: '#fff', border: 'none', flex: 1, cursor: deleting ? 'not-allowed' : 'pointer' }}>{deleting ? 'Suppression...' : 'Confirmer'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale changement de pack */}
      {showChangePack && (
        <div style={s.modal} onClick={() => setShowChangePack(false)}>
          <div style={{ background: c.surface, border: '1px solid ' + c.border, borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: c.text, fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>Changer de pack</h2>
            <p style={{ fontSize: '13px', color: c.muted, marginBottom: '6px', lineHeight: 1.6 }}>Pack actuel : <strong style={{ color: c.text }}>{abonnement?.pack_nom}</strong> ({abonnement?.montant}EUR)</p>
            <p style={{ fontSize: '13px', color: c.muted, marginBottom: '20px', lineHeight: 1.6 }}>Deja verse : <strong style={{ color: c.teal }}>{totalVerse.toFixed(2)}EUR</strong></p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {packs.map(pack => {
                const nouveauReste = parseFloat(pack.prix) - totalVerse
                return (
                  <div key={pack.id} onClick={() => changerPack(pack)} style={{ background: c.surface2, border: '1px solid ' + c.border, borderRadius: '10px', padding: '16px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = c.purple}
                    onMouseLeave={e => e.currentTarget.style.borderColor = c.border}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: c.text }}>{pack.nom}</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: c.purple }}>{pack.prix}EUR</div>
                    </div>
                    <div style={{ fontSize: '12px', color: nouveauReste > 0 ? c.amber : c.teal }}>
                      {nouveauReste > 0 ? 'Reste a payer apres changement : ' + nouveauReste.toFixed(2) + 'EUR' : 'Deja paye — sera marque comme solde'}
                    </div>
                  </div>
                )
              })}
            </div>
            <button onClick={() => setShowChangePack(false)} style={{ ...s.btn, ...s.btnGhost, marginTop: '16px', width: '100%' }}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  )
}
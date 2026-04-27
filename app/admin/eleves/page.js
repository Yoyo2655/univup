'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { t } from '../../../lib/theme'

export default function ElevesPage() {
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
  const [error, setError] = useState('')
  const [view, setView] = useState('list')

  useEffect(() => { fetchEleves(); fetchPacks() }, [])

  async function fetchEleves() {
    const { data } = await supabase
      .from('users')
      .select('*, abonnements(pack_nom, statut, date_fin, montant)')
      .eq('role', 'eleve')
      .order('created_at', { ascending: false })
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

    const { data: aboData } = await supabase
      .from('abonnements')
      .select('*')
      .eq('eleve_id', eleve.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    setAbonnement(aboData || null)

    if (aboData) {
      const { data: paiData } = await supabase
        .from('paiements_eleves')
        .select('*')
        .eq('abonnement_id', aboData.id)
        .order('date_virement', { ascending: false })
      setPaiements(paiData || [])
    } else {
      setPaiements([])
    }

    const { data: profilData } = await supabase
      .from('profils_eleves')
      .select('*')
      .eq('eleve_id', eleve.id)
      .single()
    setProfil(profilData || null)
  }

  async function deleteEleve() {
    setDeleting(true)
    // Supprimer dans la table users (le cascade supprimera les données liées)
    await supabase.from('users').delete().eq('id', selectedEleve.id)
    // Supprimer dans auth (nécessite service role — via API)
    await fetch('/api/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selectedEleve.id })
    })
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
    const { data } = await supabase.from('abonnements').insert({
      eleve_id: selectedEleve.id,
      pack_nom: aboForm.pack_nom,
      montant: parseFloat(aboForm.montant),
      date_debut: aboForm.date_debut,
      date_fin: aboForm.date_fin,
      statut: 'en_attente',
      reference_virement: ref
    }).select().single()
    setAbonnement(data)
    setAboForm({ pack_nom: '', montant: '', date_debut: '', date_fin: '' })
    setSaving(false)
  }

  async function changerPack(pack) {
    setSaving(true)
    const totalVerse = paiements.reduce((s, p) => s + parseFloat(p.montant), 0)
    const nouveauMontant = parseFloat(pack.prix)
    await supabase.from('abonnements').update({
      pack_nom: pack.nom,
      montant: nouveauMontant,
      statut: totalVerse >= nouveauMontant ? 'actif' : 'en_attente'
    }).eq('id', abonnement.id)
    if (totalVerse >= nouveauMontant) {
      await supabase.from('users').update({ is_active: true }).eq('id', selectedEleve.id)
    }
    setShowChangePack(false)
    setSaving(false)
    openEleve(selectedEleve)
  }

  async function addPaiement(e) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('paiements_eleves').insert({
      abonnement_id: abonnement.id,
      montant: parseFloat(paiForm.montant),
      date_virement: paiForm.date_virement,
      valide_par: user.id
    })
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
    actif: { label: 'Actif', color: t.teal, bg: 'rgba(52,211,153,0.12)' },
    en_attente: { label: 'En attente', color: t.amber, bg: 'rgba(251,191,36,0.1)' },
    expire: { label: 'Expire', color: t.coral, bg: 'rgba(248,113,113,0.1)' },
  }

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
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', fontSize: '10px', fontWeight: '500', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px', borderBottom: '1px solid ' + t.border },
    td: { padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', color: t.muted2 },
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
    modalBox: { background: t.surface, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px' },
    label: { display: 'block', fontSize: '12px', color: t.muted2, marginBottom: '6px', marginTop: '14px' },
    input: { width: '100%', padding: '9px 12px', background: t.surface2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: t.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
    row: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', gap: '12px' },
  }

  if (view === 'list') return (
    <div style={{ color: t.text }}>
      <div style={s.topbar}>
        <h1 style={s.title}>Eleves et abonnements</h1>
        <div style={{ fontSize: '12px', color: t.muted }}>
          Les eleves s'inscrivent eux-memes via la page d'inscription
        </div>
      </div>
      <div style={s.content}>
        <div style={s.card}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: t.muted }}>Chargement...</div>
          ) : eleves.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: t.muted }}>Aucun eleve inscrit pour le moment.</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Nom</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Pack</th>
                  <th style={s.th}>Acces</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {eleves.map(eleve => (
                  <tr key={eleve.id} style={{ cursor: 'pointer' }} onClick={() => openEleve(eleve)}>
                    <td style={{ ...s.td, color: t.text, fontWeight: '500' }}>{eleve.full_name}</td>
                    <td style={s.td}>{eleve.email}</td>
                    <td style={s.td}>{eleve.abonnements?.[0]?.pack_nom || <span style={{ color: t.muted }}>-</span>}</td>
                    <td style={s.td}>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: eleve.is_active ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.1)', color: eleve.is_active ? t.teal : t.coral }}>
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
    <div style={{ color: t.text }}>
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => { setView('list'); setSelectedEleve(null) }} style={{ ...s.btn, ...s.btnGhost, padding: '6px 10px' }}>Retour</button>
          <div>
            <h1 style={s.title}>{selectedEleve?.full_name}</h1>
            <div style={{ fontSize: '12px', color: t.muted, marginTop: '2px' }}>{selectedEleve?.email}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => toggleAccess(selectedEleve.id, selectedEleve.is_active)} style={{ ...s.btn, ...(selectedEleve?.is_active ? s.btnGhost : s.btnTeal) }}>
            {selectedEleve?.is_active ? "Desactiver l'acces" : "Activer l'acces"}
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} style={{ ...s.btn, ...s.btnDanger }}>
            Supprimer
          </button>
        </div>
      </div>

      <div style={s.content}>
        <div style={s.card}>
          <div style={s.cardHeader}><span style={s.cardTitle}>Profil concours</span></div>
          <div style={s.cardBody}>
            {!profil ? (
              <div style={{ fontSize: '12px', color: t.muted }}>Profil non encore renseigne par l'eleve.</div>
            ) : (
              <>
                <div style={s.row}><span style={{ color: t.muted, flexShrink: 0 }}>Universite</span><span style={{ color: t.text, fontWeight: '500', textAlign: 'right' }}>{profil.fac_origine || '-'}</span></div>
                <div style={s.row}><span style={{ color: t.muted, flexShrink: 0 }}>Statut</span><span style={{ color: t.text }}>{profil.statut_etudiant || '-'}</span></div>
                <div style={s.row}><span style={{ color: t.muted, flexShrink: 0 }}>Annee concours</span><span style={{ color: t.text }}>{profil.annee_concours || '-'}</span></div>
                <div style={s.row}>
                  <span style={{ color: t.muted, flexShrink: 0 }}>Dominante Centrale</span>
                  <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: 'rgba(167,139,250,0.12)', color: t.purple }}>{profil.dominante_centrale || '-'}</span>
                </div>
                <div style={s.row}>
                  <span style={{ color: t.muted, flexShrink: 0 }}>Ecoles cibles</span>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {profil.ecoles_cibles?.length > 0 ? profil.ecoles_cibles.map(e => (
                      <span key={e} style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', background: 'rgba(96,165,250,0.12)', color: t.blue }}>{e}</span>
                    )) : <span style={{ color: t.muted }}>-</span>}
                  </div>
                </div>
                <div style={{ ...s.row, borderBottom: 'none' }}>
                  <span style={{ color: t.muted, flexShrink: 0 }}>Ecoles GEI</span>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {profil.ecoles_gei?.length > 0 ? profil.ecoles_gei.map(e => (
                      <span key={e} style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', background: 'rgba(251,191,36,0.12)', color: t.amber }}>{e}</span>
                    )) : <span style={{ color: t.muted }}>-</span>}
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
              {abonnement && (
                <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: STATUT[abonnement.statut]?.bg, color: STATUT[abonnement.statut]?.color }}>
                  {STATUT[abonnement.statut]?.label}
                </span>
              )}
            </div>
            <div style={s.cardBody}>
              {!abonnement ? (
                <form onSubmit={createAbonnement}>
                  <div style={{ color: t.muted, fontSize: '12px', marginBottom: '16px' }}>Aucun abonnement.</div>
                  <label style={{ ...s.label, marginTop: 0 }}>Pack</label>
                  <select style={{ ...s.input, cursor: 'pointer' }} value={aboForm.pack_nom}
                    onChange={e => {
                      const pack = packs.find(p => p.nom === e.target.value)
                      setAboForm({ ...aboForm, pack_nom: e.target.value, montant: pack ? pack.prix : aboForm.montant })
                    }} required>
                    <option value="">Choisir un pack</option>
                    {packs.map(p => <option key={p.id} value={p.nom}>{p.nom} - {p.prix}EUR</option>)}
                  </select>
                  <label style={s.label}>Montant total (EUR)</label>
                  <input style={s.input} type="number" value={aboForm.montant} onChange={e => setAboForm({ ...aboForm, montant: e.target.value })} required placeholder="Rempli automatiquement" />
                  <label style={s.label}>Date debut</label>
                  <input style={s.input} type="date" value={aboForm.date_debut} onChange={e => setAboForm({ ...aboForm, date_debut: e.target.value })} required />
                  <label style={s.label}>Date fin</label>
                  <input style={s.input} type="date" value={aboForm.date_fin} onChange={e => setAboForm({ ...aboForm, date_fin: e.target.value })} required />
                  <button type="submit" style={{ ...s.btn, ...s.btnPrimary, marginTop: '16px', width: '100%' }} disabled={saving}>
                    {saving ? 'Creation...' : "Creer l'abonnement"}
                  </button>
                </form>
              ) : (
                <>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: t.purple, marginBottom: '16px' }}>{abonnement.pack_nom}</div>
                  <div style={s.row}><span style={{ color: t.muted }}>Montant total</span><span style={{ fontFamily: 'monospace' }}>{abonnement.montant}EUR</span></div>
                  <div style={s.row}><span style={{ color: t.muted }}>Verse</span><span style={{ fontFamily: 'monospace', color: t.teal }}>{totalVerse.toFixed(2)}EUR</span></div>
                  <div style={{ ...s.row, borderBottom: 'none' }}>
                    <span style={{ color: t.muted }}>Reste</span>
                    <span style={{ fontFamily: 'monospace', color: resteAPayer > 0 ? t.amber : t.teal }}>
                      {resteAPayer > 0 ? resteAPayer.toFixed(2) + 'EUR' : 'Solde'}
                    </span>
                  </div>
                  <div style={{ marginTop: '14px', padding: '10px 12px', background: t.surface2, borderRadius: '8px' }}>
                    <div style={{ fontSize: '10px', color: t.muted, marginBottom: '4px' }}>Reference virement</div>
                    <div style={{ fontFamily: 'monospace', color: t.purple, fontSize: '14px' }}>{abonnement.reference_virement}</div>
                  </div>
                  <button onClick={() => setShowChangePack(true)} style={{ ...s.btn, ...s.btnGhost, marginTop: '12px', width: '100%', fontSize: '12px' }}>
                    Changer de pack
                  </button>
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
                  <button type="submit" style={{ ...s.btn, ...s.btnTeal, marginTop: '16px', width: '100%' }} disabled={saving}>
                    {saving ? 'Enregistrement...' : 'Confirmer le virement'}
                  </button>
                  <div style={{ fontSize: '11px', color: t.muted, marginTop: '8px', textAlign: 'center' }}>
                    Si le total atteint {abonnement.montant}EUR, l'acces sera active automatiquement.
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {abonnement && (
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Historique des paiements</span>
              <span style={{ fontSize: '11px', color: t.muted }}>{paiements.length} virement{paiements.length > 1 ? 's' : ''}</span>
            </div>
            {paiements.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: t.muted, fontSize: '13px' }}>Aucun paiement enregistre.</div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>{['Date', 'Montant', 'Valide par'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {paiements.map(p => (
                    <tr key={p.id}>
                      <td style={s.td}>{new Date(p.date_virement).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                      <td style={{ ...s.td, color: t.teal, fontFamily: 'monospace', fontWeight: '600' }}>+{p.montant}EUR</td>
                      <td style={s.td}>Admin</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modale confirmation suppression */}
      {showDeleteConfirm && (
        <div style={s.modal} onClick={() => setShowDeleteConfirm(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: t.coral, fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Supprimer cet eleve ?</h2>
            <p style={{ fontSize: '13px', color: t.muted, marginBottom: '8px', lineHeight: 1.6 }}>
              Tu es sur le point de supprimer <strong style={{ color: t.text }}>{selectedEleve?.full_name}</strong>.
            </p>
            <p style={{ fontSize: '13px', color: t.muted, marginBottom: '24px', lineHeight: 1.6 }}>
              Cette action supprimera son compte, ses resultats, son abonnement et toutes ses donnees. Elle est irreversible.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ ...s.btn, ...s.btnGhost, flex: 1 }}>Annuler</button>
              <button onClick={deleteEleve} disabled={deleting} style={{ ...s.btn, background: t.coral, color: '#fff', border: 'none', flex: 1, cursor: deleting ? 'not-allowed' : 'pointer' }}>
                {deleting ? 'Suppression...' : 'Confirmer la suppression'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale changement de pack */}
      {showChangePack && (
        <div style={s.modal} onClick={() => setShowChangePack(false)}>
          <div style={{ background: t.surface, border: '1px solid ' + t.border2, borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: t.text, fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>Changer de pack</h2>
            <p style={{ fontSize: '13px', color: t.muted, marginBottom: '6px', lineHeight: 1.6 }}>
              Pack actuel : <strong style={{ color: t.text }}>{abonnement?.pack_nom}</strong> ({abonnement?.montant}EUR)
            </p>
            <p style={{ fontSize: '13px', color: t.muted, marginBottom: '20px', lineHeight: 1.6 }}>
              Deja verse : <strong style={{ color: t.teal }}>{totalVerse.toFixed(2)}EUR</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {packs.map(pack => {
                const nouveauReste = parseFloat(pack.prix) - totalVerse
                return (
                  <div key={pack.id} onClick={() => changerPack(pack)}
                    style={{ background: t.surface2, border: '1px solid ' + t.border, borderRadius: '10px', padding: '16px', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = t.purple}
                    onMouseLeave={e => e.currentTarget.style.borderColor = t.border}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: t.text }}>{pack.nom}</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: t.purple }}>{pack.prix}EUR</div>
                    </div>
                    <div style={{ fontSize: '12px', color: nouveauReste > 0 ? t.amber : t.teal }}>
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
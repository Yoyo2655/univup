'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function ElevesPage() {
  const [eleves, setEleves] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedEleve, setSelectedEleve] = useState(null)
  const [abonnement, setAbonnement] = useState(null)
  const [paiements, setPaiements] = useState([])
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [aboForm, setAboForm] = useState({ pack_nom: '', montant: '', date_debut: '', date_fin: '' })
  const [paiForm, setPaiForm] = useState({ montant: '', date_virement: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [view, setView] = useState('list') // list | detail

  useEffect(() => { fetchEleves() }, [])

  async function fetchEleves() {
    const { data } = await supabase
      .from('users')
      .select(`*, abonnements(pack_nom, statut, date_fin, montant)`)
      .eq('role', 'eleve')
      .order('created_at', { ascending: false })
    setEleves(data || [])
    setLoading(false)
  }

  async function openEleve(eleve) {
    setSelectedEleve(eleve)
    setView('detail')

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
  }

  async function createEleve(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role: 'eleve' })
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setSaving(false); return }
    setForm({ full_name: '', email: '', password: '' })
    setShowForm(false)
    fetchEleves()
    setSaving(false)
  }

  async function toggleAccess(id, current) {
    await supabase.from('users').update({ is_active: !current }).eq('id', id)
    fetchEleves()
    if (selectedEleve?.id === id) setSelectedEleve({ ...selectedEleve, is_active: !current })
  }

  async function createAbonnement(e) {
    e.preventDefault()
    setSaving(true)
    const ref = `UNIVUP-${selectedEleve.full_name.split(' ')[0].toUpperCase()}-${new Date().getFullYear()}`
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

    // Recalcule si soldé
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
    actif: { label: 'Actif', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
    en_attente: { label: 'En attente', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
    expire: { label: 'Expiré', color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  }

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
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', fontSize: '10px', fontWeight: '500', color: '#6e6c66', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
    td: { padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', color: '#9e9c96' },
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
    modalBox: { background: '#18181c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px' },
    label: { display: 'block', fontSize: '12px', color: '#9e9c96', marginBottom: '6px', marginTop: '14px' },
    input: { width: '100%', padding: '9px 12px', background: '#1e1e24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e8e6e0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' },
  }

  // ═══ VUE LISTE ═══
  if (view === 'list') return (
    <div style={{ color: '#e8e6e0' }}>
      <div style={s.topbar}>
        <h1 style={s.title}>Élèves & abonnements</h1>
        <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowForm(true)}>+ Créer un élève</button>
      </div>
      <div style={s.content}>
        <div style={s.card}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6e6c66' }}>Chargement…</div>
          ) : eleves.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6e6c66' }}>Aucun élève — crée le premier compte.</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Nom</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Pack</th>
                  <th style={s.th}>Accès</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {eleves.map(eleve => (
                  <tr key={eleve.id} style={{ cursor: 'pointer' }} onClick={() => openEleve(eleve)}>
                    <td style={{ ...s.td, color: '#e8e6e0', fontWeight: '500' }}>{eleve.full_name}</td>
                    <td style={s.td}>{eleve.email}</td>
                    <td style={s.td}>{eleve.abonnements?.[0]?.pack_nom || <span style={{ color: '#6e6c66' }}>—</span>}</td>
                    <td style={s.td}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
                        background: eleve.is_active ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.1)',
                        color: eleve.is_active ? '#34d399' : '#f87171'
                      }}>
                        {eleve.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td style={s.td} onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleAccess(eleve.id, eleve.is_active)}
                        style={{ ...s.btn, ...s.btnGhost, padding: '4px 10px', fontSize: '11px' }}>
                        {eleve.is_active ? 'Désactiver' : 'Activer'}
                      </button>
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
            <h2 style={{ color: '#e8e6e0', fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Créer un élève</h2>
            <form onSubmit={createEleve}>
              <label style={s.label}>Nom complet</label>
              <input style={s.input} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required placeholder="Prénom Nom" />
              <label style={s.label}>Email</label>
              <input style={s.input} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="eleve@email.com" />
              <label style={s.label}>Mot de passe provisoire</label>
              <input style={s.input} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} placeholder="Min. 6 caractères" />
              {error && <div style={{ color: '#f87171', fontSize: '12px', margin: '12px 0' }}>{error}</div>}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" style={{ ...s.btn, ...s.btnGhost }} onClick={() => setShowForm(false)}>Annuler</button>
                <button type="submit" style={{ ...s.btn, ...s.btnPrimary }} disabled={saving}>{saving ? 'Création…' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )

  // ═══ VUE DETAIL ÉLÈVE ═══
  return (
    <div style={{ color: '#e8e6e0' }}>
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => { setView('list'); setSelectedEleve(null) }}
            style={{ ...s.btn, ...s.btnGhost, padding: '6px 10px' }}>← Retour</button>
          <div>
            <h1 style={s.title}>{selectedEleve?.full_name}</h1>
            <div style={{ fontSize: '12px', color: '#6e6c66', marginTop: '2px' }}>{selectedEleve?.email}</div>
          </div>
        </div>
        <button onClick={() => toggleAccess(selectedEleve.id, selectedEleve.is_active)}
          style={{ ...s.btn, ...(selectedEleve?.is_active ? s.btnGhost : s.btnTeal) }}>
          {selectedEleve?.is_active ? 'Désactiver l\'accès' : 'Activer l\'accès'}
        </button>
      </div>

      <div style={s.content}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

          {/* Abonnement */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Abonnement</span>
              {abonnement && (
                <span style={{
                  padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
                  background: STATUT[abonnement.statut]?.bg, color: STATUT[abonnement.statut]?.color
                }}>
                  {STATUT[abonnement.statut]?.label}
                </span>
              )}
            </div>
            <div style={s.cardBody}>
              {!abonnement ? (
                <form onSubmit={createAbonnement}>
                  <div style={{ color: '#6e6c66', fontSize: '12px', marginBottom: '16px' }}>Aucun abonnement — crées-en un.</div>
                  <label style={{ ...s.label, marginTop: 0 }}>Nom du pack</label>
                  <input style={s.input} value={aboForm.pack_nom} onChange={e => setAboForm({ ...aboForm, pack_nom: e.target.value })} required placeholder="Ex: Pack Complet Centrale" />
                  <label style={s.label}>Montant total (€)</label>
                  <input style={s.input} type="number" value={aboForm.montant} onChange={e => setAboForm({ ...aboForm, montant: e.target.value })} required placeholder="1200" />
                  <label style={s.label}>Date début</label>
                  <input style={s.input} type="date" value={aboForm.date_debut} onChange={e => setAboForm({ ...aboForm, date_debut: e.target.value })} required />
                  <label style={s.label}>Date fin</label>
                  <input style={s.input} type="date" value={aboForm.date_fin} onChange={e => setAboForm({ ...aboForm, date_fin: e.target.value })} required />
                  <button type="submit" style={{ ...s.btn, ...s.btnPrimary, marginTop: '16px', width: '100%' }} disabled={saving}>
                    {saving ? 'Création…' : 'Créer l\'abonnement'}
                  </button>
                </form>
              ) : (
                <>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#a78bfa', marginBottom: '16px' }}>{abonnement.pack_nom}</div>
                  <div style={s.row}><span style={{ color: '#6e6c66' }}>Montant total</span><span style={{ fontFamily: 'monospace' }}>{abonnement.montant}€</span></div>
                  <div style={s.row}><span style={{ color: '#6e6c66' }}>Versé</span><span style={{ fontFamily: 'monospace', color: '#34d399' }}>{totalVerse.toFixed(2)}€</span></div>
                  <div style={{ ...s.row, borderBottom: 'none' }}>
                    <span style={{ color: '#6e6c66' }}>Reste</span>
                    <span style={{ fontFamily: 'monospace', color: resteAPayer > 0 ? '#fbbf24' : '#34d399' }}>
                      {resteAPayer > 0 ? `${resteAPayer.toFixed(2)}€` : '✓ Soldé'}
                    </span>
                  </div>
                  <div style={{ marginTop: '14px', padding: '10px 12px', background: '#1e1e24', borderRadius: '8px' }}>
                    <div style={{ fontSize: '10px', color: '#6e6c66', marginBottom: '4px' }}>Référence virement</div>
                    <div style={{ fontFamily: 'monospace', color: '#a78bfa', fontSize: '14px' }}>{abonnement.reference_virement}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Enregistrer virement */}
          {abonnement && resteAPayer > 0 && (
            <div style={s.card}>
              <div style={s.cardHeader}><span style={s.cardTitle}>Enregistrer un virement reçu</span></div>
              <div style={s.cardBody}>
                <form onSubmit={addPaiement}>
                  <label style={{ ...s.label, marginTop: 0 }}>Montant reçu (€)</label>
                  <input style={s.input} type="number" step="0.01" value={paiForm.montant} onChange={e => setPaiForm({ ...paiForm, montant: e.target.value })} required placeholder={`Max: ${resteAPayer.toFixed(2)}€`} />
                  <label style={s.label}>Date du virement</label>
                  <input style={s.input} type="date" value={paiForm.date_virement} onChange={e => setPaiForm({ ...paiForm, date_virement: e.target.value })} required />
                  <button type="submit" style={{ ...s.btn, ...s.btnTeal, marginTop: '16px', width: '100%' }} disabled={saving}>
                    {saving ? 'Enregistrement…' : 'Confirmer le virement'}
                  </button>
                  <div style={{ fontSize: '11px', color: '#6e6c66', marginTop: '8px', textAlign: 'center' }}>
                    Si le total atteint {abonnement.montant}€, l'accès sera activé automatiquement.
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Historique paiements */}
        {abonnement && (
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Historique des paiements</span>
              <span style={{ fontSize: '11px', color: '#6e6c66' }}>{paiements.length} virement{paiements.length > 1 ? 's' : ''}</span>
            </div>
            {paiements.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#6e6c66', fontSize: '13px' }}>Aucun paiement enregistré.</div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Date', 'Montant', 'Validé par'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paiements.map(p => (
                    <tr key={p.id}>
                      <td style={s.td}>{new Date(p.date_virement).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                      <td style={{ ...s.td, color: '#34d399', fontFamily: 'monospace', fontWeight: '600' }}>+{p.montant}€</td>
                      <td style={s.td}>Admin</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
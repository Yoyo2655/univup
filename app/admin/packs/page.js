'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { t } from '../../../lib/theme'

export default function PacksPage() {
  const [packs, setPacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editPack, setEditPack] = useState(null)
  const [form, setForm] = useState({ nom: '', description: '', prix: '', duree_mois: '12', actif: true, ordre: '0' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchPacks() }, [])

  async function fetchPacks() {
    const { data } = await supabase.from('packs').select('*').order('ordre').order('created_at')
    setPacks(data || [])
    setLoading(false)
  }

  function openForm(pack = null) {
    if (pack) {
      setEditPack(pack)
      setForm({ nom: pack.nom, description: pack.description || '', prix: pack.prix, duree_mois: pack.duree_mois, actif: pack.actif, ordre: pack.ordre })
    } else {
      setEditPack(null)
      setForm({ nom: '', description: '', prix: '', duree_mois: '12', actif: true, ordre: '0' })
    }
    setShowForm(true)
  }

  async function savePack(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      nom: form.nom,
      description: form.description,
      prix: parseFloat(form.prix),
      duree_mois: parseInt(form.duree_mois),
      actif: form.actif,
      ordre: parseInt(form.ordre)
    }
    if (editPack) {
      await supabase.from('packs').update(payload).eq('id', editPack.id)
    } else {
      await supabase.from('packs').insert(payload)
    }
    setShowForm(false)
    setEditPack(null)
    fetchPacks()
    setSaving(false)
  }

  async function toggleActif(pack) {
    await supabase.from('packs').update({ actif: !pack.actif }).eq('id', pack.id)
    fetchPacks()
  }

  async function deletePack(id) {
    if (!confirm('Supprimer ce pack ?')) return
    await supabase.from('packs').delete().eq('id', id)
    fetchPacks()
  }

  const s = {
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid ' + t.border },
    title: { fontSize: '18px', fontWeight: '600', color: t.text },
    btn: { padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    btnPrimary: { background: t.purple, color: '#1a1228' },
    btnGhost: { background: 'rgba(255,255,255,0.06)', color: t.muted2, border: '1px solid ' + t.border },
    btnCoral: { background: 'rgba(248,113,113,0.1)', color: t.coral, border: '1px solid rgba(248,113,113,0.2)' },
    content: { padding: '24px 28px' },
    card: { background: t.surface, border: '1px solid ' + t.border, borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' },
    cardBody: { padding: '20px' },
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
    modalBox: { background: t.surface, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px' },
    label: { display: 'block', fontSize: '12px', color: t.muted2, marginBottom: '6px', marginTop: '14px' },
    input: { width: '100%', padding: '9px 12px', background: t.surface2, border: '1px solid ' + t.border2, borderRadius: '8px', color: t.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '9px 12px', background: t.surface2, border: '1px solid ' + t.border2, borderRadius: '8px', color: t.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: '80px', fontFamily: 'system-ui' },
  }

  return (
    <div style={{ color: t.text }}>
      <div style={s.topbar}>
        <h1 style={s.title}>Gestion des packs</h1>
        <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => openForm()}>+ Créer un pack</button>
      </div>

      <div style={s.content}>
        {loading ? (
          <div style={{ color: t.muted, textAlign: 'center', padding: '40px' }}>Chargement…</div>
        ) : packs.length === 0 ? (
          <div style={{ color: t.muted, textAlign: 'center', padding: '40px' }}>
            Aucun pack — crée le premier.
          </div>
        ) : (
          packs.map(pack => (
            <div key={pack.id} style={s.card}>
              <div style={s.cardBody}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: t.text }}>{pack.nom}</span>
                      <span style={{
                        padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '500',
                        background: pack.actif ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.06)',
                        color: pack.actif ? t.teal : t.muted
                      }}>
                        {pack.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    {pack.description && (
                      <div style={{ fontSize: '13px', color: t.muted2, marginBottom: '10px', lineHeight: 1.5 }}>{pack.description}</div>
                    )}
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                      <span style={{ color: t.purple, fontWeight: '600', fontFamily: 'monospace', fontSize: '16px' }}>{pack.prix}€</span>
                      <span style={{ color: t.muted }}>{pack.duree_mois} mois</span>
                      <span style={{ color: t.muted }}>Ordre : {pack.ordre}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => openForm(pack)} style={{ ...s.btn, ...s.btnGhost, padding: '6px 12px', fontSize: '12px' }}>
                      Modifier
                    </button>
                    <button onClick={() => toggleActif(pack)} style={{ ...s.btn, ...s.btnGhost, padding: '6px 12px', fontSize: '12px' }}>
                      {pack.actif ? 'Désactiver' : 'Activer'}
                    </button>
                    <button onClick={() => deletePack(pack.id)} style={{ ...s.btn, ...s.btnCoral, padding: '6px 12px', fontSize: '12px' }}>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div style={s.modal} onClick={() => setShowForm(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: t.text, fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
              {editPack ? 'Modifier le pack' : 'Créer un pack'}
            </h2>
            <form onSubmit={savePack}>
              <label style={{ ...s.label, marginTop: '10px' }}>Nom du pack</label>
              <input style={s.input} value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required placeholder="Ex: Pack Centrale Maths" />

              <label style={s.label}>Description</label>
              <textarea style={s.textarea} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ce que le pack inclut…" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={s.label}>Prix (€)</label>
                  <input style={s.input} type="number" step="0.01" value={form.prix} onChange={e => setForm({ ...form, prix: e.target.value })} required placeholder="1200" />
                </div>
                <div>
                  <label style={s.label}>Durée (mois)</label>
                  <input style={s.input} type="number" value={form.duree_mois} onChange={e => setForm({ ...form, duree_mois: e.target.value })} required placeholder="12" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={s.label}>Ordre d'affichage</label>
                  <input style={s.input} type="number" value={form.ordre} onChange={e => setForm({ ...form, ordre: e.target.value })} placeholder="0" />
                </div>
                <div>
                  <label style={s.label}>Statut</label>
                  <select style={{ ...s.input, cursor: 'pointer' }} value={form.actif ? 'actif' : 'inactif'} onChange={e => setForm({ ...form, actif: e.target.value === 'actif' })}>
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" style={{ ...s.btn, ...s.btnGhost }} onClick={() => setShowForm(false)}>Annuler</button>
                <button type="submit" style={{ ...s.btn, ...s.btnPrimary }} disabled={saving}>
                  {saving ? 'Sauvegarde…' : editPack ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
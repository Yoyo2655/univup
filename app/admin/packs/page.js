'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useTheme, getTheme } from '../../context/ThemeContext'

export default function PacksPage() {
  const { theme, isDark } = useTheme()
  const c = getTheme(theme)

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
    const payload = { nom: form.nom, description: form.description, prix: parseFloat(form.prix), duree_mois: parseInt(form.duree_mois), actif: form.actif, ordre: parseInt(form.ordre) }
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
    btn: { padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    btnPrimary: { background: c.purple, color: isDark ? '#1a1228' : '#ffffff' },
    btnGhost: { background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: c.muted2, border: '1px solid ' + c.border },
    btnCoral: { background: isDark ? 'rgba(248,113,113,0.1)' : 'rgba(220,38,38,0.06)', color: c.coral, border: '1px solid ' + (isDark ? 'rgba(248,113,113,0.2)' : 'rgba(220,38,38,0.15)') },
    card: { background: c.surface, border: '1px solid ' + c.border, borderRadius: '12px', overflow: 'hidden', marginBottom: '12px', boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)' },
    modal: { position: 'fixed', inset: 0, background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
    label: { display: 'block', fontSize: '12px', color: c.muted2, marginBottom: '6px', marginTop: '14px' },
    input: { width: '100%', padding: '9px 12px', background: c.surface2, border: '1px solid ' + c.border2, borderRadius: '8px', color: c.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '9px 12px', background: c.surface2, border: '1px solid ' + c.border2, borderRadius: '8px', color: c.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: '80px', fontFamily: 'system-ui' },
  }

  return (
    <div style={{ color: c.text, background: c.bg, minHeight: '100vh', fontFamily: "'DM Sans', system-ui", transition: 'background 0.2s' }}>

      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid ' + c.border, background: c.surface, transition: 'background 0.2s' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: c.text, letterSpacing: '-0.3px', margin: 0 }}>Gestion des packs</h1>
        <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => openForm()}>+ Creer un pack</button>
      </div>

      <div style={{ padding: '28px 32px' }}>
        {loading ? (
          <div style={{ color: c.muted, textAlign: 'center', padding: '40px' }}>Chargement...</div>
        ) : packs.length === 0 ? (
          <div style={{ color: c.muted, textAlign: 'center', padding: '40px' }}>Aucun pack — cree le premier.</div>
        ) : (
          packs.map(pack => (
            <div key={pack.id} style={s.card}>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: c.text }}>{pack.nom}</span>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '500', background: pack.actif ? (isDark ? 'rgba(52,211,153,0.12)' : 'rgba(5,150,105,0.08)') : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'), color: pack.actif ? c.teal : c.muted }}>
                        {pack.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    {pack.description && (
                      <div style={{ fontSize: '13px', color: c.muted2, marginBottom: '10px', lineHeight: 1.5 }}>{pack.description}</div>
                    )}
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', alignItems: 'center' }}>
                      <span style={{ color: c.purple, fontWeight: '700', fontFamily: 'monospace', fontSize: '16px' }}>{pack.prix}EUR</span>
                      <span style={{ color: c.muted }}>{pack.duree_mois} mois</span>
                      <span style={{ color: c.muted }}>Ordre : {pack.ordre}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => openForm(pack)} style={{ ...s.btn, ...s.btnGhost, padding: '6px 12px', fontSize: '12px' }}>Modifier</button>
                    <button onClick={() => toggleActif(pack)} style={{ ...s.btn, ...s.btnGhost, padding: '6px 12px', fontSize: '12px' }}>{pack.actif ? 'Desactiver' : 'Activer'}</button>
                    <button onClick={() => deletePack(pack.id)} style={{ ...s.btn, ...s.btnCoral, padding: '6px 12px', fontSize: '12px' }}>Supprimer</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div style={s.modal} onClick={() => setShowForm(false)}>
          <div style={{ background: c.surface, border: '1px solid ' + c.border, borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: c.text, fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
              {editPack ? 'Modifier le pack' : 'Creer un pack'}
            </h2>
            <form onSubmit={savePack}>
              <label style={{ ...s.label, marginTop: '10px' }}>Nom du pack</label>
              <input style={s.input} value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required placeholder="Ex: Pack Centrale Maths" />
              <label style={s.label}>Description</label>
              <textarea style={s.textarea} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ce que le pack inclut..." />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={s.label}>Prix (EUR)</label>
                  <input style={s.input} type="number" step="0.01" value={form.prix} onChange={e => setForm({ ...form, prix: e.target.value })} required placeholder="1200" />
                </div>
                <div>
                  <label style={s.label}>Duree (mois)</label>
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
                <button type="submit" style={{ ...s.btn, ...s.btnPrimary }} disabled={saving}>{saving ? 'Sauvegarde...' : editPack ? 'Modifier' : 'Creer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
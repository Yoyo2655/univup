'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useTheme, getTheme } from '../../context/ThemeContext'

export default function AbonnementPage() {
  const { theme, isDark } = useTheme()
  const c = getTheme(theme)

  const [abonnement, setAbonnement] = useState(null)
  const [paiements, setPaiements] = useState([])
  const [packsDisponibles, setPacksDisponibles] = useState([])
  const [packSelectionne, setPackSelectionne] = useState(null)
  const [showChangePack, setShowChangePack] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAbonnement() }, [])

  async function fetchAbonnement() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: aboData } = await supabase.from('abonnements').select('*').eq('eleve_id', user.id).order('created_at', { ascending: false }).limit(1).single()
    if (aboData) {
      setAbonnement(aboData)
      const { data: paiData } = await supabase.from('paiements_eleves').select('*').eq('abonnement_id', aboData.id).order('date_virement', { ascending: false })
      setPaiements(paiData || [])
    }
    const { data: packsData } = await supabase.from('packs').select('*').eq('actif', true).order('ordre')
    setPacksDisponibles(packsData || [])
    setLoading(false)
  }

  async function demanderChangementPack(pack) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('messages').insert({ user_id: user.id, contenu: 'Je souhaite changer mon abonnement actuel (' + abonnement.pack_nom + ') pour le pack : ' + pack.nom + ' (' + pack.prix + 'EUR / ' + pack.duree_mois + ' mois). Merci de traiter ma demande.' })
    setShowChangePack(false)
    alert('Ta demande a ete envoyee dans le chat. UnivUp va la traiter rapidement.')
  }

  const totalVerse = paiements.reduce((sum, p) => sum + parseFloat(p.montant), 0)
  const resteAPayer = abonnement ? parseFloat(abonnement.montant) - totalVerse : 0

  const STATUT = {
    actif: { label: 'Actif', color: c.teal, bg: isDark ? 'rgba(52,211,153,0.12)' : 'rgba(5,150,105,0.08)' },
    en_attente: { label: 'En attente', color: c.amber, bg: isDark ? 'rgba(251,191,36,0.1)' : 'rgba(217,119,6,0.08)' },
    expire: { label: 'Expire', color: c.coral, bg: isDark ? 'rgba(248,113,113,0.1)' : 'rgba(220,38,38,0.08)' },
  }

  const s = {
    card: { background: c.surface, border: '1px solid ' + c.border, borderRadius: '12px', overflow: 'hidden', boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)' },
    cardBody: { padding: '20px' },
    cardHeader: { padding: '14px 20px', borderBottom: '1px solid ' + c.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    cardTitle: { fontSize: '13px', fontWeight: '600', color: c.text },
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid ' + c.border, fontSize: '13px' },
    modal: { position: 'fixed', inset: 0, background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
    th: { textAlign: 'left', fontSize: '10px', fontWeight: '500', color: c.muted, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 20px', borderBottom: '1px solid ' + c.border },
    td: { padding: '12px 20px', fontSize: '13px', color: c.muted2, borderBottom: '1px solid ' + c.border },
  }

  if (loading) return <div style={{ padding: '40px', color: c.muted, textAlign: 'center', background: c.bg, minHeight: '100vh' }}>Chargement...</div>

  if (!abonnement) return (
    <div style={{ color: c.text, background: c.bg, minHeight: '100vh', fontFamily: "'DM Sans', system-ui", transition: 'background 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid ' + c.border, background: c.surface }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: c.text, letterSpacing: '-0.3px', margin: 0 }}>Mon abonnement</h1>
      </div>
      <div style={{ padding: '28px 32px' }}>
        <div style={{ fontSize: '14px', color: c.muted, marginBottom: '24px' }}>Choisis un pack ci-dessous pour voir les informations de paiement.</div>
        {packsDisponibles.length === 0 ? (
          <div style={{ color: c.muted, textAlign: 'center', padding: '40px' }}>Aucun pack disponible — contacte UnivUp.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {packsDisponibles.map(pack => (
              <div key={pack.id} onClick={() => setPackSelectionne(pack)} style={{ ...s.card, padding: '24px', cursor: 'pointer', borderTop: isDark ? 'none' : '3px solid ' + c.purple, transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = c.purple}
                onMouseLeave={e => { if (!isDark) e.currentTarget.style.borderColor = c.purple; else e.currentTarget.style.borderColor = c.border }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: c.text, marginBottom: '8px' }}>{pack.nom}</div>
                {pack.description && <div style={{ fontSize: '13px', color: c.muted2, marginBottom: '16px', lineHeight: 1.6 }}>{pack.description}</div>}
                <div style={{ fontSize: '28px', fontWeight: '700', color: c.purple, marginBottom: '4px' }}>{pack.prix}EUR</div>
                <div style={{ fontSize: '12px', color: c.muted, marginBottom: '16px' }}>pour {pack.duree_mois} mois</div>
                <div style={{ fontSize: '12px', color: c.purple, fontWeight: '500' }}>Voir les informations de paiement →</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {packSelectionne && (
        <div style={s.modal} onClick={() => setPackSelectionne(null)}>
          <div style={{ background: c.surface, border: '1px solid ' + c.border, borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: c.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Pack selectionne</div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: c.text }}>{packSelectionne.nom}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: c.purple, marginTop: '4px' }}>{packSelectionne.prix}EUR</div>
            </div>
            <div style={{ fontSize: '13px', color: c.muted, marginBottom: '20px', lineHeight: 1.6 }}>Pour souscrire, effectue un virement bancaire avec les informations ci-dessous et contacte UnivUp pour confirmer.</div>
            {[
              { label: 'Beneficiaire', value: 'YONI MILO ATTAL', mono: false },
              { label: 'IBAN', value: 'FR76 2823 3000 0191 3356 4211 372', mono: true },
              { label: 'BIC', value: 'REVOFRP2', mono: true },
              { label: 'Banque', value: 'Revolut France', mono: false },
              { label: 'Montant', value: packSelectionne.prix + 'EUR', mono: true },
              { label: 'Motif', value: 'UnivUp - ' + packSelectionne.nom, mono: false },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid ' + c.border, fontSize: '13px', gap: '16px' }}>
                <span style={{ color: c.muted, flexShrink: 0 }}>{item.label}</span>
                <span style={{ color: c.text, fontWeight: '500', fontFamily: item.mono ? 'monospace' : 'inherit', textAlign: 'right' }}>{item.value}</span>
              </div>
            ))}
            <div style={{ marginTop: '20px', padding: '12px 14px', background: isDark ? 'rgba(167,139,250,0.08)' : 'rgba(124,58,237,0.06)', border: '1px solid ' + (isDark ? 'rgba(167,139,250,0.2)' : 'rgba(124,58,237,0.15)'), borderRadius: '8px', fontSize: '12px', color: c.purple, lineHeight: 1.6 }}>
              Apres ton virement, contacte UnivUp via le chat pour confirmer et activer ton acces.
            </div>
            <button onClick={() => setPackSelectionne(null)} style={{ width: '100%', marginTop: '16px', padding: '10px', background: 'none', border: '1px solid ' + c.border, borderRadius: '8px', color: c.muted2, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ color: c.text, background: c.bg, minHeight: '100vh', fontFamily: "'DM Sans', system-ui", transition: 'background 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid ' + c.border, background: c.surface, transition: 'background 0.2s' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: c.text, letterSpacing: '-0.3px', margin: 0 }}>Mon abonnement</h1>
        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: STATUT[abonnement.statut]?.bg, color: STATUT[abonnement.statut]?.color }}>
          {STATUT[abonnement.statut]?.label}
        </span>
      </div>

      <div style={{ padding: '28px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div style={s.card}>
            <div style={s.cardHeader}><span style={s.cardTitle}>Mon pack</span></div>
            <div style={s.cardBody}>
              <div style={{ fontSize: '22px', fontWeight: '600', color: c.purple, marginBottom: '4px' }}>{abonnement.pack_nom}</div>
              <div style={{ fontSize: '12px', color: c.muted, marginBottom: '20px' }}>
                {abonnement.date_debut && abonnement.date_fin && <>Du {new Date(abonnement.date_debut).toLocaleDateString('fr-FR')} au {new Date(abonnement.date_fin).toLocaleDateString('fr-FR')}</>}
              </div>
              <div style={s.row}><span style={{ color: c.muted }}>Montant total</span><span style={{ color: c.text, fontWeight: '500', fontFamily: 'monospace' }}>{abonnement.montant}EUR</span></div>
              <div style={s.row}><span style={{ color: c.muted }}>Deja verse</span><span style={{ color: c.teal, fontWeight: '500', fontFamily: 'monospace' }}>{totalVerse.toFixed(2)}EUR</span></div>
              <div style={{ ...s.row, borderBottom: 'none' }}>
                <span style={{ color: c.muted }}>Reste a payer</span>
                <span style={{ color: resteAPayer > 0 ? c.amber : c.teal, fontWeight: '500', fontFamily: 'monospace' }}>{resteAPayer > 0 ? resteAPayer.toFixed(2) + 'EUR' : 'Solde'}</span>
              </div>
              <button onClick={() => setShowChangePack(true)} style={{ width: '100%', marginTop: '16px', padding: '8px', background: 'none', border: '1px solid ' + c.border, borderRadius: '8px', color: c.muted2, cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>
                Changer de pack →
              </button>
            </div>
          </div>

          <div style={s.card}>
            <div style={s.cardHeader}><span style={s.cardTitle}>Informations de virement</span></div>
            <div style={s.cardBody}>
              <div style={{ fontSize: '12px', color: c.muted, marginBottom: '16px', lineHeight: 1.6 }}>
                Pour effectuer ton paiement, realise un virement avec les informations ci-dessous. Indique bien ta <strong style={{ color: c.text }}>reference unique</strong> dans le motif.
              </div>
              {[
                { label: 'Beneficiaire', value: 'YONI MILO ATTAL', mono: false },
                { label: 'IBAN', value: 'FR76 2823 3000 0191 3356 4211 372', mono: true },
                { label: 'BIC', value: 'REVOFRP2', mono: true },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid ' + c.border, fontSize: '12px' }}>
                  <span style={{ color: c.muted }}>{item.label}</span>
                  <span style={{ color: c.text, fontWeight: '500', fontFamily: item.mono ? 'monospace' : 'inherit' }}>{item.value}</span>
                </div>
              ))}
              <div style={{ background: c.surface2, border: '1px solid ' + c.border, borderRadius: '8px', padding: '14px 16px', marginTop: '16px' }}>
                <div style={{ fontSize: '10px', color: c.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Reference a indiquer</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: c.purple, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{abonnement.reference_virement || '-'}</div>
              </div>
              <div style={{ fontSize: '11px', color: c.muted, marginTop: '12px' }}>Une fois le virement recu, ton acces sera active sous 24h.</div>
            </div>
          </div>
        </div>

        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>Historique des paiements</span>
            <span style={{ fontSize: '11px', color: c.muted }}>{paiements.length} virement{paiements.length > 1 ? 's' : ''}</span>
          </div>
          {paiements.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: c.muted, fontSize: '13px' }}>Aucun paiement enregistre.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Date', 'Montant', 'Statut'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {paiements.map(p => (
                  <tr key={p.id}>
                    <td style={s.td}>{new Date(p.date_virement).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                    <td style={{ ...s.td, fontWeight: '600', color: c.teal, fontFamily: 'monospace' }}>+{p.montant}EUR</td>
                    <td style={s.td}>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: isDark ? 'rgba(52,211,153,0.12)' : 'rgba(5,150,105,0.08)', color: c.teal }}>Recu</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showChangePack && (
        <div style={s.modal} onClick={() => setShowChangePack(false)}>
          <div style={{ background: c.surface, border: '1px solid ' + c.border, borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '560px', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: c.text, marginBottom: '6px' }}>Changer de pack</h2>
            <p style={{ fontSize: '13px', color: c.muted, marginBottom: '20px', lineHeight: 1.6 }}>Choisis ton nouveau pack. Une demande sera envoyee automatiquement dans le chat.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {packsDisponibles.map(pack => (
                <div key={pack.id} onClick={() => demanderChangementPack(pack)} style={{ background: c.surface2, border: '1px solid ' + c.border, borderRadius: '10px', padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = c.purple}
                  onMouseLeave={e => e.currentTarget.style.borderColor = c.border}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: c.text, marginBottom: '4px' }}>{pack.nom}</div>
                    {pack.description && <div style={{ fontSize: '12px', color: c.muted }}>{pack.description}</div>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: c.purple }}>{pack.prix}EUR</div>
                    <div style={{ fontSize: '11px', color: c.muted }}>{pack.duree_mois} mois</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowChangePack(false)} style={{ width: '100%', marginTop: '16px', padding: '10px', background: 'none', border: '1px solid ' + c.border, borderRadius: '8px', color: c.muted2, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  )
}
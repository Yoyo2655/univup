'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { t } from '../../../lib/theme'

export default function AbonnementPage() {
  const [abonnement, setAbonnement] = useState(null)
  const [paiements, setPaiements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAbonnement() }, [])

  async function fetchAbonnement() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: aboData } = await supabase
      .from('abonnements')
      .select('*')
      .eq('eleve_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (aboData) {
      setAbonnement(aboData)
      const { data: paiData } = await supabase
        .from('paiements_eleves')
        .select('*')
        .eq('abonnement_id', aboData.id)
        .order('date_virement', { ascending: false })
      setPaiements(paiData || [])
    }

    setLoading(false)
  }

  const totalVerse = paiements.reduce((sum, p) => sum + parseFloat(p.montant), 0)
  const resteAPayer = abonnement ? parseFloat(abonnement.montant) - totalVerse : 0

  const STATUT = {
    actif: { label: 'Actif', color: t.teal, bg: 'rgba(52,211,153,0.12)' },
    en_attente: { label: 'En attente', color: t.amber, bg: 'rgba(251,191,36,0.1)' },
    expire: { label: 'Expiré', color: t.coral, bg: 'rgba(248,113,113,0.1)' },
  }

  const s = {
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid t.border' },
    title: { fontSize: '18px', fontWeight: '600', color: t.text },
    content: { padding: '24px 28px' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
    card: { background: t.surface, border: '1px solid t.border', borderRadius: '12px', overflow: 'hidden' },
    cardBody: { padding: '20px' },
    cardHeader: { padding: '14px 20px', borderBottom: '1px solid t.border', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    cardTitle: { fontSize: '13px', fontWeight: '600', color: t.text },
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' },
    label: { color: t.muted },
    value: { color: t.text, fontWeight: '500', fontFamily: 'monospace' },
    ribBox: { background: t.surface2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '14px 16px', marginTop: '16px' },
  }

  if (loading) return (
    <div style={{ padding: '40px', color: t.muted, textAlign: 'center' }}>Chargement…</div>
  )

  if (!abonnement) return (
    <div style={{ color: t.text }}>
      <div style={s.topbar}><h1 style={s.title}>Mon abonnement</h1></div>
      <div style={{ padding: '40px', textAlign: 'center', color: t.muted }}>
        Aucun abonnement trouvé — contacte UnivUp pour régulariser ta situation.
      </div>
    </div>
  )

  return (
    <div style={{ color: t.text }}>
      <div style={s.topbar}>
        <h1 style={s.title}>Mon abonnement</h1>
        <span style={{
          padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
          background: STATUT[abonnement.statut]?.bg,
          color: STATUT[abonnement.statut]?.color
        }}>
          {STATUT[abonnement.statut]?.label}
        </span>
      </div>

      <div style={s.content}>
        <div style={s.grid2}>

          {/* Pack */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Mon pack</span>
            </div>
            <div style={s.cardBody}>
              <div style={{ fontSize: '22px', fontWeight: '600', color: t.purple, marginBottom: '4px' }}>
                {abonnement.pack_nom}
              </div>
              <div style={{ fontSize: '12px', color: t.muted, marginBottom: '20px' }}>
                {abonnement.date_debut && abonnement.date_fin && (
                  <>Du {new Date(abonnement.date_debut).toLocaleDateString('fr-FR')} au {new Date(abonnement.date_fin).toLocaleDateString('fr-FR')}</>
                )}
              </div>
              <div style={{ ...s.row }}>
                <span style={s.label}>Montant total</span>
                <span style={s.value}>{abonnement.montant}€</span>
              </div>
              <div style={{ ...s.row }}>
                <span style={s.label}>Déjà versé</span>
                <span style={{ ...s.value, color: t.teal }}>{totalVerse.toFixed(2)}€</span>
              </div>
              <div style={{ ...s.row, borderBottom: 'none' }}>
                <span style={s.label}>Reste à payer</span>
                <span style={{ ...s.value, color: resteAPayer > 0 ? t.amber : t.teal }}>
                  {resteAPayer > 0 ? `${resteAPayer.toFixed(2)}€` : '✓ Soldé'}
                </span>
              </div>
            </div>
          </div>

          {/* RIB */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Informations de virement</span>
            </div>
            <div style={s.cardBody}>
              <div style={{ fontSize: '12px', color: t.muted, marginBottom: '16px', lineHeight: 1.6 }}>
                Pour effectuer ton paiement, réalise un virement bancaire avec les informations ci-dessous. 
                Indique bien ta <strong style={{ color: t.text }}>référence unique</strong> dans le motif du virement.
              </div>
              <div style={s.ribBox}>
                <div style={{ fontSize: '10px', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Référence à indiquer
                </div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: t.purple, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                  {abonnement.reference_virement || '—'}
                </div>
              </div>
              <div style={{ ...s.ribBox, marginTop: '10px' }}>
                <div style={{ fontSize: '10px', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Bénéficiaire
                </div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: t.text }}>UnivUp</div>
              </div>
              <div style={{ fontSize: '11px', color: t.muted, marginTop: '12px' }}>
                Une fois le virement reçu, ton accès sera activé sous 24h.
              </div>
            </div>
          </div>
        </div>

        {/* Historique paiements */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>Historique des paiements</span>
            <span style={{ fontSize: '11px', color: t.muted }}>{paiements.length} virement{paiements.length > 1 ? 's' : ''}</span>
          </div>
          {paiements.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: t.muted, fontSize: '13px' }}>
              Aucun paiement enregistré pour le moment.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Date', 'Montant', 'Statut'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: '10px', fontWeight: '500', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 20px', borderBottom: '1px solid t.border' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paiements.map(p => (
                  <tr key={p.id}>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: t.muted2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {new Date(p.date_virement).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '13px', fontWeight: '600', color: t.teal, fontFamily: 'monospace', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      +{p.montant}€
                    </td>
                    <td style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: 'rgba(52,211,153,0.12)', color: t.teal }}>
                        Reçu ✓
                      </span>
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
}
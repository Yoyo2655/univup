'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

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
    actif: { label: 'Actif', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
    en_attente: { label: 'En attente', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
    expire: { label: 'Expiré', color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  }

  const s = {
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
    title: { fontSize: '18px', fontWeight: '600', color: '#e8e6e0' },
    content: { padding: '24px 28px' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
    card: { background: '#18181c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' },
    cardBody: { padding: '20px' },
    cardHeader: { padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    cardTitle: { fontSize: '13px', fontWeight: '600', color: '#e8e6e0' },
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' },
    label: { color: '#6e6c66' },
    value: { color: '#e8e6e0', fontWeight: '500', fontFamily: 'monospace' },
    ribBox: { background: '#1e1e24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '14px 16px', marginTop: '16px' },
  }

  if (loading) return (
    <div style={{ padding: '40px', color: '#6e6c66', textAlign: 'center' }}>Chargement…</div>
  )

  if (!abonnement) return (
    <div style={{ color: '#e8e6e0' }}>
      <div style={s.topbar}><h1 style={s.title}>Mon abonnement</h1></div>
      <div style={{ padding: '40px', textAlign: 'center', color: '#6e6c66' }}>
        Aucun abonnement trouvé — contacte UnivUp pour régulariser ta situation.
      </div>
    </div>
  )

  return (
    <div style={{ color: '#e8e6e0' }}>
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
              <div style={{ fontSize: '22px', fontWeight: '600', color: '#a78bfa', marginBottom: '4px' }}>
                {abonnement.pack_nom}
              </div>
              <div style={{ fontSize: '12px', color: '#6e6c66', marginBottom: '20px' }}>
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
                <span style={{ ...s.value, color: '#34d399' }}>{totalVerse.toFixed(2)}€</span>
              </div>
              <div style={{ ...s.row, borderBottom: 'none' }}>
                <span style={s.label}>Reste à payer</span>
                <span style={{ ...s.value, color: resteAPayer > 0 ? '#fbbf24' : '#34d399' }}>
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
              <div style={{ fontSize: '12px', color: '#6e6c66', marginBottom: '16px', lineHeight: 1.6 }}>
                Pour effectuer ton paiement, réalise un virement bancaire avec les informations ci-dessous. 
                Indique bien ta <strong style={{ color: '#e8e6e0' }}>référence unique</strong> dans le motif du virement.
              </div>
              <div style={s.ribBox}>
                <div style={{ fontSize: '10px', color: '#6e6c66', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Référence à indiquer
                </div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#a78bfa', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                  {abonnement.reference_virement || '—'}
                </div>
              </div>
              <div style={{ ...s.ribBox, marginTop: '10px' }}>
                <div style={{ fontSize: '10px', color: '#6e6c66', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Bénéficiaire
                </div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#e8e6e0' }}>UnivUp</div>
              </div>
              <div style={{ fontSize: '11px', color: '#6e6c66', marginTop: '12px' }}>
                Une fois le virement reçu, ton accès sera activé sous 24h.
              </div>
            </div>
          </div>
        </div>

        {/* Historique paiements */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>Historique des paiements</span>
            <span style={{ fontSize: '11px', color: '#6e6c66' }}>{paiements.length} virement{paiements.length > 1 ? 's' : ''}</span>
          </div>
          {paiements.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#6e6c66', fontSize: '13px' }}>
              Aucun paiement enregistré pour le moment.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Date', 'Montant', 'Statut'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: '10px', fontWeight: '500', color: '#6e6c66', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paiements.map(p => (
                  <tr key={p.id}>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: '#9e9c96', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {new Date(p.date_virement).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '13px', fontWeight: '600', color: '#34d399', fontFamily: 'monospace', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      +{p.montant}€
                    </td>
                    <td style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>
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
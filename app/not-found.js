import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0e0d0d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* SVG déco */}
      <svg style={{ position: 'absolute', top: 0, right: 0, opacity: 0.06, pointerEvents: 'none' }} width="400" height="400" viewBox="0 0 400 400">
        <polyline points="400,0 180,0 80,200 400,200" fill="none" stroke="#f0eeea" strokeWidth="12" />
        <polyline points="400,14 186,14 86,214 400,214" fill="none" stroke="#9b8ec4" strokeWidth="12" />
        <polyline points="400,28 192,28 92,228 400,228" fill="none" stroke="#8a1c30" strokeWidth="12" />
      </svg>

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Séparateur tricolore */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ height: '3px', width: '48px', background: '#f0eeea' }} />
          <div style={{ height: '3px', width: '48px', background: '#9b8ec4' }} />
          <div style={{ height: '3px', width: '48px', background: '#8a1c30' }} />
        </div>

        <div style={{ fontSize: '96px', fontWeight: '700', color: '#9b8ec4', letterSpacing: '-4px', lineHeight: 1, marginBottom: '16px' }}>
          404
        </div>

        <div style={{ fontSize: '20px', fontWeight: '500', color: '#f0eeea', marginBottom: '10px', letterSpacing: '-0.3px' }}>
          Page introuvable
        </div>

        <div style={{ fontSize: '13px', color: '#4a4847', marginBottom: '40px', lineHeight: 1.6 }}>
          Cette page n'existe pas ou a été déplacée.
        </div>

        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'inline-block',
            padding: '11px 28px',
            background: '#f0eeea',
            borderRadius: '8px',
            color: '#111010',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            letterSpacing: '0.2px',
          }}>
            Retour à la connexion
          </div>
        </Link>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '48px' }}>
          <div style={{ height: '2px', flex: 3, background: 'rgba(240,238,234,0.06)', maxWidth: '80px' }} />
          <div style={{ height: '2px', width: '32px', background: 'rgba(155,142,196,0.3)' }} />
          <div style={{ height: '2px', width: '32px', background: 'rgba(138,28,48,0.3)' }} />
        </div>

        <div style={{ fontSize: '11px', color: '#2e2d2b', marginTop: '20px' }}>
          © {new Date().getFullYear()} UnivUp
        </div>
      </div>
    </div>
  )
}
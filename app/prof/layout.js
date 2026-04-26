import ProfSidebar from './sidebar'
import { t } from '../../lib/theme'

export default function ProfLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', background: t.bg }}>
      <ProfSidebar />
      <div style={{ marginLeft: '220px', flex: 1 }}>
        {children}
      </div>
    </div>
  )
}
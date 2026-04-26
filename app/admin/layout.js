import AdminSidebar from './sidebar'
import { t } from '../../lib/theme'

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', background: t.bg }}>
      <AdminSidebar />
      <div style={{ marginLeft: '220px', flex: 1 }}>
        {children}
      </div>
    </div>
  )
}
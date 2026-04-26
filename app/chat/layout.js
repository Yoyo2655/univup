'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../admin/sidebar'
import ProfSidebar from '../prof/sidebar'
import EleveSidebar from '../eleve/sidebar'

export default function ChatLayout({ children }) {
  const [role, setRole] = useState(null)

  useEffect(() => {
    async function getRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (data) setRole(data.role)
    }
    getRole()
  }, [])

  const Sidebar = role === 'admin' ? AdminSidebar : role === 'prof' ? ProfSidebar : EleveSidebar

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', background: '#0f0f11' }}>
      {role && <Sidebar />}
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  )
}
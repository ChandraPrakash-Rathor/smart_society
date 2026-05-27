import { useState } from 'react'
import { useSelector } from 'react-redux'
import Navbar from './Navbar'
import AdminSidebar    from './sidebars/AdminSidebar'
import ResidentSidebar from './sidebars/ResidentSidebar'
import GuardSidebar    from './sidebars/GuardSidebar'
import ChatBot from './ChatBot'

const SIDEBARS = {
  admin:    AdminSidebar,
  resident: ResidentSidebar,
  guard:    GuardSidebar,
}

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const role = useSelector((state) => state.auth.user?.role) || 'resident'

  const Sidebar = SIDEBARS[role] || ResidentSidebar

  return (
    <div className="min-h-screen bg-brand-50 flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Chat bot — only for residents */}
      {role === 'resident' && <ChatBot />}
    </div>
  )
}

export default DashboardLayout

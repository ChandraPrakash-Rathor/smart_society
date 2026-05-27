import SidebarBase from './SidebarBase'
import { BookOpenCheck, ClipboardList, Home, LogIn, Siren, Users } from 'lucide-react'

const nav = [
  { to: '/guard/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
  { to: '/guard/visitors', label: 'Entry Gate', icon: <Users size={20} /> },
  { to: '/guard/inside', label: 'Visitors Inside', icon: <LogIn size={20} /> },
  { to: '/guard/patrol', label: "Today's Log", icon: <ClipboardList size={20} /> },
  { to: '/guard/alerts', label: 'Emergency Alerts', icon: <Siren size={20} /> },
  { to: '/guard/duty-guide', label: 'Duty Guide', icon: <BookOpenCheck size={20} /> },
]

export default function GuardSidebar(props) {
  return <SidebarBase nav={nav} {...props} />
}

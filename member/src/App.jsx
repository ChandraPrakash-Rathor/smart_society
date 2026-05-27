import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout  from './components/DashboardLayout'
import ProtectedRoute   from './components/ProtectedRoute'

// Auth
import Login    from './pages/Login'
import Register from './pages/Register'

// Public QR page
import QRPage      from './pages/QRPage'
import StaffQRPage from './pages/StaffQRPage'

// Admin pages
import AdminDashboard     from './pages/admin/Dashboard'
import AdminVisitors      from './pages/admin/Visitors'
import AdminStaff         from './pages/admin/Staff'
import AdminGuards        from './pages/admin/Guards'
import AdminAnnouncements from './pages/admin/Announcements'
import AdminComplaints    from './pages/admin/Complaints'
import AdminUsers         from './pages/admin/Users'
import AdminMaintenance   from './pages/admin/Maintenance'

// Resident pages
import ResidentDashboard from './pages/resident/Dashboard'
import ResidentVisitor   from './pages/resident/Visitor'
import ResidentStaff     from './pages/resident/Staff'
import ResidentProfile   from './pages/resident/Profile'
import ResidentComplaint   from './pages/resident/Complaint'
import ResidentTimeline    from './pages/resident/Timeline'
import ResidentMaintenance from './pages/resident/Maintenance'

// Guard pages
import GuardDashboard from './pages/guard/Dashboard'
import GuardPatrol    from './pages/guard/Patrol'
import GuardVisitors  from './pages/guard/Visitors'
import GuardAlerts    from './pages/guard/Alerts'
import GuardInsideVisitors from './pages/guard/InsideVisitors'
import GuardDutyGuide from './pages/guard/DutyGuide'

// Wrap page in layout + role protection
const Page = ({ component: Component, roles }) => (
  <ProtectedRoute allowedRoles={roles}>
    <DashboardLayout>
      <Component />
    </DashboardLayout>
  </ProtectedRoute>
)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"         element={<Login />} />
        <Route path="/register"      element={<Register />} />
        <Route path="/qr/:visitorId"  element={<QRPage />} />
        <Route path="/staff-qr/:staffId" element={<StaffQRPage />} />

        {/* ── Admin ── */}
        <Route path="/admin/dashboard"     element={<Page component={AdminDashboard}     roles={['admin']} />} />
        <Route path="/admin/users"         element={<Page component={AdminUsers}         roles={['admin']} />} />
        <Route path="/admin/visitors"      element={<Page component={AdminVisitors}      roles={['admin']} />} />
        <Route path="/admin/staff"         element={<Page component={AdminStaff}         roles={['admin']} />} />
        <Route path="/admin/guards"        element={<Page component={AdminGuards}        roles={['admin']} />} />
        <Route path="/admin/complaints"    element={<Page component={AdminComplaints}    roles={['admin']} />} />
        <Route path="/admin/announcements" element={<Page component={AdminAnnouncements} roles={['admin']} />} />
        <Route path="/admin/maintenance"   element={<Page component={AdminMaintenance}   roles={['admin']} />} />

        {/* ── Resident ── */}
        <Route path="/resident/dashboard"  element={<Page component={ResidentDashboard} roles={['resident']} />} />
        <Route path="/resident/visitor"    element={<Page component={ResidentVisitor}   roles={['resident']} />} />
        <Route path="/resident/staff"      element={<Page component={ResidentStaff}     roles={['resident']} />} />
        <Route path="/resident/profile"    element={<Page component={ResidentProfile}   roles={['resident']} />} />
        <Route path="/resident/complaint"   element={<Page component={ResidentComplaint}   roles={['resident']} />} />
        <Route path="/resident/timeline"    element={<Page component={ResidentTimeline}    roles={['resident']} />} />
        <Route path="/resident/maintenance" element={<Page component={ResidentMaintenance} roles={['resident']} />} />

        {/* ── Guard ── */}
        <Route path="/guard/dashboard" element={<Page component={GuardDashboard} roles={['guard']} />} />
        <Route path="/guard/patrol"    element={<Page component={GuardPatrol}    roles={['guard']} />} />
        <Route path="/guard/visitors"  element={<Page component={GuardVisitors}  roles={['guard']} />} />
        <Route path="/guard/alerts"    element={<Page component={GuardAlerts}    roles={['guard']} />} />
        <Route path="/guard/inside"    element={<Page component={GuardInsideVisitors} roles={['guard']} />} />
        <Route path="/guard/duty-guide" element={<Page component={GuardDutyGuide} roles={['guard']} />} />

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

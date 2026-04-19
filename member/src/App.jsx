import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DashboardLayout from './components/DashboardLayout'

// Placeholder page for sidebar routes
function PlaceholderPage({ title }) {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-2xl font-bold text-brand-700">{title}</p>
          <p className="text-gray-400 mt-2 text-sm">This page is coming soon.</p>
        </div>
      </div>
    </DashboardLayout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"         element={<Login />} />
        <Route path="/register"      element={<Register />} />
        <Route path="/dashboard"     element={<Dashboard />} />
        <Route path="/visitors"      element={<PlaceholderPage title="Visitors" />} />
        <Route path="/staff"         element={<PlaceholderPage title="Staff" />} />
        <Route path="/guards"        element={<PlaceholderPage title="Guards" />} />
        <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />
        <Route path="/settings"      element={<PlaceholderPage title="Settings" />} />
        <Route path="*"              element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

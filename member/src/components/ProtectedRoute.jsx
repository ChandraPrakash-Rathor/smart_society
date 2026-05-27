import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { getRoleHome } from '../utils/roleRedirect'

// allowedRoles: array e.g. ['admin'] or ['resident'] or ['guard']
function ProtectedRoute({ children, allowedRoles }) {
  const { user, token } = useSelector((state) => state.auth)

  // Not logged in → go to login
  if (!token) return <Navigate to="/login" replace />

  // Logged in but wrong role → redirect to their own home
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={getRoleHome(user?.role)} replace />
  }

  return children
}

export default ProtectedRoute

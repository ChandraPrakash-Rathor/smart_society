// Returns the home route for a given role
export const getRoleHome = (role) => {
  switch (role) {
    case 'admin':    return '/admin/dashboard'
    case 'resident': return '/resident/dashboard'
    case 'guard':    return '/guard/dashboard'
    default:         return '/login'
  }
}

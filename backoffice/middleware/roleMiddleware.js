// ── Role-based access control ─────────────────────────────────────────────────
// Usage: authorise('admin')  or  authorise('admin', 'guard')
const authorise = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return res.status(403).json({
      message: `Access denied. Required role: ${roles.join(' or ')}`,
    })
  next()
}

module.exports = { authorise }

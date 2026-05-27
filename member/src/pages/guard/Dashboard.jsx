import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  Home,
  QrCode,
  ClipboardList,
  LogIn,
  PhoneCall,
  MapPin,
  UserCheck,
} from 'lucide-react'
import { setStats, setLogs, setLoading } from '../../features/guard/guardSlice'
import * as guardAPI from '../../features/guard/guardAPI'
import axiosInstance from '../../utils/axiosInstance'

const statusCfg = {
  Approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  Pending:  { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400'   },
  Rejected: { bg: 'bg-red-100',     text: 'text-red-600',     dot: 'bg-red-400'     },
  Inside:   { bg: 'bg-brand-100',   text: 'text-brand-700',   dot: 'bg-brand-400'   },
}

const formatAlertTime = (value) =>
  value ? new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'

const formatTime = (value) =>
  value ? new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'

// ── Animated counter ──────────────────────────────────────────────────────────
function useCountUp(target) {
  const [v, setV] = useState(0)
  useEffect(() => {
    setV(0)
    if (!target) return
    let i = 0
    const step = Math.max(30, Math.ceil(1000 / target))
    const t = setInterval(() => { i++; setV(i); if (i >= target) clearInterval(t) }, step)
    return () => clearInterval(t)
  }, [target])
  return v
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, change, icon: Icon, gradient, glow, delay }) {
  const count = useCountUp(value)
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])

  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${glow}
      transition-all duration-700 ease-out hover:-translate-y-1 hover:shadow-xl cursor-default
      bg-gradient-to-br ${gradient}
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full bg-white/10" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-1">{label}</p>
          <p className="text-4xl font-extrabold leading-none">{count}</p>
          <p className="text-white/60 text-xs mt-2">{change}</p>
        </div>
        <div className="bg-white/20 rounded-xl p-2.5"><Icon size={20} /></div>
      </div>
    </div>
  )
}

function QuickAction({ to, label, hint, icon: Icon, tone }) {
  const tones = {
    brand: 'border-brand-100 bg-brand-50 text-brand-700 hover:border-brand-300',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:border-emerald-300',
    amber: 'border-amber-100 bg-amber-50 text-amber-700 hover:border-amber-300',
    red: 'border-red-100 bg-red-50 text-red-600 hover:border-red-300',
  }

  return (
    <Link to={to} className={`flex items-center gap-3 rounded-xl border p-3 transition hover:-translate-y-0.5 ${tones[tone]}`}>
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/80">
        <Icon size={18} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold">{label}</span>
        <span className="block truncate text-xs opacity-70">{hint}</span>
      </span>
    </Link>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function GuardDashboard() {
  const dispatch = useDispatch()
  const user     = useSelector(s => s.auth.user)
  const { stats, logs, loading } = useSelector(s => s.guard)

  const [visible, setVisible] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [alertsLoading, setAlertsLoading] = useState(true)
  const [visitors, setVisitors] = useState([])

  useEffect(() => {
    const load = async () => {
      dispatch(setLoading())
      try {
        const [statsRes, logsRes, alertsRes, visitorsRes] = await Promise.all([
          guardAPI.fetchGuardStats(),
          guardAPI.fetchEntryLogs(),
          axiosInstance.get('/alerts'),
          guardAPI.fetchPendingVisitors(),
        ])
        dispatch(setStats(statsRes.data))
        dispatch(setLogs(logsRes.data))
        setAlerts(alertsRes.data)
        setVisitors(visitorsRes.data)
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load dashboard')
      } finally {
        setAlertsLoading(false)
      }
    }
    load()
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [dispatch])

  const resolveAlert = async (alertId) => {
    try {
      const { data } = await axiosInstance.patch(`/alerts/${alertId}/resolve`)
      setAlerts(prev => prev.map(alert => alert._id === alertId ? data : alert))
      toast.success('Emergency alert resolved')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve alert')
    }
  }

  const statCards = [
    { label: 'Total Entries Today', value: stats.totalToday, change: 'Today',           icon: Users,       gradient: 'from-brand-500 to-brand-700',  glow: 'shadow-brand-300/40'   },
    { label: 'Pending Visitors',    value: stats.pending,    change: 'Needs attention', icon: Clock,       gradient: 'from-amber-400 to-orange-500', glow: 'shadow-orange-200/40'  },
    { label: 'Approved Today',      value: stats.approved,   change: 'All cleared',     icon: CheckCircle2,gradient: 'from-emerald-400 to-teal-500', glow: 'shadow-emerald-200/40' },
    { label: 'Rejected Today',      value: stats.rejected,   change: 'Security alerts', icon: XCircle,     gradient: 'from-red-400 to-rose-600',     glow: 'shadow-red-200/40'     },
  ]

  const activeAlerts = alerts.filter(alert => !alert.resolved)
  const recentAlerts = alerts.slice(0, 5)
  const pendingVisitors = visitors.filter(visitor => visitor.status === 'Pending').slice(0, 5)
  const insideVisitors = visitors.filter(visitor => visitor.checkIn && !visitor.checkOut).slice(0, 5)

  return (
    <div className="p-6 space-y-8 min-h-screen">

      {/* Header */}
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-950 tracking-tight">
              Welcome, {user?.name?.split(' ')[0] || 'Guard'} 🛡️
            </h1>
            <p className="text-sm text-brand-400 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-semibold text-emerald-700">On Duty</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((s, i) => <StatCard key={s.label} {...s} delay={i * 100} />)}
      </div>

      {/* Quick Actions */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 transition-all duration-700 delay-150 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <QuickAction to="/guard/visitors" label="Scan Visitor QR" hint="Record entry from pass" icon={QrCode} tone="emerald" />
        <QuickAction to="/guard/visitors" label="Pending Approvals" hint={`${visitors.filter(v => v.status === 'Pending').length} waiting`} icon={UserCheck} tone="amber" />
        <QuickAction to="/guard/patrol" label="Today's Log" hint={`${logs.length} entries recorded`} icon={ClipboardList} tone="brand" />
        <QuickAction to="/guard/dashboard" label="Emergency Desk" hint={`${activeAlerts.length} active alerts`} icon={AlertTriangle} tone="red" />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Entries from API */}
        <div className={`lg:col-span-2 bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden
          transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-brand-100">
            <h2 className="text-sm font-bold text-brand-950">Recent Entries</h2>
            <span className="text-xs text-brand-400 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">Today</span>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-50 border-b border-brand-100">
                  {['Visitor','Flat','Time In','Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 5).map(log => {
                  const cfg = statusCfg[log.status] || statusCfg.Pending
                  return (
                    <tr key={log._id} className="border-b border-brand-50 hover:bg-brand-50/60 transition">
                      <td className="px-5 py-3 font-medium text-brand-900">{log.name}</td>
                      <td className="px-5 py-3 text-brand-500">{log.flat}</td>
                      <td className="px-5 py-3 text-brand-500">
                        {new Date(log.timeIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {!loading && logs.length === 0 && (
                  <tr><td colSpan={4} className="py-10 text-center text-sm text-brand-400">No entries today</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Emergency Alerts */}
        <div className={`bg-white rounded-2xl border border-red-100 shadow-sm p-5
          transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            <h2 className="text-sm font-bold text-brand-950">Emergency Alerts</h2>
            {activeAlerts.length > 0 && (
              <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600 animate-pulse">
                {activeAlerts.length} active
              </span>
            )}
          </div>

          {alertsLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-5 w-5 rounded-full border-2 border-brand-300 border-t-brand-600 animate-spin" />
            </div>
          ) : recentAlerts.length === 0 ? (
            <div className="py-10 text-center">
              <ShieldCheck size={28} className="mx-auto mb-2 text-emerald-300" />
              <p className="text-sm text-brand-400">No emergency alerts</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {recentAlerts.map(alert => (
                <li key={alert._id} className={`rounded-xl border p-3 ${
                  alert.resolved ? 'border-emerald-100 bg-emerald-50' : 'border-red-100 bg-red-50'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-brand-950">
                        {alert.sentBy?.name || 'Resident'}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-brand-500">
                        <Home size={11} /> Flat {alert.flat || alert.sentBy?.flat || 'N/A'} · {formatAlertTime(alert.createdAt)}
                      </p>
                    </div>
                    <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                      alert.resolved ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {alert.resolved ? 'Resolved' : 'Active'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-medium text-brand-700">{alert.message}</p>
                  {!alert.resolved && (
                    <button
                      type="button"
                      onClick={() => resolveAlert(alert._id)}
                      className="mt-3 w-full rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700 active:scale-95"
                    >
                      Mark Resolved
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Operations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className={`bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden
          transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              <h2 className="text-sm font-bold text-brand-950">Pending Approvals</h2>
            </div>
            <Link to="/guard/visitors" className="text-xs font-semibold text-amber-600 hover:text-amber-700">Open gate list</Link>
          </div>
          {pendingVisitors.length === 0 ? (
            <p className="py-8 text-center text-sm text-brand-400">No visitors waiting</p>
          ) : (
            <ul>
              {pendingVisitors.map(visitor => (
                <li key={visitor._id} className="flex items-center justify-between gap-3 border-b border-brand-50 px-5 py-3 last:border-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-brand-900">{visitor.name}</p>
                    <p className="truncate text-xs text-brand-400">Flat {visitor.host || visitor.flat || 'N/A'} · {visitor.purpose || 'Visit'}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">Pending</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={`bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden
          transition-all duration-700 delay-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-brand-100">
            <div className="flex items-center gap-2">
              <LogIn size={16} className="text-brand-500" />
              <h2 className="text-sm font-bold text-brand-950">Currently Inside</h2>
            </div>
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-600">{insideVisitors.length}</span>
          </div>
          {insideVisitors.length === 0 ? (
            <p className="py-8 text-center text-sm text-brand-400">No visitors inside</p>
          ) : (
            <ul>
              {insideVisitors.map(visitor => (
                <li key={visitor._id} className="flex items-center justify-between gap-3 border-b border-brand-50 px-5 py-3 last:border-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-brand-900">{visitor.name}</p>
                    <p className="truncate text-xs text-brand-400">Flat {visitor.host || visitor.flat || 'N/A'} · In {formatTime(visitor.checkIn)}</p>
                  </div>
                  <Link to="/guard/visitors" className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700">
                    Exit
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={`bg-white rounded-2xl border border-emerald-100 shadow-sm p-5
          transition-all duration-700 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            <h2 className="text-sm font-bold text-brand-950">Duty Checklist</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Verify QR before entry', icon: QrCode },
              { label: 'Record exit for every visitor', icon: ClipboardList },
              { label: 'Call admin during emergency', icon: PhoneCall },
              { label: 'Watch main gate and lobby', icon: MapPin },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                <item.icon size={14} className="text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

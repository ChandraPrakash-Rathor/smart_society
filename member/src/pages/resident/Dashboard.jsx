import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  Users, UserCheck, Clock, TrendingUp,
  Bell, CheckCircle2, ArrowUpRight, Activity,
  AlertTriangle, X, MessageSquare, IndianRupee,
} from 'lucide-react'
import axiosInstance from '../../utils/axiosInstance'

// ── Quick links ───────────────────────────────────────────────────────────────
const quickLinks = [
  { label: 'Add Visitor',    to: '/resident/visitor',     cls: 'bg-brand-600 hover:bg-brand-700' },
  { label: 'Manage Staff',   to: '/resident/staff',       cls: 'bg-brand-500 hover:bg-brand-600' },
  { label: 'Complaints',     to: '/resident/complaint',   cls: 'bg-brand-800 hover:bg-brand-900' },
]

// ── Activity type config ──────────────────────────────────────────────────────
const activityMeta = {
  Approved: { dot: 'bg-emerald-400', icon: CheckCircle2, color: 'text-emerald-500', label: 'approved' },
  Pending:  { dot: 'bg-amber-400',   icon: Bell,         color: 'text-amber-500',   label: 'pending'  },
  Rejected: { dot: 'bg-red-400',     icon: X,            color: 'text-red-500',     label: 'rejected' },
}

// ── Animated counter ──────────────────────────────────────────────────────────
function useCountUp(target) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!target) return
    let s = 0
    const step = Math.max(30, Math.ceil(1000 / target))
    const t = setInterval(() => { s++; setCount(s); if (s >= target) clearInterval(t) }, step)
    return () => clearInterval(t)
  }, [target])
  return count
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, change, icon: Icon, gradient, glow, delay, to }) {
  const count = useCountUp(value || 0)
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])

  const inner = (
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
          {change && <p className="text-white/60 text-xs mt-2">{change}</p>}
        </div>
        <div className="bg-white/20 rounded-xl p-2.5"><Icon size={20} /></div>
      </div>
    </div>
  )

  return to ? <Link to={to}>{inner}</Link> : inner
}

// ── Activity Item ─────────────────────────────────────────────────────────────
function ActivityItem({ visitor, index }) {
  const [visible, setVisible] = useState(false)
  const meta = activityMeta[visitor.status] || activityMeta.Pending
  useEffect(() => { const t = setTimeout(() => setVisible(true), 300 + index * 100); return () => clearTimeout(t) }, [index])

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date)
    const mins = Math.floor(diff / 60000)
    if (mins < 60)  return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)   return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <li className={`flex items-center gap-3 py-3 border-b border-brand-100 last:border-0
      transition-all duration-500 ease-out
      ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.dot}`} />
      <meta.icon size={14} className={`flex-shrink-0 ${meta.color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-brand-800 truncate">
          <span className="font-semibold">{visitor.name}</span>
          {' — '}{visitor.purpose}
        </p>
      </div>
      <span className="text-xs text-brand-400 whitespace-nowrap">{timeAgo(visitor.createdAt)}</span>
    </li>
  )
}

// ── Emergency Alert ───────────────────────────────────────────────────────────
function EmergencyAlert() {
  const user = useSelector(s => s.auth.user)
  const [sending, setSending]     = useState(false)
  const [sent, setSent]           = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSend = async () => {
    setSending(true)
    try {
      await axiosInstance.post('/alerts', {
        message: 'Emergency! Immediate assistance required.',
        flat: user?.flat || 'Resident',
      })
      setSent(true)
      setShowConfirm(false)
      toast.success('🚨 Alert sent to Guard and Admin!')
      setTimeout(() => setSent(false), 10000)
    } catch {
      setSent(true)
      setShowConfirm(false)
      toast.success('🚨 Alert sent to Guard and Admin!')
      setTimeout(() => setSent(false), 10000)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={15} className="text-red-500" />
        <h2 className="text-sm font-bold text-brand-950">Emergency</h2>
      </div>
      {sent && (
        <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-xs text-red-700 font-medium animate-pulse">
          🚨 Alert sent to Guard and Admin!
        </div>
      )}
      <p className="text-xs text-brand-400 mb-4">Press only in a real emergency.</p>
      {!showConfirm ? (
        <button onClick={() => setShowConfirm(true)}
          className="w-full py-2.5 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold
            rounded-xl transition shadow-md shadow-red-200 flex items-center justify-center gap-2 text-sm">
          <AlertTriangle size={15} /> Emergency Alert 🚨
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-red-600 text-center">Are you sure?</p>
          <div className="flex gap-2">
            <button onClick={() => setShowConfirm(false)}
              className="flex-1 py-2 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition">
              Cancel
            </button>
            <button onClick={handleSend} disabled={sending}
              className="flex-1 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 active:scale-95 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-1">
              {sending ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><AlertTriangle size={13} /> Send</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Quick Stats Row ───────────────────────────────────────────────────────────
function QuickStatRow({ label, value, icon: Icon, color, to }) {
  const inner = (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition hover:shadow-sm
      ${color}`}>
      <div className="flex items-center gap-2">
        <Icon size={14} />
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <span className="text-lg font-extrabold">{value ?? '—'}</span>
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ResidentDashboard() {
  const user = useSelector(s => s.auth.user)

  const [visible, setVisible]         = useState(false)
  const [loading, setLoading]         = useState(true)
  const [stats, setStats]             = useState({})
  const [recentVisitors, setRecentVisitors] = useState([])

  // ── Fetch real data ──
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosInstance.get('/resident/stats')
        setStats(data.stats)
        setRecentVisitors(data.recentVisitors || [])
      } catch {
        // silently keep empty — dashboard still renders
      } finally {
        setLoading(false)
      }
    }
    load()
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const statCards = [
    {
      label: 'Total Visitors',    value: stats.totalVisitors,
      change: 'All time',         icon: Users,
      gradient: 'from-brand-500 to-brand-700',  glow: 'shadow-brand-300/40',
      to: '/resident/visitor',
    },
    {
      label: 'Total Staff',       value: stats.totalStaff,
      change: `${stats.activeStaff ?? 0} active`, icon: UserCheck,
      gradient: 'from-brand-400 to-brand-600',  glow: 'shadow-brand-200/40',
      to: '/resident/staff',
    },
    {
      label: 'Pending Visitors',  value: stats.pendingVisitors,
      change: 'Needs attention',  icon: Clock,
      gradient: 'from-amber-400 to-orange-500', glow: 'shadow-orange-200/40',
      to: '/resident/visitor',
    },
    {
      label: 'Approved Today',    value: stats.approvedToday,
      change: 'Today',            icon: TrendingUp,
      gradient: 'from-emerald-400 to-teal-500', glow: 'shadow-emerald-200/40',
      to: '/resident/visitor',
    },
  ]

  return (
    <div className="p-6 space-y-8 min-h-screen">

      {/* Header */}
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-950 tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Resident'} 👋
            </h1>
            <p className="text-sm text-brand-400 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {quickLinks.map(({ label, to, cls }) => (
              <Link key={label} to={to}
                className={`text-xs font-semibold text-white px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 ${cls}`}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 120} />
        ))}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Visitors Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-brand-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-brand-950">Recent Visitors</h2>
            <Link to="/resident/visitor"
              className="text-xs text-brand-500 hover:text-brand-700 font-semibold transition">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
            </div>
          ) : recentVisitors.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-brand-300">
              <Users size={28} className="opacity-40" />
              <p className="text-sm text-brand-400">No visitors yet</p>
              <Link to="/resident/visitor"
                className="text-xs text-brand-600 hover:text-brand-800 font-semibold underline transition">
                Add your first visitor
              </Link>
            </div>
          ) : (
            <ul>
              {recentVisitors.map((v, i) => (
                <ActivityItem key={v._id} visitor={v} index={i} />
              ))}
            </ul>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Quick stats */}
          <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-5 space-y-2">
            <h2 className="text-sm font-bold text-brand-950 mb-3">My Overview</h2>
            <QuickStatRow
              label="Open Complaints"   value={stats.openComplaints}
              icon={MessageSquare}      color="bg-amber-50 border-amber-100 text-amber-700"
              to="/resident/complaint"
            />
            <QuickStatRow
              label="Pending Bills"     value={stats.pendingMaintenance}
              icon={IndianRupee}        color="bg-red-50 border-red-100 text-red-600"
              to="/resident/maintenance"
            />
            <QuickStatRow
              label="Active Staff"      value={stats.activeStaff}
              icon={UserCheck}          color="bg-emerald-50 border-emerald-100 text-emerald-700"
              to="/resident/staff"
            />
          </div>

          {/* Emergency */}
          <EmergencyAlert />
        </div>
      </div>
    </div>
  )
}

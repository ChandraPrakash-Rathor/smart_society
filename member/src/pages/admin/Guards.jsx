import { useEffect, useState } from 'react'
import { Search, Eye, Shield, ShieldCheck, ShieldOff, Clock, CheckCircle2, XCircle, ClipboardList } from 'lucide-react'
import Modal from '../../components/Modal'
import { toast } from 'react-toastify'
import axiosInstance from '../../utils/axiosInstance'

// ── Static data ───────────────────────────────────────────────────────────────
const initialGuards = [
  {
    id: 1, name: 'Ramesh Kumar',  email: 'ramesh@example.com',  phone: '9876543210',
    shift: 'Morning', assignedGate: 'Main Gate', isOnDuty: true,  status: 'Active',
    joined: 'Jan 10, 2026',
    patrolLogs: [
      { checkpoint: 'Gate A', time: '09:00 AM', status: 'Clear', notes: 'All clear' },
      { checkpoint: 'Parking', time: '10:30 AM', status: 'Alert', notes: 'Suspicious vehicle' },
      { checkpoint: 'Tower B', time: '12:00 PM', status: 'Clear', notes: '' },
    ],
  },
  {
    id: 2, name: 'Mohan Singh',   email: 'mohan@example.com',   phone: '9123456780',
    shift: 'Evening', assignedGate: 'Gate 2', isOnDuty: false, status: 'Active',
    joined: 'Feb 05, 2026',
    patrolLogs: [
      { checkpoint: 'Main Gate', time: '02:00 PM', status: 'Clear', notes: '' },
      { checkpoint: 'Garden',    time: '03:30 PM', status: 'Clear', notes: 'Routine check' },
    ],
  },
  {
    id: 3, name: 'Suresh Yadav',  email: 'suresh@example.com',  phone: '9001234567',
    shift: 'Night', assignedGate: 'Gate 3', isOnDuty: false, status: 'Active',
    joined: 'Mar 18, 2026',
    patrolLogs: [],
  },
  {
    id: 4, name: 'Arjun Verma',   email: 'arjun@example.com',   phone: '9988776655',
    shift: 'Morning', assignedGate: 'Main Gate', isOnDuty: false, status: 'Inactive',
    joined: 'Apr 01, 2026',
    patrolLogs: [],
  },
]

// ── Config ────────────────────────────────────────────────────────────────────
const shiftColors = {
  Morning: 'bg-amber-100 text-amber-700',
  Evening: 'bg-brand-100 text-brand-700',
  Night:   'bg-indigo-100 text-indigo-700',
}

const avatarColors = ['bg-brand-500','bg-brand-600','bg-amber-500','bg-teal-500','bg-rose-500','bg-indigo-500']

// ── View Guard Modal ──────────────────────────────────────────────────────────
function GuardDetailModal({ open, onClose, guard }) {
  if (!guard) return null
  const initials = guard.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <Modal open={open} onClose={onClose} title="Guard Details" size="md">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-brand-100">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-extrabold flex-shrink-0 ${avatarColors[guard.id % avatarColors.length]}`}>
            {initials}
          </div>
          <div>
            <p className="text-lg font-bold text-brand-950">{guard.name}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${shiftColors[guard.shift]}`}>
                {guard.shift} Shift
              </span>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full
                ${guard.isOnDuty ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${guard.isOnDuty ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
                {guard.isOnDuty ? 'On Duty' : 'Off Duty'}
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Email',         value: guard.email        },
            { label: 'Phone',         value: guard.phone        },
            { label: 'Assigned Gate', value: guard.assignedGate },
            { label: 'Joined',        value: guard.joined       },
          ].map(({ label, value }) => (
            <div key={label} className="bg-brand-50 rounded-xl p-3 border border-brand-100">
              <p className="text-xs text-brand-400 font-medium uppercase tracking-wide">{label}</p>
              <p className="text-sm font-semibold text-brand-900 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Patrol Logs */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList size={14} className="text-brand-500" />
            <p className="text-sm font-bold text-brand-950">Patrol Logs</p>
            <span className="text-xs bg-brand-100 text-brand-600 font-semibold px-2 py-0.5 rounded-full">
              {guard.patrolLogs.length}
            </span>
          </div>

          {guard.patrolLogs.length === 0 ? (
            <p className="text-sm text-brand-400 text-center py-4 bg-brand-50 rounded-xl border border-brand-100">
              No patrol logs yet
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {guard.patrolLogs.map((log, i) => (
                <div key={i} className={`flex items-start justify-between px-3 py-2.5 rounded-xl border
                  ${log.status === 'Alert' ? 'bg-red-50 border-red-100' : 'bg-brand-50 border-brand-100'}`}>
                  <div>
                    <p className="text-sm font-semibold text-brand-900">{log.checkpoint}</p>
                    {log.notes && <p className="text-xs text-brand-400 mt-0.5">{log.notes}</p>}
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                      ${log.status === 'Alert' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                      {log.status}
                    </span>
                    <p className="text-xs text-brand-400 mt-1">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={onClose}
          className="w-full py-2.5 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition">
          Close
        </button>
      </div>
    </Modal>
  )
}

// ── Guard Row ─────────────────────────────────────────────────────────────────
function GuardRow({ guard, index, onView, onToggle }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), index * 70); return () => clearTimeout(t) }, [index])
  const initials = guard.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <tr className={`border-b border-brand-100 hover:bg-brand-50 transition-all duration-300
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>

      {/* Name */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColors[guard.id % avatarColors.length]}`}>
            {initials}
          </div>
          <div>
            <p className="font-semibold text-brand-900 text-sm">{guard.name}</p>
            <p className="text-xs text-brand-400">{guard.phone}</p>
          </div>
        </div>
      </td>

      {/* Shift */}
      <td className="px-5 py-3.5">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${shiftColors[guard.shift]}`}>
          {guard.shift}
        </span>
      </td>

      {/* Gate */}
      <td className="px-5 py-3.5">
        <span className="text-xs font-medium bg-brand-100 text-brand-700 px-2.5 py-1 rounded-lg">
          {guard.assignedGate}
        </span>
      </td>

      {/* Duty status */}
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full
          ${guard.isOnDuty ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${guard.isOnDuty ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
          {guard.isOnDuty ? 'On Duty' : 'Off Duty'}
        </span>
      </td>

      {/* Patrol logs count */}
      <td className="px-5 py-3.5">
        <span className="text-xs font-semibold bg-brand-100 text-brand-700 px-2.5 py-1 rounded-full">
          {guard.patrolLogs.length} logs
        </span>
      </td>

      {/* Status */}
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full
          ${guard.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${guard.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
          {guard.status}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <button onClick={() => onView(guard)} title="View Details"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-100 text-brand-600 hover:bg-brand-200 transition">
            <Eye size={13} />
          </button>
          <button onClick={() => onToggle(guard.id)} title={guard.status === 'Active' ? 'Deactivate' : 'Activate'}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition
              ${guard.status === 'Active' ? 'bg-amber-50 text-amber-500 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100'}`}>
            {guard.status === 'Active' ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminGuards() {
  const [guards, setGuards]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('All')
  const [visible, setVisible] = useState(false)
  const [viewGuard, setViewGuard] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        // GET /api/guards returns GuardProfile[] with populated user
        const { data } = await axiosInstance.get('/guards')
        setGuards(data.map((g, i) => ({
          ...g,
          id:          g._id,
          name:        g.user?.name        || 'Guard',
          email:       g.user?.email       || '—',
          phone:       g.user?.phone       || '—',
          shift:       g.shift             || 'Morning',
          assignedGate:g.assignedGate      || 'Main Gate',
          status:      'Active',
          joined:      new Date(g.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
          patrolLogs:  g.patrolLogs        || [],
        })))
      } catch { setGuards(initialGuards) }
      finally { setLoading(false) }
    }
    load()
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const handleToggle = (id) => setGuards(prev => prev.map(g =>
    (g.id === id || g._id === id) ? { ...g, status: g.status === 'Active' ? 'Inactive' : 'Active' } : g
  ))

  const filtered = guards.filter(g => {
    const m = g.name.toLowerCase().includes(search.toLowerCase()) ||
              g.assignedGate.toLowerCase().includes(search.toLowerCase())
    const f = filter === 'All' || filter === g.shift ||
              (filter === 'On Duty' && g.isOnDuty) ||
              (filter === 'Off Duty' && !g.isOnDuty)
    return m && f
  })

  const counts = {
    total:   guards.length,
    onDuty:  guards.filter(g => g.isOnDuty).length,
    morning: guards.filter(g => g.shift === 'Morning').length,
    evening: guards.filter(g => g.shift === 'Evening').length,
    night:   guards.filter(g => g.shift === 'Night').length,
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">

      {/* Header */}
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
        <h1 className="text-2xl font-extrabold text-brand-950 tracking-tight">Guard Management</h1>
        <p className="text-sm text-brand-400 mt-1">Monitor guard duty, shifts and patrol activity</p>
      </div>

      {/* Stat Cards */}
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        {[
          { label: 'Total Guards', value: counts.total,   gradient: 'from-brand-500 to-brand-700'  },
          { label: 'On Duty Now',  value: counts.onDuty,  gradient: 'from-emerald-400 to-teal-500' },
          { label: 'Morning',      value: counts.morning, gradient: 'from-amber-400 to-orange-500' },
          { label: 'Night',        value: counts.night,   gradient: 'from-indigo-400 to-indigo-600'},
        ].map(s => (
          <div key={s.label}
            className={`relative overflow-hidden rounded-2xl p-4 text-white bg-gradient-to-br ${s.gradient} shadow-md
              hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 cursor-default`}>
            <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-white/10" />
            <p className="text-3xl font-extrabold">{s.value}</p>
            <p className="text-white/70 text-xs font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className={`bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden
        transition-all duration-700 delay-150 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-brand-100">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
            <input type="text" placeholder="Search name or gate..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-brand-50 border border-brand-100 rounded-xl w-full
                         focus:outline-none focus:ring-2 focus:ring-brand-300 transition text-brand-900 placeholder:text-brand-300" />
          </div>
          <div className="flex items-center gap-1 bg-brand-50 border border-brand-100 p-1 rounded-xl">
            {['All', 'On Duty', 'Off Duty', 'Morning', 'Evening', 'Night'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all
                  ${filter === f ? 'bg-brand-600 text-white shadow-sm' : 'text-brand-400 hover:text-brand-700'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-50 border-b border-brand-100">
                {['Guard', 'Shift', 'Gate', 'Duty', 'Patrols', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                    <p className="text-sm text-brand-400">Loading guards...</p>
                  </div>
                </td></tr>
              )}
              {!loading && filtered.map((g, i) => (
                <GuardRow key={g.id || g._id} guard={g} index={i} onView={setViewGuard} onToggle={handleToggle} />
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Shield size={32} className="text-brand-200" />
                    <p className="text-sm text-brand-400">No guards found</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-brand-100 bg-brand-50/60 flex items-center justify-between">
          <p className="text-xs text-brand-400">
            Showing <span className="font-semibold text-brand-600">{filtered.length}</span> of{' '}
            <span className="font-semibold text-brand-600">{guards.length}</span> guards
          </p>
          <div className="flex items-center gap-1.5 text-xs text-brand-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{counts.onDuty} on duty now</span>
          </div>
        </div>
      </div>

      {/* View Detail Modal */}
      <GuardDetailModal
        open={!!viewGuard}
        onClose={() => setViewGuard(null)}
        guard={viewGuard}
      />
    </div>
  )
}

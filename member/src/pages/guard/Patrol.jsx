import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { Search, ClipboardList, CheckCircle2, XCircle, Clock, Plus } from 'lucide-react'

import { setLogs, addLog, updateLog, setLoading } from '../../features/guard/guardSlice'
import * as guardAPI from '../../features/guard/guardAPI'
import LogEntryModal from '../../components/modals/LogEntryModal'

// ── Config ────────────────────────────────────────────────────────────────────
const statusCfg = {
  Approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400', icon: CheckCircle2 },
  Rejected: { bg: 'bg-red-100',     text: 'text-red-600',     dot: 'bg-red-400',     icon: XCircle      },
  Inside:   { bg: 'bg-brand-100',   text: 'text-brand-700',   dot: 'bg-brand-400',   icon: Clock        },
  Pending:  { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400',   icon: Clock        },
}

const avatarColors = ['bg-brand-500','bg-brand-600','bg-brand-400','bg-brand-700','bg-brand-300','bg-brand-800']

// ── Log Row ───────────────────────────────────────────────────────────────────
function LogRow({ log, index }) {
  const [visible, setVisible] = useState(false)
  const cfg = statusCfg[log.status] || statusCfg.Pending
  useEffect(() => { const t = setTimeout(() => setVisible(true), index * 60); return () => clearTimeout(t) }, [index])

  const colorIdx = log._id?.charCodeAt(log._id.length - 1) % avatarColors.length || 0
  const initials = log.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const timeIn  = log.timeIn  ? new Date(log.timeIn).toLocaleTimeString('en-US',  { hour: '2-digit', minute: '2-digit' }) : '—'
  const timeOut = log.timeOut ? new Date(log.timeOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null

  return (
    <tr className={`border-b border-brand-100 hover:bg-brand-50 transition-all duration-300
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColors[colorIdx]}`}>
            {initials}
          </div>
          <p className="font-semibold text-brand-900 text-sm">{log.name}</p>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-xs font-semibold bg-brand-100 text-brand-700 px-2.5 py-1 rounded-lg">{log.flat}</span>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-sm text-brand-700 font-medium">{timeIn}</span>
      </td>
      <td className="px-5 py-3.5">
        {timeOut ? (
          <span className="text-sm text-brand-700 font-medium">{timeOut}</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-brand-400 italic">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" /> Still inside
          </span>
        )}
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {log.status}
        </span>
      </td>
    </tr>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GuardPatrol() {
  const dispatch = useDispatch()
  const { logs, loading } = useSelector(s => s.guard)

  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('All')
  const [visible, setVisible]   = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  // ── Load today's logs ──
  useEffect(() => {
    const load = async () => {
      dispatch(setLoading())
      try {
        const { data } = await guardAPI.fetchEntryLogs()
        dispatch(setLogs(data))
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load logs')
      }
    }
    load()
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [dispatch])

  // ── Add new log via API ──
  const handleAddLog = async (form) => {
    try {
      const { data } = await guardAPI.createEntryLog(form)
      dispatch(addLog(data))
      toast.success('Log entry added')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add log')
    }
  }

  const filtered = logs.filter(l => {
    const m = l.name?.toLowerCase().includes(search.toLowerCase()) ||
              l.flat?.toLowerCase().includes(search.toLowerCase())
    return m && (filter === 'All' || l.status === filter)
  })

  const counts = {
    total:    logs.length,
    inside:   logs.filter(l => l.status === 'Inside').length,
    approved: logs.filter(l => l.status === 'Approved').length,
    rejected: logs.filter(l => l.status === 'Rejected').length,
  }

  const summary = [
    { label: 'Total Entries',     value: counts.total,    gradient: 'from-brand-500 to-brand-700'  },
    { label: 'Currently Inside',  value: counts.inside,   gradient: 'from-brand-400 to-brand-600'  },
    { label: 'Exited',            value: counts.approved, gradient: 'from-emerald-400 to-teal-500' },
    { label: 'Rejected',          value: counts.rejected, gradient: 'from-red-400 to-rose-600'     },
  ]

  return (
    <div className="p-6 space-y-6 min-h-screen">

      {/* Header */}
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-950 tracking-tight">Today's Logs</h1>
            <p className="text-sm text-brand-400 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95
              text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-md shadow-brand-300/30">
            <Plus size={15} /> Add Log Entry
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4
        transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        {summary.map(s => (
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

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-brand-100">
          <div className="flex items-center gap-2">
            <ClipboardList size={16} className="text-brand-500" />
            <span className="text-sm font-bold text-brand-950">Entry Log</span>
            <span className="text-xs bg-brand-100 text-brand-600 font-semibold px-2 py-0.5 rounded-full">
              {logs.length} entries
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
              <input type="text" placeholder="Search name or flat..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm bg-brand-50 border border-brand-100 rounded-xl w-52
                           focus:outline-none focus:ring-2 focus:ring-brand-300 transition text-brand-900 placeholder:text-brand-300" />
            </div>
            <div className="flex items-center gap-1 bg-brand-50 border border-brand-100 p-1 rounded-xl">
              {['All','Inside','Approved','Rejected'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all
                    ${filter === f ? 'bg-brand-600 text-white shadow-sm' : 'text-brand-400 hover:text-brand-700'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-50 border-b border-brand-100">
                {['Visitor Name','Flat No.','Time In','Time Out','Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                    <p className="text-sm text-brand-400">Loading logs...</p>
                  </div>
                </td></tr>
              )}
              {!loading && filtered.map((l, i) => <LogRow key={l._id} log={l} index={i} />)}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <ClipboardList size={30} className="text-brand-200" />
                    <p className="text-sm text-brand-400">No log entries found</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-brand-100 bg-brand-50/60 flex items-center justify-between">
          <p className="text-xs text-brand-400">
            Showing <span className="font-semibold text-brand-600">{filtered.length}</span> of{' '}
            <span className="font-semibold text-brand-600">{logs.length}</span> entries
          </p>
          <span className="flex items-center gap-1 text-xs text-brand-400">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" /> Live
          </span>
        </div>
      </div>

      {/* Add Log Modal */}
      <LogEntryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddLog}
      />
    </div>
  )
}

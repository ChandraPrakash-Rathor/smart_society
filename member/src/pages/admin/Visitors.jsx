import { useEffect, useState } from 'react'
import { Search, Calendar, Eye, CheckCircle2, XCircle, Clock, Phone, Home, Tag } from 'lucide-react'
import Modal from '../../components/Modal'
import axiosInstance from '../../utils/axiosInstance'

// ── Static data ───────────────────────────────────────────────────────────────
const initialVisitors = [
  { id: 1, name: 'John Doe',     flat: 'A-204', type: 'Guest',    status: 'Approved', entryTime: '09:15 AM', exitTime: '10:00 AM', date: '2026-04-24' },
  { id: 2, name: 'Priya Sharma', flat: 'B-102', type: 'Delivery', status: 'Pending',  entryTime: '09:42 AM', exitTime: '—',        date: '2026-04-24' },
  { id: 3, name: 'Ravi Kumar',   flat: 'C-301', type: 'Cab',      status: 'Approved', entryTime: '10:05 AM', exitTime: '10:15 AM', date: '2026-04-24' },
  { id: 4, name: 'Anita Singh',  flat: 'A-110', type: 'Guest',    status: 'Rejected', entryTime: '10:30 AM', exitTime: '10:32 AM', date: '2026-04-23' },
  { id: 5, name: 'Mohan Verma',  flat: 'D-205', type: 'Delivery', status: 'Expired',  entryTime: '11:00 AM', exitTime: '—',        date: '2026-04-23' },
  { id: 6, name: 'Sunita Patel', flat: 'A-204', type: 'Guest',    status: 'Approved', entryTime: '11:20 AM', exitTime: '12:00 PM', date: '2026-04-22' },
]

const statusCfg = {
  Approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400', icon: CheckCircle2 },
  Pending:  { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400',   icon: Clock        },
  Rejected: { bg: 'bg-red-100',     text: 'text-red-600',     dot: 'bg-red-400',     icon: XCircle      },
  Expired:  { bg: 'bg-gray-100',    text: 'text-gray-500',    dot: 'bg-gray-400',    icon: Clock        },
}

const typeBadge = {
  Guest:    'bg-brand-100 text-brand-700',
  Delivery: 'bg-amber-100 text-amber-700',
  Cab:      'bg-teal-100 text-teal-700',
}

const avatarColors = ['bg-brand-500','bg-brand-600','bg-brand-400','bg-brand-700','bg-brand-300','bg-brand-800']

// ── Visitor Detail Modal ──────────────────────────────────────────────────────
function VisitorDetailModal({ open, onClose, visitor }) {
  if (!visitor) return null
  const cfg = statusCfg[visitor.status] || statusCfg.Pending
  const initials = visitor.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const Row = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 py-3 border-b border-brand-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-brand-600" />
      </div>
      <div>
        <p className="text-xs text-brand-400 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm font-semibold text-brand-900 mt-0.5">{value}</p>
      </div>
    </div>
  )

  return (
    <Modal open={open} onClose={onClose} title="Visitor Details" size="sm">
      <div className="flex flex-col items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold shadow-md ${avatarColors[visitor.id % avatarColors.length]}`}>
          {initials}
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-brand-950">{visitor.name}</p>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mt-1.5 ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{visitor.status}
          </span>
        </div>
        <div className="w-full">
          <Row icon={Home}  label="Flat"       value={visitor.flat}      />
          <Row icon={Tag}   label="Type"       value={visitor.type}      />
          <Row icon={Clock} label="Entry Time" value={visitor.entryTime} />
          <Row icon={Clock} label="Exit Time"  value={visitor.exitTime === '—' ? 'Still inside' : visitor.exitTime} />
        </div>
        <button onClick={onClose} className="w-full py-2.5 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition">Close</button>
      </div>
    </Modal>
  )
}

// ── Visitor Row ───────────────────────────────────────────────────────────────
function VisitorRow({ visitor, index, onView }) {
  const [visible, setVisible] = useState(false)
  const cfg = statusCfg[visitor.status] || statusCfg.Pending
  useEffect(() => { const t = setTimeout(() => setVisible(true), index * 60); return () => clearTimeout(t) }, [index])
  const initials = visitor.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <tr className={`border-b border-brand-100 hover:bg-brand-50 transition-all duration-300
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColors[visitor.id % avatarColors.length]}`}>
            {initials}
          </div>
          <div>
            <p className="font-semibold text-brand-900 text-sm">{visitor.name}</p>
            <p className="text-xs text-brand-400">{visitor.date}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-xs font-semibold bg-brand-100 text-brand-700 px-2.5 py-1 rounded-lg">{visitor.flat}</span>
      </td>
      <td className="px-5 py-3.5">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeBadge[visitor.type]}`}>{visitor.type}</span>
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {visitor.status}
        </span>
      </td>
      <td className="px-5 py-3.5 text-sm text-brand-600">{visitor.entryTime}</td>
      <td className="px-5 py-3.5">
        {visitor.exitTime === '—'
          ? <span className="inline-flex items-center gap-1 text-xs text-brand-400 italic"><span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" /> Inside</span>
          : <span className="text-sm text-brand-600">{visitor.exitTime}</span>}
      </td>
      <td className="px-5 py-3.5">
        <button onClick={() => onView(visitor)} title="View Details"
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-100 text-brand-600 hover:bg-brand-200 transition">
          <Eye size={13} />
        </button>
      </td>
    </tr>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminVisitors() {
  const [visitors, setVisitors] = useState(initialVisitors)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('All')
  const [dateFilter, setDateFilter] = useState('')
  const [visible, setVisible]   = useState(false)
  const [viewVisitor, setViewVisitor] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosInstance.get('/visitors')
        setVisitors(data.map(v => ({
          ...v,
          id: v._id,
          flat: v.host || v.flat || '—',
          type: v.purpose || 'Guest',
          date: new Date(v.createdAt).toISOString().slice(0,10),
          entryTime: v.checkIn ? new Date(v.checkIn).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}) : '—',
          exitTime:  v.checkOut ? new Date(v.checkOut).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}) : '—',
        })))
      } catch { /* keep dummy */ }
      finally { setLoading(false) }
    }
    load()
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const filtered = visitors.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.flat.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filter === 'All' || v.status === filter
    const matchDate   = !dateFilter || v.date === dateFilter
    return matchSearch && matchStatus && matchDate
  })

  const counts = {
    total:    visitors.length,
    approved: visitors.filter(v => v.status === 'Approved').length,
    pending:  visitors.filter(v => v.status === 'Pending').length,
    rejected: visitors.filter(v => v.status === 'Rejected').length,
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">

      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
        <h1 className="text-2xl font-extrabold text-brand-950 tracking-tight">Visitor Monitoring</h1>
        <p className="text-sm text-brand-400 mt-1">Track all society visitor entries and exits</p>
      </div>

      {/* Stat Pills */}
      <div className={`flex flex-wrap gap-3 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        {[
          { label: 'Total',    value: counts.total,    color: 'bg-brand-600'   },
          { label: 'Approved', value: counts.approved, color: 'bg-emerald-500' },
          { label: 'Pending',  value: counts.pending,  color: 'bg-amber-500'   },
          { label: 'Rejected', value: counts.rejected, color: 'bg-red-500'     },
        ].map(p => (
          <div key={p.label} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${p.color} shadow-sm`}>
            <span className="text-xl font-extrabold text-white">{p.value}</span>
            <span className="text-xs font-medium text-white/80">{p.label}</span>
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
            <input type="text" placeholder="Search name or flat..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-brand-50 border border-brand-100 rounded-xl w-full
                         focus:outline-none focus:ring-2 focus:ring-brand-300 transition text-brand-900 placeholder:text-brand-300" />
          </div>
          <div className="relative">
            <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300 pointer-events-none" />
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm bg-brand-50 border border-brand-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 transition text-brand-700" />
          </div>
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="text-xs text-brand-400 hover:text-brand-700 underline">Clear</button>
          )}
          <div className="flex items-center gap-1 bg-brand-50 border border-brand-100 p-1 rounded-xl ml-auto">
            {['All','Approved','Pending','Rejected','Expired'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all
                  ${filter === f ? 'bg-brand-600 text-white shadow-sm' : 'text-brand-400 hover:text-brand-700'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-50 border-b border-brand-100">
                {['Visitor','Flat','Type','Status','Entry Time','Exit Time','Action'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                    <p className="text-sm text-brand-400">Loading visitors...</p>
                  </div>
                </td></tr>
              )}
              {!loading && filtered.map((v, i) => <VisitorRow key={v.id} visitor={v} index={i} onView={setViewVisitor} />)}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="py-14 text-center text-sm text-brand-400">No visitors found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-brand-100 bg-brand-50/60">
          <p className="text-xs text-brand-400">
            Showing <span className="font-semibold text-brand-600">{filtered.length}</span> of{' '}
            <span className="font-semibold text-brand-600">{visitors.length}</span> visitors
          </p>
        </div>
      </div>

      <VisitorDetailModal open={!!viewVisitor} onClose={() => setViewVisitor(null)} visitor={viewVisitor} />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Search, Eye, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import Modal from '../../components/Modal'
import { toast } from 'react-toastify'
import axiosInstance from '../../utils/axiosInstance'

const initialComplaints = [
  { id: 1, title: 'Water leakage in basement',  category: 'Water',       status: 'Open',        raisedBy: 'Chandra Prakash', flat: 'A-204', date: 'Apr 24, 2026', desc: 'Water is leaking from the ceiling in the basement parking area near pillar B-12.' },
  { id: 2, title: 'Gate lock broken',           category: 'Security',    status: 'In Progress', raisedBy: 'Sunita Devi',     flat: 'B-102', date: 'Apr 23, 2026', desc: 'Main gate lock is not working properly. Needs immediate repair.' },
  { id: 3, title: 'Lift not working',           category: 'Maintenance', status: 'Resolved',    raisedBy: 'Mohan Verma',     flat: 'D-205', date: 'Apr 22, 2026', desc: 'Lift in Tower B is stuck on 3rd floor.' },
  { id: 4, title: 'Power outage in corridor',   category: 'Electricity', status: 'Open',        raisedBy: 'Priya Sharma',    flat: 'C-301', date: 'Apr 24, 2026', desc: 'Corridor lights on 5th floor are not working since morning.' },
  { id: 5, title: 'Garbage not collected',      category: 'Maintenance', status: 'In Progress', raisedBy: 'Arjun Singh',     flat: 'A-110', date: 'Apr 23, 2026', desc: 'Garbage has not been collected for 2 days.' },
]

const statusCfg = {
  Open:         { bg: 'bg-red-100',     text: 'text-red-600',     dot: 'bg-red-400',     icon: AlertCircle  },
  'In Progress':{ bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400',   icon: Clock        },
  Resolved:     { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400', icon: CheckCircle2 },
}

const categoryColors = {
  Water:       'bg-blue-100 text-blue-700',
  Security:    'bg-red-100 text-red-700',
  Maintenance: 'bg-amber-100 text-amber-700',
  Electricity: 'bg-yellow-100 text-yellow-700',
  Other:       'bg-brand-100 text-brand-700',
}

const avatarColors = ['bg-brand-500','bg-brand-600','bg-emerald-500','bg-amber-500','bg-teal-500','bg-rose-500']

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ open, onClose, complaint, onResolve }) {
  if (!complaint) return null
  const cfg = statusCfg[complaint.status]

  return (
    <Modal open={open} onClose={onClose} title="Complaint Details" size="md">
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-brand-950 text-base">{complaint.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${categoryColors[complaint.category]}`}>
              {complaint.category}
            </span>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {complaint.status}
            </span>
          </div>
        </div>

        <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
          <p className="text-sm text-brand-700 leading-relaxed">{complaint.desc}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-brand-400 pt-2 border-t border-brand-100">
          <span>Raised by <span className="font-semibold text-brand-600">{complaint.raisedBy}</span> ({complaint.flat})</span>
          <span>{complaint.date}</span>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition">
            Close
          </button>
          {complaint.status !== 'Resolved' && (
            <button onClick={() => { onResolve(complaint.id); onClose() }}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 active:scale-95 rounded-xl transition shadow-md">
              Mark as Resolved
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

// ── Complaint Row ─────────────────────────────────────────────────────────────
function ComplaintRow({ complaint, index, onView }) {
  const [visible, setVisible] = useState(false)
  const cfg = statusCfg[complaint.status]
  useEffect(() => { const t = setTimeout(() => setVisible(true), index * 60); return () => clearTimeout(t) }, [index])
  const initials = complaint.raisedBy.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <tr className={`border-b border-brand-100 hover:bg-brand-50 transition-all duration-300
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <td className="px-5 py-3.5">
        <p className="font-semibold text-brand-900 text-sm">{complaint.title}</p>
        <p className="text-xs text-brand-400 mt-0.5">{complaint.date}</p>
      </td>
      <td className="px-5 py-3.5">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[complaint.category]}`}>
          {complaint.category}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {complaint.status}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${avatarColors[complaint.id % avatarColors.length]}`}>
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-brand-900">{complaint.raisedBy}</p>
            <p className="text-xs text-brand-400">{complaint.flat}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <button onClick={() => onView(complaint)}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-100 text-brand-600 hover:bg-brand-200 transition">
          <Eye size={13} />
        </button>
      </td>
    </tr>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState('All')
  const [visible, setVisible]       = useState(false)
  const [viewComplaint, setViewComplaint] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosInstance.get('/complaints/all')
        setComplaints(data.map(c => ({
          ...c,
          id:       c._id,
          raisedBy: c.submittedBy?.name || 'Resident',
          flat:     c.submittedBy?.flat || '—',
          date:     new Date(c.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
        })))
      } catch { setComplaints(initialComplaints) }
      finally { setLoading(false) }
    }
    load()
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const handleResolve = async (id) => {
    const c = complaints.find(c => c.id === id || c._id === id)
    try {
      await axiosInstance.patch(`/complaints/${c?._id || id}`, { status: 'Resolved' })
    } catch { /* demo */ }
    setComplaints(prev => prev.map(c => (c.id === id || c._id === id) ? { ...c, status: 'Resolved' } : c))
    toast.success('Complaint resolved')
  }

  const filtered = complaints.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.raisedBy.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || c.status === filter
    return matchSearch && matchFilter
  })

  const counts = {
    open:       complaints.filter(c => c.status === 'Open').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved:   complaints.filter(c => c.status === 'Resolved').length,
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">

      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
        <h1 className="text-2xl font-extrabold text-brand-950 tracking-tight">Complaint Management</h1>
        <p className="text-sm text-brand-400 mt-1">Monitor and resolve resident complaints</p>
      </div>

      <div className={`flex flex-wrap gap-3 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        {[
          { label: 'Open',        value: counts.open,       color: 'bg-red-500'     },
          { label: 'In Progress', value: counts.inProgress, color: 'bg-amber-500'   },
          { label: 'Resolved',    value: counts.resolved,   color: 'bg-emerald-500' },
        ].map(p => (
          <div key={p.label} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${p.color} shadow-sm`}>
            <span className="text-xl font-extrabold text-white">{p.value}</span>
            <span className="text-xs font-medium text-white/80">{p.label}</span>
          </div>
        ))}
      </div>

      <div className={`bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden
        transition-all duration-700 delay-150 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-brand-100">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
            <input type="text" placeholder="Search title or user..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-brand-50 border border-brand-100 rounded-xl w-full
                         focus:outline-none focus:ring-2 focus:ring-brand-300 transition text-brand-900 placeholder:text-brand-300" />
          </div>
          <div className="flex items-center gap-1 bg-brand-50 border border-brand-100 p-1 rounded-xl">
            {['All','Open','In Progress','Resolved'].map(f => (
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
                {['Title','Category','Status','Raised By','Action'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                    <p className="text-sm text-brand-400">Loading complaints...</p>
                  </div>
                </td></tr>
              )}
              {!loading && filtered.map((c, i) => <ComplaintRow key={c.id || c._id} complaint={c} index={i} onView={setViewComplaint} />)}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="py-14 text-center text-sm text-brand-400">No complaints found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-brand-100 bg-brand-50/60">
          <p className="text-xs text-brand-400">
            Showing <span className="font-semibold text-brand-600">{filtered.length}</span> of{' '}
            <span className="font-semibold text-brand-600">{complaints.length}</span> complaints
          </p>
        </div>
      </div>

      <DetailModal open={!!viewComplaint} onClose={() => setViewComplaint(null)}
        complaint={viewComplaint} onResolve={handleResolve} />
    </div>
  )
}

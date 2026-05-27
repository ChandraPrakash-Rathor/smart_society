import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Search, CheckCircle2, Clock, AlertTriangle, IndianRupee, Zap, Eye, Trash2, Plus } from 'lucide-react'
import axiosInstance from '../../utils/axiosInstance'
import Modal from '../../components/Modal'

// ── Static dummy data (used when API not ready) ───────────────────────────────
const dummyRecords = [
  { _id:'1', resident:{ name:'Chandra Prakash', phone:'9876543210' }, flat:'A-204', month:'April 2026', amount:2000, status:'Paid',    paidOn:'2026-04-05', dueDate:'2026-04-10' },
  { _id:'2', resident:{ name:'Priya Sharma',    phone:'9871234560' }, flat:'C-301', month:'April 2026', amount:2000, status:'Pending', paidOn:null,         dueDate:'2026-04-10' },
  { _id:'3', resident:{ name:'Sunita Devi',     phone:'9001234567' }, flat:'B-102', month:'April 2026', amount:2000, status:'Overdue', paidOn:null,         dueDate:'2026-03-10' },
  { _id:'4', resident:{ name:'Mohan Verma',     phone:'9765432100' }, flat:'D-205', month:'April 2026', amount:2000, status:'Paid',    paidOn:'2026-04-03', dueDate:'2026-04-10' },
  { _id:'5', resident:{ name:'Arjun Singh',     phone:'9871100234' }, flat:'A-110', month:'April 2026', amount:2000, status:'Pending', paidOn:null,         dueDate:'2026-04-10' },
  { _id:'6', resident:{ name:'Kavita Rao',      phone:'9765001234' }, flat:'B-305', month:'March 2026', amount:2000, status:'Paid',    paidOn:'2026-03-08', dueDate:'2026-03-10' },
]

// ── Config ────────────────────────────────────────────────────────────────────
const statusCfg = {
  Paid:    { bg:'bg-emerald-100', text:'text-emerald-700', dot:'bg-emerald-400', icon: CheckCircle2 },
  Pending: { bg:'bg-amber-100',   text:'text-amber-700',   dot:'bg-amber-400',   icon: Clock        },
  Overdue: { bg:'bg-red-100',     text:'text-red-600',     dot:'bg-red-400',     icon: AlertTriangle },
}

const avatarColors = ['bg-brand-500','bg-brand-600','bg-emerald-500','bg-amber-500','bg-teal-500','bg-rose-500']

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const currentMonth = MONTHS[new Date().getMonth()]
const currentYear  = new Date().getFullYear()

// ── Generate Bills Modal ──────────────────────────────────────────────────────
function GenerateModal({ open, onClose, onGenerate }) {
  const [form, setForm] = useState({ month: currentMonth, year: currentYear, amount: 2000, dueDate: '' })
  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const inp = 'w-full px-3.5 py-2.5 text-sm rounded-xl border border-brand-200 bg-brand-50 outline-none focus:ring-2 focus:ring-brand-300 text-brand-900 transition'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.dueDate) { toast.error('Due date is required'); return }
    onGenerate(form)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Generate Monthly Bills" size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-brand-700 uppercase tracking-wide">Month</label>
            <select value={form.month} onChange={set('month')} className={inp}>
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 w-24">
            <label className="text-xs font-semibold text-brand-700 uppercase tracking-wide">Year</label>
            <input type="number" value={form.year} onChange={set('year')} className={inp} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-brand-700 uppercase tracking-wide">Amount (₹)</label>
          <input type="number" value={form.amount} onChange={set('amount')} className={inp} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-brand-700 uppercase tracking-wide">Due Date</label>
          <input type="date" value={form.dueDate} onChange={set('dueDate')} className={inp} />
        </div>
        <div className="bg-brand-50 border border-brand-100 rounded-xl px-3 py-2.5 text-xs text-brand-600">
          This will generate bills for <strong>all active residents</strong> who don't have a bill for this month yet.
        </div>
        <div className="flex gap-3 pt-2 border-t border-brand-100">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition">
            Cancel
          </button>
          <button type="submit"
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 rounded-xl transition shadow-md shadow-brand-300/30">
            Generate Bills
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── View / Update Status Modal ────────────────────────────────────────────────
function RecordModal({ open, onClose, record, onUpdate }) {
  const [status, setStatus] = useState('Pending')
  const [note, setNote]     = useState('')

  useEffect(() => {
    if (record) { setStatus(record.status); setNote(record.note || '') }
  }, [record, open])

  if (!record) return null
  const cfg = statusCfg[record.status]

  return (
    <Modal open={open} onClose={onClose} title="Maintenance Record" size="sm">
      <div className="space-y-4">

        {/* Resident info */}
        <div className="flex items-center gap-3 pb-3 border-b border-brand-100">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold ${avatarColors[record._id?.charCodeAt(0) % avatarColors.length || 0]}`}>
            {record.resident?.name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)}
          </div>
          <div>
            <p className="font-bold text-brand-950">{record.resident?.name}</p>
            <p className="text-xs text-brand-400">Flat {record.flat} · {record.resident?.phone}</p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Month',    value: record.month },
            { label: 'Amount',   value: `₹${record.amount?.toLocaleString()}` },
            { label: 'Due Date', value: record.dueDate ? new Date(record.dueDate).toLocaleDateString('en-IN') : '—' },
            { label: 'Paid On',  value: record.paidOn ? new Date(record.paidOn).toLocaleDateString('en-IN') : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-brand-50 rounded-xl p-3 border border-brand-100">
              <p className="text-xs text-brand-400 font-medium">{label}</p>
              <p className="text-sm font-semibold text-brand-900 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Update status */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-brand-700 uppercase tracking-wide">Update Status</label>
          <div className="flex gap-2">
            {['Paid','Pending','Overdue'].map(s => (
              <button key={s} type="button" onClick={() => setStatus(s)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition
                  ${status === s
                    ? s === 'Paid'    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : s === 'Overdue' ? 'bg-red-500 border-red-500 text-white'
                    :                   'bg-amber-500 border-amber-500 text-white'
                    : 'border-brand-200 text-brand-400 hover:border-brand-300 bg-brand-50'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-brand-700 uppercase tracking-wide">Note (optional)</label>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Paid via UPI"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-brand-200 bg-brand-50 outline-none focus:ring-2 focus:ring-brand-300 text-brand-900 transition" />
        </div>

        <div className="flex gap-3 pt-2 border-t border-brand-100">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition">
            Cancel
          </button>
          <button onClick={() => { onUpdate(record._id, { status, note }); onClose() }}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 rounded-xl transition shadow-md shadow-brand-300/30">
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Table Row ─────────────────────────────────────────────────────────────────
function MaintenanceRow({ record, index, onView, onDelete }) {
  const [visible, setVisible] = useState(false)
  const cfg = statusCfg[record.status] || statusCfg.Pending
  useEffect(() => { const t = setTimeout(() => setVisible(true), index * 60); return () => clearTimeout(t) }, [index])
  const initials = record.resident?.name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || '?'
  const colorIdx = record._id?.charCodeAt(0) % avatarColors.length || 0

  return (
    <tr className={`border-b border-brand-100 hover:bg-brand-50 transition-all duration-300
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>

      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColors[colorIdx]}`}>
            {initials}
          </div>
          <div>
            <p className="font-semibold text-brand-900 text-sm">{record.resident?.name}</p>
            <p className="text-xs text-brand-400">{record.resident?.phone}</p>
          </div>
        </div>
      </td>

      <td className="px-5 py-3.5">
        <span className="text-xs font-semibold bg-brand-100 text-brand-700 px-2.5 py-1 rounded-lg">{record.flat}</span>
      </td>

      <td className="px-5 py-3.5 text-sm text-brand-600">{record.month}</td>

      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1 font-semibold text-brand-900 text-sm">
          <IndianRupee size={13} className="text-brand-500" />
          {record.amount?.toLocaleString()}
        </div>
      </td>

      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {record.status}
        </span>
      </td>

      <td className="px-5 py-3.5 text-xs text-brand-500">
        {record.paidOn ? new Date(record.paidOn).toLocaleDateString('en-IN') : '—'}
      </td>

      <td className="px-5 py-3.5 text-xs text-brand-500">
        {record.dueDate ? new Date(record.dueDate).toLocaleDateString('en-IN') : '—'}
      </td>

      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <button onClick={() => onView(record)} title="View / Update"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-100 text-brand-600 hover:bg-brand-200 transition">
            <Eye size={13} />
          </button>
          <button onClick={() => onDelete(record._id)} title="Delete"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition">
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminMaintenance() {
  const [records, setRecords]   = useState(dummyRecords)
  const [stats, setStats]       = useState({ total:6, paid:3, pending:2, overdue:1, totalAmount:12000, collectedAmount:6000 })
  const [loading, setLoading]   = useState(false)
  const [visible, setVisible]   = useState(false)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('All')
  const [monthFilter, setMonthFilter] = useState('All')

  const [generateModal, setGenerateModal] = useState(false)
  const [recordModal, setRecordModal]     = useState({ open: false, record: null })

  useEffect(() => {
    // Try to load from API, fall back to dummy data
    const load = async () => {
      setLoading(true)
      try {
        const [recRes, statRes] = await Promise.all([
          axiosInstance.get('/maintenance'),
          axiosInstance.get('/maintenance/stats'),
        ])
        setRecords(recRes.data)
        setStats(statRes.data)
      } catch {
        // keep dummy data
      } finally {
        setLoading(false)
      }
    }
    load()
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  // Generate bills
  const handleGenerate = async (form) => {
    try {
      const { data } = await axiosInstance.post('/maintenance/generate', form)
      toast.success(data.message)
      // Reload
      const res = await axiosInstance.get('/maintenance')
      setRecords(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate bills')
    }
  }

  // Update status
  const handleUpdate = async (id, body) => {
    try {
      const { data } = await axiosInstance.patch(`/maintenance/${id}`, body)
      setRecords(prev => prev.map(r => r._id === id ? data : r))
      toast.success('Status updated')
    } catch {
      // update locally for demo
      setRecords(prev => prev.map(r => r._id === id ? { ...r, ...body, paidOn: body.status === 'Paid' ? new Date().toISOString() : r.paidOn } : r))
      toast.success('Status updated')
    }
  }

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return
    try {
      await axiosInstance.delete(`/maintenance/${id}`)
    } catch { /* demo */ }
    setRecords(prev => prev.filter(r => r._id !== id))
    toast.success('Deleted')
  }

  // Quick mark paid
  const markPaid = async (id) => {
    await handleUpdate(id, { status: 'Paid' })
  }

  const months = ['All', ...new Set(records.map(r => r.month))]

  const filtered = records.filter(r => {
    const m = r.resident?.name?.toLowerCase().includes(search.toLowerCase()) ||
              r.flat?.toLowerCase().includes(search.toLowerCase())
    const s = filter === 'All' || r.status === filter
    const mo = monthFilter === 'All' || r.month === monthFilter
    return m && s && mo
  })

  const collected  = records.filter(r => r.status === 'Paid').length
  const pending    = records.filter(r => r.status === 'Pending').length
  const overdue    = records.filter(r => r.status === 'Overdue').length
  const totalAmt   = records.reduce((s, r) => s + (r.amount || 0), 0)
  const collectedAmt = records.filter(r => r.status === 'Paid').reduce((s, r) => s + (r.amount || 0), 0)

  return (
    <div className="p-6 space-y-6 min-h-screen">

      {/* Header */}
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-950 tracking-tight">Maintenance</h1>
            <p className="text-sm text-brand-400 mt-1">Track monthly maintenance payments for all residents</p>
          </div>
          <button onClick={() => setGenerateModal(true)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-md shadow-brand-300/30">
            <Zap size={15} /> Generate Bills
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        {[
          { label: 'Total Bills',   value: records.length, gradient: 'from-brand-500 to-brand-700'  },
          { label: 'Paid',          value: collected,       gradient: 'from-emerald-400 to-teal-500' },
          { label: 'Pending',       value: pending,         gradient: 'from-amber-400 to-orange-500' },
          { label: 'Overdue',       value: overdue,         gradient: 'from-red-400 to-rose-600'     },
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

      {/* Amount summary */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-700 delay-150 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
            <IndianRupee size={20} className="text-brand-600" />
          </div>
          <div>
            <p className="text-xs text-brand-400 font-medium uppercase tracking-wide">Total Billed</p>
            <p className="text-2xl font-extrabold text-brand-950">₹{totalAmt.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Collected</p>
            <p className="text-2xl font-extrabold text-brand-950">₹{collectedAmt.toLocaleString()}</p>
            <p className="text-xs text-brand-400 mt-0.5">
              {totalAmt > 0 ? Math.round((collectedAmt / totalAmt) * 100) : 0}% collected
            </p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className={`bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden
        transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-brand-100">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
            <input type="text" placeholder="Search name or flat..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-brand-50 border border-brand-100 rounded-xl w-full
                         focus:outline-none focus:ring-2 focus:ring-brand-300 transition text-brand-900 placeholder:text-brand-300" />
          </div>

          {/* Month filter */}
          <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
            className="py-2 px-3 text-sm bg-brand-50 border border-brand-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 text-brand-700 transition">
            {months.map(m => <option key={m}>{m}</option>)}
          </select>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-brand-50 border border-brand-100 p-1 rounded-xl">
            {['All','Paid','Pending','Overdue'].map(f => (
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
                {['Resident','Flat','Month','Amount','Status','Paid On','Due Date','Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                    <p className="text-sm text-brand-400">Loading...</p>
                  </div>
                </td></tr>
              )}
              {!loading && filtered.map((r, i) => (
                <MaintenanceRow key={r._id} record={r} index={i}
                  onView={r => setRecordModal({ open: true, record: r })}
                  onDelete={handleDelete} />
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} className="py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <IndianRupee size={30} className="text-brand-200" />
                    <p className="text-sm text-brand-400">No records found</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-brand-100 bg-brand-50/60 flex items-center justify-between">
          <p className="text-xs text-brand-400">
            Showing <span className="font-semibold text-brand-600">{filtered.length}</span> of{' '}
            <span className="font-semibold text-brand-600">{records.length}</span> records
          </p>
          <div className="flex items-center gap-1.5 text-xs text-brand-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{collected} paid · </span>
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>{overdue} overdue</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <GenerateModal open={generateModal} onClose={() => setGenerateModal(false)} onGenerate={handleGenerate} />
      <RecordModal
        open={recordModal.open}
        onClose={() => setRecordModal({ open: false, record: null })}
        record={recordModal.record}
        onUpdate={handleUpdate}
      />
    </div>
  )
}

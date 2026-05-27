import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { Search, CheckCircle2, XCircle, ShieldCheck, UserSearch, Eye, QrCode, LogIn, LogOut, CalendarClock } from 'lucide-react'
import Select from 'react-select'

import { setVisitors, updateVisitor, setLoading, setError } from '../../features/guard/guardSlice'
import * as guardAPI from '../../features/guard/guardAPI'
import ConfirmModal       from '../../components/modals/ConfirmModal'
import VisitorDetailModal from '../../components/modals/VisitorDetailModal'
import Modal from '../../components/Modal'
import QRScanner from '../../components/QRScanner'

// ── Config ────────────────────────────────────────────────────────────────────
const statusCfg = {
  Approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  Pending:  { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400'   },
  Rejected: { bg: 'bg-red-100',     text: 'text-red-600',     dot: 'bg-red-400'     },
}

const avatarColors = ['bg-brand-500','bg-brand-600','bg-brand-400','bg-brand-700','bg-brand-300']

const flatOptions = [
  { value: 'A-101', label: 'A-101' }, { value: 'A-204', label: 'A-204' },
  { value: 'B-102', label: 'B-102' }, { value: 'C-301', label: 'C-301' },
  { value: 'D-205', label: 'D-205' }, { value: 'A-110', label: 'A-110' },
]

const selectStyles = {
  control: (base, state) => ({
    ...base, borderRadius: '0.75rem',
    borderColor: state.isFocused ? '#a795f0' : '#c5bcf6',
    backgroundColor: '#f5f4fe',
    boxShadow: state.isFocused ? '0 0 0 2px #c5bcf6' : 'none',
    padding: '1px 2px', fontSize: '0.875rem',
    '&:hover': { borderColor: '#a795f0' },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#784add' : state.isFocused ? '#edebfc' : 'white',
    color: state.isSelected ? 'white' : '#2c185d',
    fontSize: '0.875rem', borderRadius: '0.5rem', cursor: 'pointer',
  }),
  singleValue: (base) => ({ ...base, color: '#2c185d' }),
  placeholder: (base) => ({ ...base, color: '#c5bcf6' }),
  menu: (base) => ({ ...base, borderRadius: '0.75rem', overflow: 'hidden', zIndex: 99 }),
  menuList: (base) => ({ ...base, padding: '4px' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base, state) => ({
    ...base, color: state.isFocused ? '#784add' : '#a795f0',
    transition: 'transform 0.2s',
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
  }),
}

// ── Table Row ─────────────────────────────────────────────────────────────────
const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

const extractVisitorId = (data) => {
  if (data?.id) return data.id
  if (data?._id) return data._id
  const raw = data?.name || data?.text || data?.url
  if (!raw) return null
  const match = String(raw).match(/\/qr\/([a-f\d]{24}|[^/?#]+)/i)
  return match?.[1] || null
}

function EntryRow({ visitor, index, onApprove, onReject, onView, onEntry, onExit }) {
  const [visible, setVisible] = useState(false)
  const cfg = statusCfg[visitor.status] || statusCfg.Pending
  useEffect(() => { const t = setTimeout(() => setVisible(true), index * 70); return () => clearTimeout(t) }, [index])

  const colorIdx = visitor._id?.charCodeAt(visitor._id.length - 1) % avatarColors.length || 0
  const initials = visitor.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <tr className={`border-b border-brand-100 hover:bg-brand-50 transition-all duration-300
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColors[colorIdx]}`}>
            {initials}
          </div>
          <div>
            <p className="font-semibold text-brand-900 text-sm">{visitor.name}</p>
            <p className="text-xs text-brand-400">{visitor.phone}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-xs font-semibold bg-brand-100 text-brand-700 px-2.5 py-1 rounded-lg">
          {visitor.host || visitor.flat || '—'}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {visitor.status}
        </span>
      </td>
      <td className="px-5 py-3.5 text-xs text-brand-500">
        <div className="flex items-center gap-1.5">
          <CalendarClock size={12} className="text-brand-300" />
          <span>{formatDateTime(visitor.checkIn)}</span>
        </div>
      </td>
      <td className="px-5 py-3.5 text-xs text-brand-500">
        {visitor.checkOut ? formatDateTime(visitor.checkOut) : (
          <span className={visitor.checkIn ? 'text-brand-400 italic' : 'text-brand-300'}>{visitor.checkIn ? 'Inside' : '—'}</span>
        )}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => onView(visitor)} title="View"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-100 text-brand-600 hover:bg-brand-200 transition">
            <Eye size={13} />
          </button>
          {visitor.status === 'Pending' ? (
            <>
              <button onClick={() => onApprove(visitor)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-lg transition shadow-sm">
                <CheckCircle2 size={13} /> Allow
              </button>
              <button onClick={() => onReject(visitor)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-lg transition shadow-sm">
                <XCircle size={13} /> Reject
              </button>
            </>
          ) : (
            <span className="text-xs text-brand-300 italic">
              {visitor.status === 'Approved' ? 'Entry allowed' : 'Entry denied'}
            </span>
          )}
          {visitor.status !== 'Rejected' && !visitor.checkIn && (
            <button onClick={() => onEntry(visitor)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 active:scale-95 text-white rounded-lg transition shadow-sm">
              <LogIn size={13} /> Entry
            </button>
          )}
          {visitor.checkIn && !visitor.checkOut && (
            <button onClick={() => onExit(visitor)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-600 hover:bg-slate-700 active:scale-95 text-white rounded-lg transition shadow-sm">
              <LogOut size={13} /> Exit
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GuardVisitors() {
  const dispatch = useDispatch()
  const { visitors, loading } = useSelector(s => s.guard)

  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('All')
  const [visible, setVisible] = useState(false)

  // Verify form
  const [form, setForm]               = useState({ name: '', phone: '', flat: null })
  const [verifyResult, setVerifyResult] = useState(null)

  // Modals
  const [confirmModal, setConfirmModal] = useState({ open: false, type: 'approve', visitor: null })
  const [detailModal,  setDetailModal]  = useState({ open: false, visitor: null })
  const [qrOpen, setQrOpen]             = useState(false)
  const [qrResult, setQrResult]         = useState(null)

  // ── Load ALL visitors ──
  useEffect(() => {
    const load = async () => {
      dispatch(setLoading())
      try {
        const { data } = await guardAPI.fetchPendingVisitors()
        dispatch(setVisitors(data))
      } catch (err) {
        dispatch(setError(err.response?.data?.message || 'Failed to load visitors'))
        toast.error(err.response?.data?.message || 'Failed to load visitors')
      }
    }
    load()
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [dispatch])

  // ── Verify ──
  const handleVerify = (e) => {
    e.preventDefault()
    const found = visitors.find(v =>
      v.name?.toLowerCase().includes(form.name.toLowerCase()) ||
      v.phone?.includes(form.phone)
    )
    setVerifyResult(found || 'not_found')
  }

  // ── Approve / Reject via API ──
  const handleApprove = async () => {
    try {
      const { data } = await guardAPI.approveVisitor(confirmModal.visitor._id)
      dispatch(updateVisitor(data))
      toast.success('Visitor approved')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve')
    }
  }

  const handleReject = async () => {
    try {
      const { data } = await guardAPI.rejectVisitor(confirmModal.visitor._id)
      dispatch(updateVisitor(data))
      toast.success('Visitor rejected')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject')
    }
  }

  const handleEntry = async (visitor, source = 'manual') => {
    try {
      const { data } = await guardAPI.markVisitorEntry(visitor._id)
      dispatch(updateVisitor(data.visitor))
      const entryTime = formatDateTime(data.visitor.checkIn)
      toast.success(`${data.visitor.name} entry recorded at ${entryTime}`)
      return data.visitor
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to record entry'
      source === 'qr' ? toast.error(`QR scanned, but ${msg}`) : toast.error(msg)
      throw err
    }
  }

  const handleExit = async (visitor) => {
    try {
      const { data } = await guardAPI.markVisitorExit(visitor._id)
      dispatch(updateVisitor(data.visitor))
      toast.success(`${data.visitor.name} exit recorded at ${formatDateTime(data.visitor.checkOut)}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record exit')
    }
  }

  const filtered = visitors.filter(v => {
    const m = v.name?.toLowerCase().includes(search.toLowerCase()) ||
              v.host?.toLowerCase().includes(search.toLowerCase()) ||
              v.flat?.toLowerCase().includes(search.toLowerCase()) ||
              v.phone?.includes(search)
    return m && (filter === 'All' || v.status === filter)
  })

  const counts = {
    total:    visitors.length,
    pending:  visitors.filter(v => v.status === 'Pending').length,
    approved: visitors.filter(v => v.status === 'Approved').length,
    rejected: visitors.filter(v => v.status === 'Rejected').length,
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">

      {/* Header */}
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-950 tracking-tight">Visitor Entry</h1>
            <p className="text-sm text-brand-400 mt-1">Verify and manage visitor access at the gate</p>
          </div>
          {/* QR Scan button */}
          <button onClick={() => { setQrResult(null); setQrOpen(true) }}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-md shadow-emerald-200/40">
            <QrCode size={16} /> Scan QR
          </button>
        </div>
      </div>

      {/* Verify Form */}
      <div className={`bg-white rounded-2xl border border-brand-100 shadow-sm p-5
        transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <h2 className="text-sm font-bold text-brand-950 mb-4 flex items-center gap-2">
          <UserSearch size={16} className="text-brand-500" /> Check / Verify Visitor
        </h2>
        <form onSubmit={handleVerify} className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 flex-1 min-w-40">
            <label className="text-xs font-semibold text-brand-700 uppercase tracking-wide">Visitor Name</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. John Doe"
              className="px-3.5 py-2.5 text-sm rounded-xl border border-brand-200 bg-brand-50
                         focus:outline-none focus:ring-2 focus:ring-brand-300 text-brand-900 placeholder:text-brand-300 transition" />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-40">
            <label className="text-xs font-semibold text-brand-700 uppercase tracking-wide">Phone Number</label>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="10-digit number"
              className="px-3.5 py-2.5 text-sm rounded-xl border border-brand-200 bg-brand-50
                         focus:outline-none focus:ring-2 focus:ring-brand-300 text-brand-900 placeholder:text-brand-300 transition" />
          </div>
          <div className="flex flex-col gap-1 w-40">
            <label className="text-xs font-semibold text-brand-700 uppercase tracking-wide">Flat No.</label>
            <Select options={flatOptions} value={form.flat}
              onChange={opt => setForm(f => ({ ...f, flat: opt }))}
              placeholder="Select..." styles={selectStyles} isSearchable={false} />
          </div>
          <button type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95
              text-white text-sm font-semibold rounded-xl transition shadow-md shadow-brand-300/30">
            <ShieldCheck size={15} /> Verify
          </button>
        </form>

        {verifyResult && (
          <div className={`mt-4 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2
            ${verifyResult === 'not_found'
              ? 'bg-red-50 border border-red-200 text-red-600'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
            {verifyResult === 'not_found'
              ? <><XCircle size={16} /> No visitor found with that name or phone.</>
              : <><CheckCircle2 size={16} /> Found: <strong>{verifyResult.name}</strong> — Flat {verifyResult.host} — Status: {verifyResult.status}</>
            }
          </div>
        )}
      </div>

      {/* Stat Pills */}
      <div className={`flex flex-wrap gap-3 transition-all duration-700 delay-150 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        {[
          { label: 'Total',    value: counts.total,    color: 'bg-brand-600'   },
          { label: 'Pending',  value: counts.pending,  color: 'bg-amber-500'   },
          { label: 'Approved', value: counts.approved, color: 'bg-emerald-500' },
          { label: 'Rejected', value: counts.rejected, color: 'bg-red-500'     },
        ].map(p => (
          <div key={p.label} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${p.color} shadow-sm`}>
            <span className="text-xl font-extrabold text-white">{p.value}</span>
            <span className="text-xs font-medium text-white/80">{p.label}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className={`bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden
        transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-brand-100">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
            <input type="text" placeholder="Search name or flat..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-brand-50 border border-brand-100 rounded-xl w-56
                         focus:outline-none focus:ring-2 focus:ring-brand-300 transition text-brand-900 placeholder:text-brand-300" />
          </div>
          <div className="flex items-center gap-1 bg-brand-50 border border-brand-100 p-1 rounded-xl">
            {['All','Pending','Approved','Rejected'].map(f => (
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
                {['Visitor','Flat / Host','Status','Entry Time','Exit Time','Action'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                    <p className="text-sm text-brand-400">Loading visitors...</p>
                  </div>
                </td></tr>
              )}
              {!loading && filtered.map((v, i) => (
                <EntryRow key={v._id} visitor={v} index={i}
                  onApprove={v => setConfirmModal({ open: true, type: 'approve', visitor: v })}
                  onReject={v  => setConfirmModal({ open: true, type: 'reject',  visitor: v })}
                  onView={v    => setDetailModal({ open: true, visitor: v })}
                  onEntry={handleEntry}
                  onExit={handleExit}
                />
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <UserSearch size={30} className="text-brand-200" />
                    <p className="text-sm text-brand-400">No visitors found</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        open={confirmModal.open}
        onClose={() => setConfirmModal(s => ({ ...s, open: false }))}
        onConfirm={confirmModal.type === 'approve' ? handleApprove : handleReject}
        type={confirmModal.type}
        visitor={confirmModal.visitor}
      />
      <VisitorDetailModal
        open={detailModal.open}
        onClose={() => setDetailModal(s => ({ ...s, open: false }))}
        visitor={detailModal.visitor}
      />

      {/* QR Scanner Modal */}
      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="Scan Visitor QR Code" size="sm">
        <QRScanner
          onScan={async (data) => {
            setQrResult(data)
            const scannedId = extractVisitorId(data)
            const found = visitors.find(v =>
              v._id === scannedId ||
              v.name?.toLowerCase() === data.name?.toLowerCase() ||
              v.phone === data.phone
            )
            if (found) {
              await handleEntry(found, 'qr')
            } else {
              toast.info(`Visitor scanned: ${data.name || 'Unknown'}, but record was not found`)
            }
          }}
          onClose={() => setQrOpen(false)}
        />
      </Modal>
    </div>
  )
}

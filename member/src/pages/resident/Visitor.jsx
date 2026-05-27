import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { UserPlus, Trash2, Search, Users, CheckCircle2, Clock, XCircle, Pencil, QrCode, Calendar } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

import { setVisitors, addVisitor, updateVisitor, removeVisitor, setLoading } from '../../features/visitor/visitorSlice'
import * as visitorAPI from '../../features/visitor/visitorAPI'
import VisitorModal from '../../components/modals/VisitorModal'
import Modal from '../../components/Modal'

// ── Config ────────────────────────────────────────────────────────────────────
const statusConfig = {
  Approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400', icon: CheckCircle2 },
  Pending:  { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400',   icon: Clock        },
  Rejected: { bg: 'bg-red-100',     text: 'text-red-600',     dot: 'bg-red-400',     icon: XCircle      },
}

const avatarColors = ['bg-brand-500','bg-brand-600','bg-brand-400','bg-brand-700','bg-brand-300','bg-brand-800']
const initials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

// ── QR Modal ──────────────────────────────────────────────────────────────────
function QRModal({ open, onClose, visitor }) {
  if (!visitor) return null

  // URL that guard will scan — public page showing visitor details
  const qrUrl = `${window.location.origin}/qr/${visitor._id}`

  // WhatsApp share
  const handleWhatsApp = () => {
    const msg = `Your Entry QR for ${visitor.name}:\n${qrUrl}\n\nShow this to the guard at the gate.`
    const phone = visitor.phone?.replace(/\D/g, '') // strip non-digits
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  const cfg = statusConfig[visitor.status]

  return (
    <Modal open={open} onClose={onClose} title="Visitor QR Code" size="sm">
      <div className="flex flex-col items-center gap-4">

        {/* QR Code */}
        <div className="bg-white p-5 rounded-2xl border-2 border-brand-100 shadow-sm">
          <QRCodeSVG value={qrUrl} size={190} fgColor="#2c185d" level="H"
            imageSettings={{ src: '', height: 0, width: 0, excavate: false }} />
        </div>

        {/* Visitor info */}
        <div className="text-center space-y-1">
          <p className="font-bold text-brand-950 text-base">{visitor.name}</p>
          <p className="text-xs text-brand-400">{visitor.purpose} · Flat {visitor.host}</p>
          <p className="text-xs text-brand-400">{visitor.phone}</p>
          {cfg && (
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {visitor.status}
            </span>
          )}
        </div>

        {/* QR URL hint */}
        <p className="text-xs text-brand-400 text-center bg-brand-50 border border-brand-100 rounded-xl px-3 py-2 w-full break-all">
          {qrUrl}
        </p>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          {/* WhatsApp share */}
          <button onClick={handleWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold
              text-white bg-[#25D366] hover:bg-[#1ebe5d] active:scale-95 rounded-xl transition shadow-md">
            {/* WhatsApp icon */}
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Share on WhatsApp
          </button>

          <button onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition">
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Stat Pill ─────────────────────────────────────────────────────────────────
function StatPill({ label, value, color }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${color} shadow-sm`}>
      <span className="text-xl font-extrabold text-white">{value}</span>
      <span className="text-xs font-medium text-white/80">{label}</span>
    </div>
  )
}

// ── Table Row ─────────────────────────────────────────────────────────────────
function VisitorRow({ visitor, index, onDelete, onEdit, onQR }) {
  const [visible, setVisible] = useState(false)
  const cfg = statusConfig[visitor.status] || statusConfig.Pending
  useEffect(() => { const t = setTimeout(() => setVisible(true), index * 60); return () => clearTimeout(t) }, [index])

  const colorIdx = visitor._id?.charCodeAt(visitor._id.length - 1) % avatarColors.length || 0

  return (
    <tr className={`border-b border-brand-100 hover:bg-brand-50 transition-all duration-300
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>

      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColors[colorIdx]}`}>
            {initials(visitor.name)}
          </div>
          <div>
            <p className="font-semibold text-brand-900 text-sm">{visitor.name}</p>
            <p className="text-xs text-brand-400">
              {new Date(visitor.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-3.5 text-sm text-brand-600">{visitor.phone}</td>

      <td className="px-5 py-3.5">
        <span className="text-xs font-medium bg-brand-100 text-brand-700 px-2.5 py-1 rounded-lg">
          {visitor.purpose}
        </span>
      </td>

      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {visitor.status}
        </span>
      </td>

      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          {/* QR — show for all visitors */}
          <button title="QR Code" onClick={() => onQR(visitor)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition">
            <QrCode size={13} />
          </button>
          <button title="Edit" onClick={() => onEdit(visitor)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-100 text-brand-600 hover:bg-brand-200 transition">
            <Pencil size={13} />
          </button>
          <button title="Delete" onClick={() => onDelete(visitor._id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition">
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Visitor() {
  const dispatch = useDispatch()
  const { visitors, loading } = useSelector(state => state.visitor)

  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('All')
  const [dateFilter, setDateFilter] = useState('')       // date string YYYY-MM-DD
  const [visible, setVisible]     = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [qrVisitor, setQrVisitor]   = useState(null)    // visitor for QR modal

  // ── Fetch ──
  useEffect(() => {
    const load = async () => {
      dispatch(setLoading())
      try {
        const { data } = await visitorAPI.fetchVisitors()
        dispatch(setVisitors(data))
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load visitors')
      }
    }
    load()
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [dispatch])

  // ── Delete ──
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this visitor?')) return
    try {
      await visitorAPI.deleteVisitor(id)
      dispatch(removeVisitor(id))
      toast.success('Visitor deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const openAdd  = ()  => { setEditTarget(null); setModalOpen(true) }
  const openEdit = (v) => { setEditTarget(v);    setModalOpen(true) }

  const handleSave = async (form) => {
    try {
      if (editTarget) {
        const { data } = await visitorAPI.updateVisitor(editTarget._id, form)
        dispatch(updateVisitor(data))
        toast.success('Visitor updated')
      } else {
        const { data } = await visitorAPI.createVisitor(form)
        dispatch(addVisitor(data))
        toast.success('Visitor added')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    }
  }

  // ── Filter: search + status + date ──
  const filtered = visitors.filter(v => {
    const matchSearch = v.name?.toLowerCase().includes(search.toLowerCase()) ||
                        v.purpose?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filter === 'All' || v.status === filter
    const matchDate   = !dateFilter || new Date(v.createdAt).toISOString().slice(0, 10) === dateFilter
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

      {/* Header */}
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-950 tracking-tight">Visitor Management</h1>
            <p className="text-sm text-brand-400 mt-1">Track and manage all your visitors</p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-brand-300/30 hover:shadow-lg">
            <UserPlus size={16} /> Add Visitor
          </button>
        </div>
      </div>

      {/* Stat Pills */}
      <div className={`flex flex-wrap gap-3 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <StatPill label="Total"    value={counts.total}    color="bg-brand-600"   />
        <StatPill label="Approved" value={counts.approved} color="bg-emerald-500" />
        <StatPill label="Pending"  value={counts.pending}  color="bg-amber-500"   />
        <StatPill label="Rejected" value={counts.rejected} color="bg-red-500"     />
      </div>

      {/* Table Card */}
      <div className={`bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden
        transition-all duration-700 delay-150
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* ── Toolbar with all 3 filters ── */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-brand-100">

          {/* Search by name */}
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
            <input type="text" placeholder="Search name or purpose..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-brand-50 border border-brand-100 rounded-xl w-full
                         focus:outline-none focus:ring-2 focus:ring-brand-300 transition
                         text-brand-900 placeholder:text-brand-300" />
          </div>

          {/* Date filter */}
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300 pointer-events-none" />
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm bg-brand-50 border border-brand-100 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-brand-300 transition text-brand-700" />
          </div>

          {/* Clear date */}
          {dateFilter && (
            <button onClick={() => setDateFilter('')}
              className="text-xs text-brand-400 hover:text-brand-700 underline transition">
              Clear date
            </button>
          )}

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 bg-brand-50 border border-brand-100 p-1 rounded-xl ml-auto">
            {['All','Approved','Pending','Rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200
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
                {['Visitor','Phone','Purpose','Status','Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                    <p className="text-sm text-brand-400">Loading visitors...</p>
                  </div>
                </td></tr>
              )}
              {!loading && filtered.map((v, i) => (
                <VisitorRow key={v._id} visitor={v} index={i}
                  onDelete={handleDelete} onEdit={openEdit} onQR={setQrVisitor} />
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Users size={32} className="text-brand-200" />
                    <p className="text-sm font-medium text-brand-400">No visitors found</p>
                    <p className="text-xs text-brand-300">Try adjusting your search or filters</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-brand-100 bg-brand-50/60">
            <p className="text-xs text-brand-400">
              Showing <span className="font-semibold text-brand-600">{filtered.length}</span> of{' '}
              <span className="font-semibold text-brand-600">{visitors.length}</span> visitors
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <VisitorModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initial={editTarget} />
      <QRModal open={!!qrVisitor} onClose={() => setQrVisitor(null)} visitor={qrVisitor} />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { UserPlus, Trash2, Search, Users2, CheckCircle2, XCircle, Pencil, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

// Redux
import { setStaff, addStaff, updateStaff, removeStaff, setLoading } from '../../features/staff/staffSlice'
import * as staffAPI from '../../features/staff/staffAPI'
import StaffModal from '../../components/modals/StaffModal'
import Modal from '../../components/Modal'

// ── Staff QR Modal ────────────────────────────────────────────────────────────
function StaffQRModal({ open, onClose, staff }) {
  if (!staff) return null
  const qrUrl = `${window.location.origin}/staff-qr/${staff._id}`
  const cfg = statusConfig[staff.status] || statusConfig.Active

  return (
    <Modal open={open} onClose={onClose} title="Staff QR Code" size="sm">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-white p-5 rounded-2xl border-2 border-brand-100 shadow-sm">
          <QRCodeSVG value={qrUrl} size={190} fgColor="#2c185d" level="H" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-bold text-brand-950 text-base">{staff.name}</p>
          <p className="text-xs text-brand-400">{staff.role} · {staff.phone}</p>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {staff.status}
          </span>
        </div>
        <p className="text-xs text-brand-400 text-center bg-brand-50 border border-brand-100 rounded-xl px-3 py-2 w-full break-all">
          {qrUrl}
        </p>
        <button onClick={onClose}
          className="w-full py-2.5 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition">
          Close
        </button>
      </div>
    </Modal>
  )
}

// ── Config ────────────────────────────────────────────────────────────────────
const roleColors = {
  Cleaner:  'bg-brand-100 text-brand-700',
  Cook:     'bg-emerald-100 text-emerald-700',
  Driver:   'bg-amber-100 text-amber-700',
  Security: 'bg-red-100 text-red-600',
  Gardener: 'bg-teal-100 text-teal-700',
  Other:    'bg-gray-100 text-gray-600',
}

const statusConfig = {
  Active:   { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  Inactive: { bg: 'bg-red-100',     text: 'text-red-600',     dot: 'bg-red-400'     },
}

const avatarColors = ['bg-brand-500','bg-brand-600','bg-brand-400','bg-brand-700','bg-brand-300','bg-brand-800']

const initials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

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
function StaffRow({ member, index, onDelete, onEdit, onQR }) {
  const [visible, setVisible] = useState(false)
  const cfg = statusConfig[member.status] || statusConfig.Active

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 60)
    return () => clearTimeout(t)
  }, [index])

  const colorIdx = member._id?.charCodeAt(member._id.length - 1) % avatarColors.length || 0

  return (
    <tr className={`border-b border-brand-100 hover:bg-brand-50 transition-all duration-300
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>

      {/* Name */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColors[colorIdx]}`}>
            {initials(member.name)}
          </div>
          <div>
            <p className="font-semibold text-brand-900 text-sm">{member.name}</p>
            <p className="text-xs text-brand-400">
              {new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-5 py-3.5">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[member.role] || 'bg-brand-100 text-brand-700'}`}>
          {member.role}
        </span>
      </td>

      {/* Phone */}
      <td className="px-5 py-3.5 text-sm text-brand-600">{member.phone}</td>

      {/* Status */}
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {member.status}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <button title="QR Code" onClick={() => onQR(member)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition">
            <QrCode size={13} />
          </button>
          <button title="Edit" onClick={() => onEdit(member)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-100 text-brand-600 hover:bg-brand-200 transition">
            <Pencil size={13} />
          </button>
          <button title="Delete" onClick={() => onDelete(member._id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition">
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Staff() {
  const dispatch = useDispatch()

  // Get staff list + loading from Redux store
  const { staffList, loading } = useSelector(state => state.staff)

  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('All')
  const [visible, setVisible]     = useState(false)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [qrStaff, setQrStaff]       = useState(null)

  // ── Fetch staff on mount ──
  useEffect(() => {
    const load = async () => {
      dispatch(setLoading())
      try {
        const { data } = await staffAPI.fetchStaff()
        dispatch(setStaff(data))
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load staff')
      }
    }
    load()
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [dispatch])

  // ── Delete ──
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this staff member?')) return
    try {
      await staffAPI.deleteStaff(id)
      dispatch(removeStaff(id))
      toast.success('Staff member deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  // ── Open modals ──
  const openAdd  = ()  => { setEditTarget(null); setModalOpen(true) }
  const openEdit = (s) => { setEditTarget(s);    setModalOpen(true) }

  // ── Save (Add or Edit) ──
  const handleSave = async (form) => {
    try {
      if (editTarget) {
        // Edit — PUT /api/staff/:id
        const { data } = await staffAPI.updateStaff(editTarget._id, form)
        dispatch(updateStaff(data))
        toast.success('Staff updated')
      } else {
        // Add — POST /api/staff
        const { data } = await staffAPI.createStaff(form)
        dispatch(addStaff(data))
        toast.success('Staff member added')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    }
  }

  // ── Filter + Search ──
  const filtered = staffList.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
                        s.role?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || s.status === filter
    return matchSearch && matchFilter
  })

  const counts = {
    total:    staffList.length,
    active:   staffList.filter(s => s.status === 'Active').length,
    inactive: staffList.filter(s => s.status === 'Inactive').length,
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">

      {/* Header */}
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-950 tracking-tight">Staff Management</h1>
            <p className="text-sm text-brand-400 mt-1">Manage your household staff members</p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-brand-300/30 hover:shadow-lg">
            <UserPlus size={16} /> Add Staff
          </button>
        </div>
      </div>

      {/* Stat Pills */}
      <div className={`flex flex-wrap gap-3 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <StatPill label="Total"    value={counts.total}    color="bg-brand-600"   />
        <StatPill label="Active"   value={counts.active}   color="bg-emerald-500" />
        <StatPill label="Inactive" value={counts.inactive} color="bg-red-500"     />
      </div>

      {/* Table Card */}
      <div className={`bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden
        transition-all duration-700 delay-150
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-brand-100">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
            <input type="text" placeholder="Search name or role..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-brand-50 border border-brand-100 rounded-xl w-64
                         focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition
                         text-brand-900 placeholder:text-brand-300" />
          </div>
          <div className="flex items-center gap-1 bg-brand-50 border border-brand-100 p-1 rounded-xl">
            {['All','Active','Inactive'].map(f => (
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
                {['Staff Member','Role','Phone','Status','Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Loading */}
              {loading && (
                <tr><td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                    <p className="text-sm text-brand-400">Loading staff...</p>
                  </div>
                </td></tr>
              )}

              {!loading && filtered.map((s, i) => (
                <StaffRow key={s._id} member={s} index={i} onDelete={handleDelete} onEdit={openEdit} onQR={setQrStaff} />
              ))}

              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Users2 size={32} className="text-brand-200" />
                    <p className="text-sm font-medium text-brand-400">No staff found</p>
                    <p className="text-xs text-brand-300">Try adjusting your search or filter</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-brand-100 bg-brand-50/60 flex items-center justify-between">
            <p className="text-xs text-brand-400">
              Showing <span className="font-semibold text-brand-600">{filtered.length}</span> of{' '}
              <span className="font-semibold text-brand-600">{staffList.length}</span> staff members
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <StaffModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editTarget}
      />

      {/* Staff QR Modal */}
      <StaffQRModal
        open={!!qrStaff}
        onClose={() => setQrStaff(null)}
        staff={qrStaff}
      />
    </div>
  )
}

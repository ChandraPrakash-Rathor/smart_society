import Modal from '../Modal'
import { Phone, Home, Clock, CheckCircle2, XCircle } from 'lucide-react'

const statusCfg = {
  Approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400', icon: CheckCircle2 },
  Pending:  { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400',   icon: Clock        },
  Rejected: { bg: 'bg-red-100',     text: 'text-red-600',     dot: 'bg-red-400',     icon: XCircle      },
}

const avatarColors = ['bg-brand-500','bg-brand-600','bg-brand-400','bg-brand-700','bg-brand-300']

const Row = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-3 border-b border-brand-50 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
      <Icon size={14} className="text-brand-600" />
    </div>
    <div>
      <p className="text-xs text-brand-400 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-sm font-semibold text-brand-900 mt-0.5">{value || '—'}</p>
    </div>
  </div>
)

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

export default function VisitorDetailModal({ open, onClose, visitor }) {
  if (!visitor) return null

  const cfg      = statusCfg[visitor.status] || statusCfg.Pending
  const StatusIcon = cfg.icon
  const colorIdx = visitor.id % avatarColors.length
  const initials = visitor.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <Modal open={open} onClose={onClose} title="Visitor Details" size="sm">
      <div className="flex flex-col items-center gap-4">

        {/* Avatar */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold shadow-md ${avatarColors[colorIdx]}`}>
          {initials}
        </div>

        {/* Name + status */}
        <div className="text-center">
          <p className="text-lg font-bold text-brand-950">{visitor.name}</p>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mt-1.5 ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {visitor.status}
          </span>
        </div>

        {/* Info rows */}
        <div className="w-full">
          <Row icon={Phone} label="Phone"   value={visitor.phone} />
          <Row icon={Home}  label="Flat No" value={visitor.flat || visitor.host}  />
          <Row icon={Clock} label="Purpose" value={visitor.purpose || 'Visit'} />
          <Row icon={CheckCircle2} label="Entry Time" value={formatDateTime(visitor.checkIn)} />
          <Row icon={XCircle} label="Exit Time" value={formatDateTime(visitor.checkOut)} />
        </div>

        <button onClick={onClose}
          className="w-full py-2.5 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition">
          Close
        </button>
      </div>
    </Modal>
  )
}

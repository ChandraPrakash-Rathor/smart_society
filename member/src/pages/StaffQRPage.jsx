import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import {
  Building2, Phone, Briefcase, User,
  Home, CheckCircle2, XCircle, AlertTriangle,
  Clock, Calendar,
} from 'lucide-react'
import axiosInstance from '../utils/axiosInstance'

// ── Status config ─────────────────────────────────────────────────────────────
const statusCfg = {
  Active:   { banner: 'bg-emerald-500', text: 'text-white', icon: CheckCircle2, label: '✅ Active Staff'   },
  Inactive: { banner: 'bg-red-500',     text: 'text-white', icon: XCircle,      label: '❌ Inactive Staff' },
}

// ── Info Row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value, highlight }) => (
  <div className="flex items-center gap-3 py-3 border-b border-brand-100 last:border-0">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
      ${highlight ? 'bg-brand-600' : 'bg-brand-100'}`}>
      <Icon size={14} className={highlight ? 'text-white' : 'text-brand-600'} />
    </div>
    <div>
      <p className="text-xs text-brand-400 uppercase tracking-wide font-medium">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 ${highlight ? 'text-brand-700' : 'text-brand-900'}`}>{value || '—'}</p>
    </div>
  </div>
)

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StaffQRPage() {
  const { staffId } = useParams()
  const [staff, setStaff]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosInstance.get(`/staff/public/${staffId}`)
        setStaff(data)
      } catch (err) {
        setError(err.response?.data?.message || 'Staff member not found')
      } finally {
        setLoading(false)
      }
    }
    if (staffId) load()
  }, [staffId])

  const qrUrl = `${window.location.origin}/staff-qr/${staffId}`
  const cfg   = statusCfg[staff?.status] || statusCfg.Active

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-sm text-brand-400">Loading staff details...</p>
      </div>
    </div>
  )

  // ── Error ──
  if (error) return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-500" />
        </div>
        <h2 className="font-bold text-brand-950 text-lg">Staff Not Found</h2>
        <p className="text-sm text-brand-400 mt-2">{error}</p>
        <p className="text-xs text-brand-300 mt-1 font-mono">ID: {staffId}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Building2 size={16} className="text-white" />
            </div>
            <span className="font-bold text-brand-950">Smart Society</span>
          </div>
          <p className="text-xs text-brand-400">Staff Identity Card</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-brand-100 shadow-xl shadow-brand-200/30 overflow-hidden">

          {/* Status banner */}
          <div className={`${cfg.banner} px-5 py-3 flex items-center justify-center gap-2`}>
            <cfg.icon size={16} className={cfg.text} />
            <span className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</span>
          </div>

          <div className="p-6 flex flex-col items-center gap-5">

            {/* Avatar + name */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-md">
                {staff.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="text-center">
                <p className="text-xl font-extrabold text-brand-950">{staff.name}</p>
                <p className="text-sm text-brand-500 mt-0.5">{staff.role}</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-2xl border-2 border-brand-100 shadow-sm">
              <QRCodeSVG value={qrUrl} size={180} fgColor="#2c185d" level="H" />
            </div>

            {/* Staff details */}
            <div className="w-full">
              <p className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-2">Staff Details</p>
              <InfoRow icon={Phone}    label="Phone"  value={staff.phone} />
              <InfoRow icon={Briefcase} label="Role"  value={staff.role}  />
              <InfoRow icon={Calendar} label="Joined" value={new Date(staff.createdAt).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})} />
              {staff.checkIn && (
                <InfoRow icon={Clock} label="Last Check-In"
                  value={new Date(staff.checkIn).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})} />
              )}
            </div>

            {/* Owner / Resident info */}
            {staff.owner && (
              <div className="w-full">
                <p className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-2">Employed By</p>
                <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 space-y-0">
                  <InfoRow icon={User}  label="Resident Name" value={staff.owner.name}  highlight />
                  <InfoRow icon={Home}  label="Flat / Unit"   value={staff.owner.flat}  highlight />
                  <InfoRow icon={Phone} label="Contact"       value={staff.owner.phone} highlight />
                </div>
              </div>
            )}

            {/* Staff ID */}
            <div className="w-full bg-brand-50 border border-brand-100 rounded-xl px-4 py-2.5 text-center">
              <p className="text-xs text-brand-400 font-medium">Staff ID</p>
              <p className="text-xs font-mono text-brand-700 mt-0.5 break-all">{staff._id}</p>
            </div>

            <p className="text-xs text-brand-400 text-center">
              Scan this QR at the gate for identity verification.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-brand-300 mt-4">
          Powered by Smart Society Management
        </p>
      </div>
    </div>
  )
}

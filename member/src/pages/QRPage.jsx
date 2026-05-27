import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle2, Clock, XCircle, Building2, Phone, Home, Tag, AlertTriangle } from 'lucide-react'
import axiosInstance from '../utils/axiosInstance'

// ── Status config ─────────────────────────────────────────────────────────────
const statusCfg = {
  Approved: { bg: 'bg-emerald-500', text: 'text-white',       icon: CheckCircle2,  label: '✅ Entry Allowed'  },
  Pending:  { bg: 'bg-amber-400',   text: 'text-white',       icon: Clock,         label: '⏳ Awaiting Approval' },
  Rejected: { bg: 'bg-red-500',     text: 'text-white',       icon: XCircle,       label: '❌ Entry Denied'   },
}

// ── Info Row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-3 border-b border-brand-100 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
      <Icon size={14} className="text-brand-600" />
    </div>
    <div>
      <p className="text-xs text-brand-400 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-sm font-semibold text-brand-900 mt-0.5">{value || '—'}</p>
    </div>
  </div>
)

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function QRPage() {
  const { visitorId } = useParams()
  const [visitor, setVisitor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosInstance.get(`/visitors/public/${visitorId}`)
        setVisitor(data)
      } catch (err) {
        setError(err.response?.data?.message || 'Visitor not found')
      } finally {
        setLoading(false)
      }
    }
    if (visitorId) load()
  }, [visitorId])

  const qrUrl = `${window.location.origin}/qr/${visitorId}`
  const cfg   = statusCfg[visitor?.status] || statusCfg.Pending

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-sm text-brand-400">Loading visitor details...</p>
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
        <h2 className="font-bold text-brand-950 text-lg">QR Not Found</h2>
        <p className="text-sm text-brand-400 mt-2">{error}</p>
        <p className="text-xs text-brand-300 mt-1">Visitor ID: {visitorId}</p>
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
          <p className="text-xs text-brand-400">Visitor Entry Pass</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-brand-100 shadow-xl shadow-brand-200/30 overflow-hidden">

          {/* Status banner */}
          <div className={`${cfg.bg} px-5 py-3 flex items-center justify-center gap-2`}>
            <cfg.icon size={16} className={cfg.text} />
            <span className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</span>
          </div>

          <div className="p-6 flex flex-col items-center gap-5">

            {/* QR Code */}
            <div className="bg-white p-4 rounded-2xl border-2 border-brand-100 shadow-sm">
              <QRCodeSVG
                value={qrUrl}
                size={200}
                fgColor="#2c185d"
                level="H"
              />
            </div>

            {/* Visitor name */}
            <div className="text-center">
              <p className="text-xl font-extrabold text-brand-950">{visitor.name}</p>
              <p className="text-xs text-brand-400 mt-1">
                {new Date(visitor.createdAt).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
              </p>
            </div>

            {/* Info rows */}
            <div className="w-full">
              <InfoRow icon={Phone} label="Phone"   value={visitor.phone}   />
              <InfoRow icon={Tag}   label="Purpose" value={visitor.purpose} />
              <InfoRow icon={Home}  label="Host / Flat" value={visitor.host} />
            </div>

            {/* Visitor ID */}
            <div className="w-full bg-brand-50 border border-brand-100 rounded-xl px-4 py-2.5 text-center">
              <p className="text-xs text-brand-400 font-medium">Visitor ID</p>
              <p className="text-xs font-mono text-brand-700 mt-0.5 break-all">{visitor._id}</p>
            </div>

            {/* Footer note */}
            <p className="text-xs text-brand-400 text-center">
              Show this QR code to the guard at the gate for entry verification.
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

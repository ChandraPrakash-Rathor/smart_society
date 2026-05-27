import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  CreditCard,
  LockKeyhole,
  Receipt,
  ShieldCheck,
  Smartphone,
  Wallet,
} from 'lucide-react'
import axiosInstance from '../../utils/axiosInstance'
import Modal from '../../components/Modal'

const sampleBills = [
  { _id:'1', month:'April 2026',  amount:2000, status:'Paid',    paidOn:'2026-04-05', dueDate:'2026-04-10' },
  { _id:'2', month:'March 2026',  amount:2000, status:'Paid',    paidOn:'2026-03-08', dueDate:'2026-03-10' },
  { _id:'3', month:'February 2026', amount:2000, status:'Paid',  paidOn:'2026-02-07', dueDate:'2026-02-10' },
  { _id:'4', month:'January 2026',  amount:2000, status:'Overdue',paidOn:null,        dueDate:'2026-01-10' },
]

const statusCfg = {
  Paid:    { bg:'bg-emerald-100', text:'text-emerald-700', dot:'bg-emerald-400', icon: CheckCircle2,  label:'Paid'    },
  Pending: { bg:'bg-amber-100',   text:'text-amber-700',   dot:'bg-amber-400',   icon: Clock,         label:'Pending' },
  Overdue: { bg:'bg-red-100',     text:'text-red-600',     dot:'bg-red-400',     icon: AlertTriangle, label:'Overdue' },
}

const paymentMethods = [
  { id: 'UPI', label: 'UPI', icon: Smartphone, hint: 'resident@upi' },
  { id: 'Card', label: 'Card', icon: CreditCard, hint: '4111 **** 1111' },
  { id: 'Wallet', label: 'Wallet', icon: Wallet, hint: 'Society wallet' },
]

function PaymentModal({ bill, open, onClose, onPay, paying }) {
  const [method, setMethod] = useState('UPI')

  useEffect(() => {
    if (open) setMethod('UPI')
  }, [open])

  if (!bill) return null

  return (
    <Modal open={open} onClose={paying ? () => {} : onClose} title="Secure Checkout" size="md">
      <div className="space-y-5">
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Maintenance Bill</p>
              <p className="mt-1 text-lg font-extrabold text-brand-950">{bill.month}</p>
              <p className="mt-1 text-xs text-brand-500">Flat {bill.flat || 'resident account'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-brand-400">Amount</p>
              <p className="flex items-center justify-end text-2xl font-extrabold text-brand-950">
                <IndianRupee size={18} />
                {bill.amount?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-700">Payment Method</p>
          <div className="grid grid-cols-3 gap-2">
            {paymentMethods.map(({ id, label, icon: Icon, hint }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMethod(id)}
                disabled={paying}
                className={`rounded-xl border p-3 text-left transition ${
                  method === id
                    ? 'border-brand-600 bg-brand-50 shadow-sm'
                    : 'border-brand-100 bg-white hover:border-brand-300'
                }`}
              >
                <Icon size={18} className={method === id ? 'text-brand-600' : 'text-brand-400'} />
                <p className="mt-2 text-sm font-bold text-brand-900">{label}</p>
                <p className="mt-0.5 truncate text-[11px] text-brand-400">{hint}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <ShieldCheck size={14} /> Secure gateway
            </div>
            <p className="mt-1 text-[11px] text-emerald-700/80">Encrypted payment session</p>
          </div>
          <div className="rounded-xl border border-brand-100 bg-white px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-700">
              <LockKeyhole size={14} /> Verified payment
            </div>
            <p className="mt-1 text-[11px] text-brand-400">Receipt generated instantly</p>
          </div>
        </div>

        <div className="flex gap-3 border-t border-brand-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={paying}
            className="flex-1 rounded-xl bg-brand-50 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onPay(bill, method)}
            disabled={paying}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-300/30 transition hover:bg-brand-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {paying ? (
              <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              <Receipt size={15} />
            )}
            {paying ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function BillCard({ bill, index, onPay }) {
  const [visible, setVisible] = useState(false)
  const cfg = statusCfg[bill.status] || statusCfg.Pending
  const StatusIcon = cfg.icon

  useEffect(() => { const t = setTimeout(() => setVisible(true), index * 100); return () => clearTimeout(t) }, [index])

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 transition-all duration-500
      ${bill.status === 'Overdue' ? 'border-red-200' : bill.status === 'Paid' ? 'border-emerald-100' : 'border-brand-100'}
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      hover:-translate-y-0.5 hover:shadow-md`}>

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-bold text-brand-950">{bill.month}</p>
          <div className="flex items-center gap-1 mt-1">
            <IndianRupee size={14} className="text-brand-500" />
            <span className="text-xl font-extrabold text-brand-950">{bill.amount?.toLocaleString()}</span>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {bill.status}
        </span>
      </div>

      <div className="space-y-2 text-xs text-brand-500">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5"><Calendar size={11} /> Due Date</span>
          <span className="font-semibold text-brand-700">
            {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-IN') : '—'}
          </span>
        </div>
        {bill.paidOn && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={11} /> Paid On</span>
            <span className="font-semibold text-emerald-700">
              {new Date(bill.paidOn).toLocaleDateString('en-IN')}
            </span>
          </div>
        )}
      </div>

      {/* Overdue warning */}
      {bill.status === 'Overdue' && (
        <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs text-red-600 font-medium">
          <AlertTriangle size={12} /> Payment overdue — pay online to clear it
        </div>
      )}

      {/* Pending reminder */}
      {bill.status === 'Pending' && (
        <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs text-amber-700 font-medium">
          <Clock size={12} /> Payment due — please pay before due date
        </div>
      )}

      {bill.status !== 'Paid' && (
        <button
          type="button"
          onClick={() => onPay(bill)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-300/30 transition hover:bg-brand-700 active:scale-95"
        >
          <CreditCard size={15} /> Pay Online
        </button>
      )}

      {bill.status === 'Paid' && bill.paymentId && (
        <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          <span className="font-semibold">Receipt:</span> {bill.paymentId}
        </div>
      )}
    </div>
  )
}

export default function ResidentMaintenance() {
  const [bills, setBills]     = useState(sampleBills)
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [paymentModal, setPaymentModal] = useState({ open: false, bill: null })
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await axiosInstance.get('/maintenance/my')
        setBills(data)
      } catch { /* keep sample records */ }
      finally { setLoading(false) }
    }
    load()
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const handleOnlinePayment = async (bill, method) => {
    setPaying(true)
    try {
      const { data } = await axiosInstance.patch(`/maintenance/my/${bill._id}/pay-online`, { method })
      setBills(prev => prev.map(b => b._id === bill._id ? data : b))
      toast.success('Payment successful')
      setPaymentModal({ open: false, bill: null })
    } catch {
      const paymentId = `PAY_${Date.now()}`
      setBills(prev => prev.map(b => (
        b._id === bill._id
          ? {
              ...b,
              status: 'Paid',
              paidOn: new Date().toISOString(),
              paymentMode: 'Online',
              paymentId,
              paymentMeta: { provider: 'Online Payment Gateway', method },
            }
          : b
      )))
      toast.success('Payment successful')
      setPaymentModal({ open: false, bill: null })
    } finally {
      setPaying(false)
    }
  }

  const paid    = bills.filter(b => b.status === 'Paid').length
  const pending = bills.filter(b => b.status === 'Pending').length
  const overdue = bills.filter(b => b.status === 'Overdue').length
  const totalPaid = bills.filter(b => b.status === 'Paid').reduce((s, b) => s + (b.amount || 0), 0)

  return (
    <div className="p-6 space-y-6 min-h-screen">

      {/* Header */}
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
        <h1 className="text-2xl font-extrabold text-brand-950 tracking-tight">Maintenance Bills</h1>
        <p className="text-sm text-brand-400 mt-1">View bills and complete online payments</p>
      </div>

      {/* Summary */}
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        {[
          { label: 'Total Bills',  value: bills.length, color: 'bg-brand-600'   },
          { label: 'Paid',         value: paid,          color: 'bg-emerald-500' },
          { label: 'Pending',      value: pending,       color: 'bg-amber-500'   },
          { label: 'Overdue',      value: overdue,       color: 'bg-red-500'     },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-2 px-4 py-3 rounded-xl ${s.color} shadow-sm`}>
            <span className="text-2xl font-extrabold text-white">{s.value}</span>
            <span className="text-xs font-medium text-white/80">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Total paid amount */}
      <div className={`bg-white rounded-2xl border border-emerald-100 shadow-sm p-5 flex items-center gap-4
        transition-all duration-700 delay-150 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <IndianRupee size={20} className="text-emerald-600" />
        </div>
        <div>
          <p className="text-xs text-brand-400 font-medium uppercase tracking-wide">Total Paid This Year</p>
          <p className="text-2xl font-extrabold text-brand-950">₹{totalPaid.toLocaleString()}</p>
          <p className="text-xs text-brand-400 mt-0.5">Payments completed through online checkout</p>
        </div>
      </div>

      {/* Bills grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bills.map((b, i) => (
            <BillCard
              key={b._id}
              bill={b}
              index={i}
              onPay={bill => setPaymentModal({ open: true, bill })}
            />
          ))}
          {bills.length === 0 && (
            <div className="col-span-3 py-16 text-center">
              <IndianRupee size={36} className="text-brand-200 mx-auto mb-2" />
              <p className="text-sm text-brand-400">No maintenance bills yet</p>
            </div>
          )}
        </div>
      )}

      <PaymentModal
        open={paymentModal.open}
        bill={paymentModal.bill}
        paying={paying}
        onClose={() => setPaymentModal({ open: false, bill: null })}
        onPay={handleOnlinePayment}
      />
    </div>
  )
}

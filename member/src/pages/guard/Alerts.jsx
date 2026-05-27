import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { AlertTriangle, CheckCircle2, Home, RefreshCw, ShieldCheck } from 'lucide-react'
import axiosInstance from '../../utils/axiosInstance'

const fmt = (value) =>
  value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '-'

export default function GuardAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Active')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await axiosInstance.get('/alerts')
      setAlerts(data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const resolveAlert = async (id) => {
    try {
      const { data } = await axiosInstance.patch(`/alerts/${id}/resolve`)
      setAlerts(prev => prev.map(alert => alert._id === id ? data : alert))
      toast.success('Alert marked resolved')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve alert')
    }
  }

  const filtered = alerts.filter(alert =>
    filter === 'All' || (filter === 'Active' ? !alert.resolved : alert.resolved)
  )

  const activeCount = alerts.filter(alert => !alert.resolved).length

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-950 tracking-tight">Emergency Alerts</h1>
          <p className="mt-1 text-sm text-brand-400">Resident emergency requests visible to guards</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-red-500 p-5 text-white shadow-md">
          <p className="text-3xl font-extrabold">{activeCount}</p>
          <p className="text-xs font-medium text-white/80">Active Alerts</p>
        </div>
        <div className="rounded-2xl bg-emerald-500 p-5 text-white shadow-md">
          <p className="text-3xl font-extrabold">{alerts.length - activeCount}</p>
          <p className="text-xs font-medium text-white/80">Resolved</p>
        </div>
        <div className="rounded-2xl bg-brand-600 p-5 text-white shadow-md">
          <p className="text-3xl font-extrabold">{alerts.length}</p>
          <p className="text-xs font-medium text-white/80">Total Alerts</p>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-sm font-bold text-brand-950">Alert List</span>
          </div>
          <div className="flex rounded-xl border border-brand-100 bg-brand-50 p-1">
            {['Active', 'Resolved', 'All'].map(item => (
              <button key={item} onClick={() => setFilter(item)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  filter === item ? 'bg-brand-600 text-white' : 'text-brand-400 hover:text-brand-700'
                }`}>
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-14">
            <div className="h-7 w-7 rounded-full border-2 border-brand-300 border-t-brand-600 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <ShieldCheck size={34} className="mx-auto mb-2 text-emerald-300" />
            <p className="text-sm text-brand-400">No alerts found</p>
          </div>
        ) : (
          <div className="divide-y divide-brand-50">
            {filtered.map(alert => (
              <div key={alert._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-brand-950">{alert.sentBy?.name || 'Resident'}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      alert.resolved ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600 animate-pulse'
                    }`}>
                      {alert.resolved ? 'Resolved' : 'Active'}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-brand-400">
                    <Home size={11} /> Flat {alert.flat || alert.sentBy?.flat || 'N/A'} · {fmt(alert.createdAt)}
                  </p>
                  <p className="mt-2 text-sm font-medium text-brand-700">{alert.message}</p>
                </div>
                {!alert.resolved && (
                  <button onClick={() => resolveAlert(alert._id)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700">
                    <CheckCircle2 size={15} /> Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

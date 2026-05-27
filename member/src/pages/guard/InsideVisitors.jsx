import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { LogOut, Search, Users, Clock, Home } from 'lucide-react'
import * as guardAPI from '../../features/guard/guardAPI'

const fmt = (value) =>
  value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '-'

export default function GuardInsideVisitors() {
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await guardAPI.fetchPendingVisitors()
        setVisitors(data)
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load visitors')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleExit = async (visitor) => {
    try {
      const { data } = await guardAPI.markVisitorExit(visitor._id)
      setVisitors(prev => prev.map(item => item._id === visitor._id ? data.visitor : item))
      toast.success(`${data.visitor.name} exit recorded`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record exit')
    }
  }

  const inside = visitors
    .filter(visitor => visitor.checkIn && !visitor.checkOut)
    .filter(visitor =>
      visitor.name?.toLowerCase().includes(search.toLowerCase()) ||
      visitor.phone?.includes(search) ||
      visitor.host?.toLowerCase().includes(search.toLowerCase()) ||
      visitor.flat?.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-950 tracking-tight">Visitors Inside</h1>
        <p className="mt-1 text-sm text-brand-400">Visitors who entered but have not exited yet</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-brand-600 p-5 text-white shadow-md">
          <p className="text-3xl font-extrabold">{inside.length}</p>
          <p className="text-xs font-medium text-white/80">Currently Inside</p>
        </div>
        <div className="rounded-2xl bg-emerald-500 p-5 text-white shadow-md">
          <p className="text-3xl font-extrabold">{visitors.filter(v => v.checkOut).length}</p>
          <p className="text-xs font-medium text-white/80">Exited</p>
        </div>
        <div className="rounded-2xl bg-amber-500 p-5 text-white shadow-md">
          <p className="text-3xl font-extrabold">{visitors.filter(v => v.status === 'Pending').length}</p>
          <p className="text-xs font-medium text-white/80">Pending</p>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-brand-500" />
            <span className="text-sm font-bold text-brand-950">Inside Visitor List</span>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search visitor..."
              className="w-56 rounded-xl border border-brand-100 bg-brand-50 py-2 pl-9 pr-3 text-sm text-brand-900 outline-none transition focus:ring-2 focus:ring-brand-300" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-14">
            <div className="h-7 w-7 rounded-full border-2 border-brand-300 border-t-brand-600 animate-spin" />
          </div>
        ) : inside.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={34} className="mx-auto mb-2 text-brand-200" />
            <p className="text-sm text-brand-400">No visitors inside right now</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-100 bg-brand-50">
                  {['Visitor', 'Flat', 'Entry Time', 'Phone', 'Action'].map(head => (
                    <th key={head} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-brand-500">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inside.map(visitor => (
                  <tr key={visitor._id} className="border-b border-brand-50 hover:bg-brand-50/60">
                    <td className="px-5 py-3 font-semibold text-brand-900">{visitor.name}</td>
                    <td className="px-5 py-3 text-brand-600">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-brand-100 px-2 py-1 text-xs font-bold">
                        <Home size={11} /> {visitor.host || visitor.flat || 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-brand-500">
                      <span className="inline-flex items-center gap-1"><Clock size={12} /> {fmt(visitor.checkIn)}</span>
                    </td>
                    <td className="px-5 py-3 text-brand-500">{visitor.phone || '-'}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleExit(visitor)}
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800">
                        <LogOut size={13} /> Mark Exit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

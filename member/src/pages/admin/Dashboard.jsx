import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Users, UserCheck, Shield, Eye, AlertTriangle, MessageSquare, UserPlus, ArrowUpRight } from 'lucide-react'
import axiosInstance from '../../utils/axiosInstance'

// fallback static data
const fallbackVisitors = [
  { day:'Mon',visitors:18 },{ day:'Tue',visitors:32 },{ day:'Wed',visitors:27 },
  { day:'Thu',visitors:41 },{ day:'Fri',visitors:35 },{ day:'Sat',visitors:22 },{ day:'Sun',visitors:14 },
]
const fallbackComplaints = [
  { name:'Water',value:12,color:'#60a5fa' },{ name:'Security',value:8,color:'#f87171' },
  { name:'Maintenance',value:15,color:'#fbbf24' },{ name:'Electricity',value:6,color:'#a78bfa' },
  { name:'Other',value:4,color:'#6ee7b7' },
]

function useCountUp(target) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!target) return
    let i = 0
    const step = Math.max(20, Math.ceil(1000 / target))
    const t = setInterval(() => { i++; setV(i); if (i >= target) clearInterval(t) }, step)
    return () => clearInterval(t)
  }, [target])
  return v
}

function StatCard({ label, value, icon: Icon, gradient, glow, delay }) {
  const count = useCountUp(value)
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${glow}
      bg-gradient-to-br ${gradient} transition-all duration-700 hover:-translate-y-1 hover:shadow-xl cursor-default
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-1">{label}</p>
          <p className="text-4xl font-extrabold leading-none">{count}</p>
        </div>
        <div className="bg-white/20 rounded-xl p-2.5"><Icon size={20} /></div>
      </div>
    </div>
  )
}

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-brand-100 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-brand-900">{label}</p>
      <p className="text-brand-600">{payload[0].value} visitors</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [visible, setVisible]   = useState(false)
  const [loading, setLoading]   = useState(true)
  const [stats, setStats]       = useState({ totalUsers:0, totalResidents:0, totalGuards:0, visitorsToday:0 })
  const [visitorsPerDay, setVisitorsPerDay]         = useState(fallbackVisitors)
  const [complaintsByCategory, setComplaintsByCategory] = useState(fallbackComplaints)
  const [recentAlerts, setRecentAlerts]             = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosInstance.get('/admin/stats')
        setStats(data.stats)
        if (data.visitorsPerDay?.length)      setVisitorsPerDay(data.visitorsPerDay)
        if (data.complaintsByCategory?.length) setComplaintsByCategory(data.complaintsByCategory)
        if (data.recentAlerts?.length)         setRecentAlerts(data.recentAlerts)
      } catch (err) {
        // keep fallback data silently
      } finally {
        setLoading(false)
      }
    }
    load()
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const statCards = [
    { label:'Total Users',     value:stats.totalUsers,     icon:Users,      gradient:'from-brand-500 to-brand-700',  glow:'shadow-brand-300/40'   },
    { label:'Total Residents', value:stats.totalResidents, icon:UserCheck,  gradient:'from-brand-400 to-brand-600',  glow:'shadow-brand-200/40'   },
    { label:'Total Guards',    value:stats.totalGuards,    icon:Shield,     gradient:'from-emerald-400 to-teal-500', glow:'shadow-emerald-200/40' },
    { label:'Visitors Today',  value:stats.visitorsToday,  icon:Eye,        gradient:'from-amber-400 to-orange-500', glow:'shadow-orange-200/40'  },
  ]

  return (
    <div className="p-6 space-y-8 min-h-screen">

      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <h1 className="text-2xl font-extrabold text-brand-950 tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-brand-400 mt-1">Full society overview & analytics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((s, i) => <StatCard key={s.label} {...s} delay={i * 100} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className={`lg:col-span-2 bg-white rounded-2xl border border-brand-100 shadow-sm p-5
          transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-sm font-bold text-brand-950 mb-4">Visitors This Week</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={visitorsPerDay} barSize={28}>
              <XAxis dataKey="day" tick={{ fontSize:11, fill:'#a795f0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#a795f0' }} axisLine={false} tickLine={false} />
              <Tooltip content={<BarTooltip />} cursor={{ fill:'#f5f4fe' }} />
              <Bar dataKey="visitors" fill="#784add" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`bg-white rounded-2xl border border-brand-100 shadow-sm p-5
          transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-sm font-bold text-brand-950 mb-4">Complaints by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={complaintsByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {complaintsByCategory.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize:11, color:'#2c185d' }}>{v}</span>} />
              <Tooltip formatter={(v,n) => [v,n]} contentStyle={{ borderRadius:12, border:'1px solid #edebfc', fontSize:12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Quick stats */}
        <div className={`lg:col-span-2 bg-white rounded-2xl border border-brand-100 shadow-sm p-5
          transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-sm font-bold text-brand-950 mb-4">Society Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label:'Pending Visitors',  value:stats.pendingVisitors,  color:'bg-amber-50 text-amber-700 border-amber-100'   },
              { label:'Open Complaints',   value:stats.openComplaints,   color:'bg-red-50 text-red-600 border-red-100'         },
              { label:'Active Alerts',     value:stats.activeAlerts,     color:'bg-red-50 text-red-600 border-red-100'         },
              { label:'Total Residents',   value:stats.totalResidents,   color:'bg-emerald-50 text-emerald-700 border-emerald-100' },
              { label:'Total Guards',      value:stats.totalGuards,      color:'bg-brand-50 text-brand-700 border-brand-100'   },
              { label:'Visitors Today',    value:stats.visitorsToday,    color:'bg-amber-50 text-amber-700 border-amber-100'   },
            ].map(s => (
              <div key={s.label} className={`rounded-xl border p-3 ${s.color}`}>
                <p className="text-2xl font-extrabold">{loading ? '—' : (s.value ?? 0)}</p>
                <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Alerts */}
        <div className={`bg-white rounded-2xl border border-red-100 shadow-sm p-5
          transition-all duration-700 delay-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} className="text-red-500" />
            <h2 className="text-sm font-bold text-brand-950">Emergency Alerts</h2>
            {stats.activeAlerts > 0 && (
              <span className="ml-auto text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full animate-pulse">
                {stats.activeAlerts} active
              </span>
            )}
          </div>
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
            </div>
          ) : recentAlerts.length === 0 ? (
            <p className="text-sm text-brand-400 text-center py-6">No alerts</p>
          ) : (
            <ul className="space-y-0">
              {recentAlerts.map(a => (
                <li key={a._id} className="flex items-start justify-between gap-2 py-2.5 border-b border-brand-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-brand-900">{a.sentBy?.name || 'Resident'}</p>
                    <p className="text-xs text-brand-400">
                      {a.sentBy?.flat ? `Flat ${a.sentBy.flat} · ` : ''}
                      {new Date(a.createdAt).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0
                    ${!a.resolved ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-emerald-100 text-emerald-700'}`}>
                    {a.resolved ? 'Resolved' : 'Active'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

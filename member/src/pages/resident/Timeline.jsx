import { useEffect, useState } from 'react'
import { Megaphone, Pin, Search, RefreshCw } from 'lucide-react'
import axiosInstance from '../../utils/axiosInstance'

// ── Category config ───────────────────────────────────────────────────────────
const categoryStyle = {
  General:     { badge: 'bg-brand-100 text-brand-700',   dot: 'bg-brand-400',   emoji: '📢' },
  Maintenance: { badge: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-400',   emoji: '🔧' },
  Event:       { badge: 'bg-emerald-100 text-emerald-700',dot: 'bg-emerald-400', emoji: '🎉' },
  Security:    { badge: 'bg-red-100 text-red-600',       dot: 'bg-red-400',     emoji: '🔒' },
  Urgent:      { badge: 'bg-red-500 text-white',         dot: 'bg-red-600',     emoji: '🚨' },
}

// ── Time formatter ────────────────────────────────────────────────────────────
const timeAgo = (date) => {
  const diff = Date.now() - new Date(date)
  const mins = Math.floor(diff / 60000)
  if (mins < 1)   return 'Just now'
  if (mins < 60)  return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  if (days < 7)   return `${days} day${days > 1 ? 's' : ''} ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Timeline Item ─────────────────────────────────────────────────────────────
function TimelineItem({ item, index, isLast }) {
  const [visible, setVisible] = useState(false)
  const cfg = categoryStyle[item.category] || categoryStyle.General

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 100)
    return () => clearTimeout(t)
  }, [index])

  return (
    <div className={`flex gap-4 transition-all duration-600 ease-out
      ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}>

      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Dot */}
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-sm flex-shrink-0
          ${item.pinned ? 'bg-brand-600 ring-4 ring-brand-100' : 'bg-white border-2 border-brand-100'}`}>
          {cfg.emoji}
        </div>
        {/* Line */}
        {!isLast && <div className="w-0.5 flex-1 bg-brand-100 mt-2 mb-0 min-h-6" />}
      </div>

      {/* Card */}
      <div className={`flex-1 bg-white rounded-2xl border shadow-sm p-5 mb-5
        ${item.pinned ? 'border-brand-300 shadow-brand-100/60' : 'border-brand-100'}
        hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>

        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {item.pinned && (
            <span className="flex items-center gap-1 text-xs font-bold text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">
              <Pin size={9} /> Pinned
            </span>
          )}
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.badge}`}>
            {item.category}
          </span>
          {item.category === 'Urgent' && (
            <span className="text-xs font-bold text-red-500 animate-pulse">⚠ Urgent</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-brand-950 text-base mb-1.5">{item.title}</h3>

        {/* Body */}
        <p className="text-sm text-brand-600 leading-relaxed whitespace-pre-line">{item.body}</p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-brand-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
              {item.postedBy?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="text-xs text-brand-500 font-medium">
              {item.postedBy?.name || 'Admin'}
            </span>
          </div>
          <span className="text-xs text-brand-400">{timeAgo(item.createdAt)}</span>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Timeline() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading]   = useState(false)
  const [visible, setVisible]   = useState(false)
  const [search, setSearch]     = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [refreshing, setRefreshing] = useState(false)

  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const { data } = await axiosInstance.get('/announcements')
      setAnnouncements(data)
    } catch { /* show empty */ }
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => {
    load()
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const filtered = announcements.filter(a => {
    const matchSearch = a.title?.toLowerCase().includes(search.toLowerCase()) ||
                        a.body?.toLowerCase().includes(search.toLowerCase())
    const matchCat    = filterCat === 'All' || a.category === filterCat
    return matchSearch && matchCat
  })

  const pinned   = filtered.filter(a => a.pinned)
  const unpinned = filtered.filter(a => !a.pinned)
  const sorted   = [...pinned, ...unpinned]

  return (
    <div className="p-6 space-y-6 min-h-screen">

      {/* Header */}
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-950 tracking-tight flex items-center gap-2">
              <Megaphone size={22} className="text-brand-500" /> Society Announcements
            </h1>
            <p className="text-sm text-brand-400 mt-1">Stay updated with the latest news from your society</p>
          </div>
          <button onClick={() => load(true)} disabled={refreshing}
            className="flex items-center gap-2 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100
              border border-brand-200 px-4 py-2 rounded-xl transition disabled:opacity-60">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`flex flex-wrap items-center gap-3 transition-all duration-700 delay-100
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>

        {/* Search */}
        <div className="relative flex-1 min-w-52 max-w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
          <input type="text" placeholder="Search announcements..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-white border border-brand-100 rounded-xl w-full
                       focus:outline-none focus:ring-2 focus:ring-brand-300 transition
                       text-brand-900 placeholder:text-brand-300" />
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-1 bg-white border border-brand-100 p-1 rounded-xl shadow-sm">
          {['All','General','Maintenance','Event','Security','Urgent'].map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all
                ${filterCat === c ? 'bg-brand-600 text-white shadow-sm' : 'text-brand-400 hover:text-brand-700'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Count badge */}
      {!loading && (
        <p className="text-xs text-brand-400">
          <span className="font-semibold text-brand-600">{sorted.length}</span> announcement{sorted.length !== 1 ? 's' : ''}
          {pinned.length > 0 && <span className="ml-2 text-brand-500">· {pinned.length} pinned</span>}
        </p>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <div className="w-8 h-8 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-sm text-brand-400">Loading announcements...</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-brand-300">
          <Megaphone size={44} className="opacity-30" />
          <p className="text-sm font-medium text-brand-400">No announcements yet</p>
          <p className="text-xs text-brand-300">Check back later for updates from your society</p>
        </div>
      ) : (
        <div className="max-w-2xl">
          {sorted.map((a, i) => (
            <TimelineItem key={a._id} item={a} index={i} isLast={i === sorted.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
}

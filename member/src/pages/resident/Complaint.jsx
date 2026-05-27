import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Select from 'react-select'
import { MessageSquarePlus, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import axiosInstance from '../../utils/axiosInstance'

// ── Config ────────────────────────────────────────────────────────────────────
const categoryOptions = [
  { value: 'Water',       label: '💧 Water'       },
  { value: 'Security',    label: '🔒 Security'    },
  { value: 'Maintenance', label: '🔧 Maintenance' },
  { value: 'Electricity', label: '⚡ Electricity' },
  { value: 'Other',       label: '📋 Other'       },
]

const statusCfg = {
  Open:        { bg: 'bg-red-100',    text: 'text-red-600',     dot: 'bg-red-400',    icon: AlertCircle  },
  'In Progress':{ bg: 'bg-amber-100', text: 'text-amber-700',   dot: 'bg-amber-400',  icon: Clock        },
  Resolved:    { bg: 'bg-emerald-100',text: 'text-emerald-700', dot: 'bg-emerald-400',icon: CheckCircle2 },
}

const categoryColors = {
  Water:       'bg-blue-100 text-blue-700',
  Security:    'bg-red-100 text-red-700',
  Maintenance: 'bg-amber-100 text-amber-700',
  Electricity: 'bg-yellow-100 text-yellow-700',
  Other:       'bg-brand-100 text-brand-700',
}

// ── react-select styles ───────────────────────────────────────────────────────
const selectStyles = (hasError) => ({
  control: (base, state) => ({
    ...base, borderRadius: '0.75rem',
    borderColor: hasError ? '#fca5a5' : state.isFocused ? '#a795f0' : '#c5bcf6',
    backgroundColor: hasError ? '#fef2f2' : '#f5f4fe',
    boxShadow: state.isFocused ? '0 0 0 2px #c5bcf6' : 'none',
    padding: '1px 2px', fontSize: '0.875rem',
    '&:hover': { borderColor: hasError ? '#f87171' : '#a795f0' },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#784add' : state.isFocused ? '#edebfc' : 'white',
    color: state.isSelected ? 'white' : '#2c185d',
    fontSize: '0.875rem', borderRadius: '0.5rem', cursor: 'pointer',
  }),
  singleValue: (base) => ({ ...base, color: '#2c185d' }),
  placeholder: (base) => ({ ...base, color: '#c5bcf6', fontSize: '0.875rem' }),
  menu: (base) => ({ ...base, borderRadius: '0.75rem', overflow: 'hidden', zIndex: 99 }),
  menuList: (base) => ({ ...base, padding: '4px' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base, state) => ({
    ...base, color: state.isFocused ? '#784add' : '#a795f0',
    transition: 'transform 0.2s',
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
  }),
})

const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-brand-700 uppercase tracking-wide">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

const inputCls = (err) =>
  `w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition
   focus:ring-2 focus:ring-brand-300 focus:border-brand-400
   text-brand-900 placeholder:text-brand-300
   ${err ? 'border-red-300 bg-red-50' : 'border-brand-200 bg-brand-50 hover:border-brand-300'}`

// ── Complaint Row ─────────────────────────────────────────────────────────────
function ComplaintRow({ complaint, index, onDelete }) {
  const [visible, setVisible] = useState(false)
  const cfg = statusCfg[complaint.status] || statusCfg.Open
  const StatusIcon = cfg.icon
  useEffect(() => { const t = setTimeout(() => setVisible(true), index * 70); return () => clearTimeout(t) }, [index])

  return (
    <tr className={`border-b border-brand-100 hover:bg-brand-50 transition-all duration-300
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>

      <td className="px-5 py-3.5">
        <p className="font-semibold text-brand-900 text-sm">{complaint.title}</p>
        <p className="text-xs text-brand-400 mt-0.5 line-clamp-1">{complaint.description}</p>
      </td>

      <td className="px-5 py-3.5">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[complaint.category] || 'bg-brand-100 text-brand-700'}`}>
          {complaint.category}
        </span>
      </td>

      <td className="px-5 py-3.5 text-xs text-brand-400">
        {new Date(complaint.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </td>

      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {complaint.status}
        </span>
      </td>

      <td className="px-5 py-3.5">
        {complaint.status === 'Open' && (
          <button onClick={() => onDelete(complaint._id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition">
            <Trash2 size={13} />
          </button>
        )}
      </td>
    </tr>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Complaint() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading]       = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [visible, setVisible]       = useState(false)

  const [form, setForm]     = useState({ title: '', description: '', category: null })
  const [errors, setErrors] = useState({})

  // ── Load complaints ──
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await axiosInstance.get('/complaints')
        setComplaints(data)
      } catch {
        // Show empty list if API not ready
      } finally {
        setLoading(false)
      }
    }
    load()
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const setField = (f) => (e) => { setForm(p => ({ ...p, [f]: e.target.value })); setErrors(er => ({ ...er, [f]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.title.trim())       e.title       = 'Title is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.category)           e.category    = 'Category is required'
    return e
  }

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    try {
      const { data } = await axiosInstance.post('/complaints', {
        title:       form.title,
        description: form.description,
        category:    form.category.value,
      })
      setComplaints(prev => [data, ...prev])
      setForm({ title: '', description: '', category: null })
      toast.success('Complaint submitted!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Delete ──
  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/complaints/${id}`)
      setComplaints(prev => prev.filter(c => c._id !== id))
      toast.success('Complaint deleted')
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  const counts = {
    open:       complaints.filter(c => c.status === 'Open').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved:   complaints.filter(c => c.status === 'Resolved').length,
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">

      {/* Header */}
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
        <h1 className="text-2xl font-extrabold text-brand-950 tracking-tight">Help Desk</h1>
        <p className="text-sm text-brand-400 mt-1">Submit and track your complaints</p>
      </div>

      {/* Stat Pills */}
      <div className={`flex flex-wrap gap-3 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        {[
          { label: 'Open',        value: counts.open,       color: 'bg-red-500'     },
          { label: 'In Progress', value: counts.inProgress, color: 'bg-amber-500'   },
          { label: 'Resolved',    value: counts.resolved,   color: 'bg-emerald-500' },
        ].map(p => (
          <div key={p.label} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${p.color} shadow-sm`}>
            <span className="text-xl font-extrabold text-white">{p.value}</span>
            <span className="text-xs font-medium text-white/80">{p.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Submit Form ── */}
        <div className={`bg-white rounded-2xl border border-brand-100 shadow-sm p-6
          transition-all duration-700 delay-150 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-sm font-bold text-brand-950 mb-5 flex items-center gap-2">
            <MessageSquarePlus size={16} className="text-brand-500" /> New Complaint
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Title" error={errors.title}>
              <input type="text" value={form.title} onChange={setField('title')}
                placeholder="Brief title of the issue" className={inputCls(errors.title)} />
            </Field>

            <Field label="Category" error={errors.category}>
              <Select
                options={categoryOptions}
                value={form.category}
                onChange={opt => { setForm(f => ({ ...f, category: opt })); setErrors(er => ({ ...er, category: '' })) }}
                placeholder="Select category..."
                styles={selectStyles(!!errors.category)}
                isSearchable={false}
              />
            </Field>

            <Field label="Description" error={errors.description}>
              <textarea value={form.description} onChange={setField('description')}
                placeholder="Describe the issue in detail..."
                rows={4}
                className={`${inputCls(errors.description)} resize-none`} />
            </Field>

            <button type="submit" disabled={submitting}
              className="w-full py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700
                active:scale-95 rounded-xl transition shadow-md shadow-brand-300/30
                disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {submitting
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <MessageSquarePlus size={15} />}
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>

        {/* ── Complaints Table ── */}
        <div className={`lg:col-span-2 bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden
          transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

          <div className="px-5 py-4 border-b border-brand-100">
            <h2 className="text-sm font-bold text-brand-950">My Complaints</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-50 border-b border-brand-100">
                  {['Title','Category','Date','Status','Action'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                      <p className="text-sm text-brand-400">Loading...</p>
                    </div>
                  </td></tr>
                )}
                {!loading && complaints.map((c, i) => (
                  <ComplaintRow key={c._id} complaint={c} index={i} onDelete={handleDelete} />
                ))}
                {!loading && complaints.length === 0 && (
                  <tr><td colSpan={5} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <MessageSquarePlus size={30} className="text-brand-200" />
                      <p className="text-sm text-brand-400">No complaints yet</p>
                      <p className="text-xs text-brand-300">Submit your first complaint using the form</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

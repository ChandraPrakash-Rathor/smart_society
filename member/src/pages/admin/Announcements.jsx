import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Select from 'react-select'
import { Pin, PinOff, Pencil, Trash2, Plus, Megaphone, Mail, Check } from 'lucide-react'
import axiosInstance from '../../utils/axiosInstance'
import Modal from '../../components/Modal'

// ── Config ────────────────────────────────────────────────────────────────────
const categoryOptions = [
  { value: 'General',     label: '📢 General'     },
  { value: 'Maintenance', label: '🔧 Maintenance' },
  { value: 'Event',       label: '🎉 Event'       },
  { value: 'Security',    label: '🔒 Security'    },
  { value: 'Urgent',      label: '🚨 Urgent'      },
]

const categoryStyle = {
  General:     'bg-brand-100 text-brand-700',
  Maintenance: 'bg-amber-100 text-amber-700',
  Event:       'bg-emerald-100 text-emerald-700',
  Security:    'bg-red-100 text-red-600',
  Urgent:      'bg-red-500 text-white',
}

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

// ── Post / Edit Modal ─────────────────────────────────────────────────────────
function AnnouncementModal({ open, onClose, onSave, initial }) {
  const isEdit = !!initial
  const empty  = { title: '', body: '', category: null, pinned: false }
  const [form, setForm]     = useState(empty)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initial) {
      setForm({
        title:    initial.title,
        body:     initial.body,
        category: categoryOptions.find(o => o.value === initial.category) || null,
        pinned:   initial.pinned,
      })
    } else {
      setForm(empty)
    }
    setErrors({})
  }, [initial, open])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title    = 'Title is required'
    if (!form.body.trim())  e.body     = 'Content is required'
    if (!form.category)     e.category = 'Category is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await onSave({
        title:    form.title,
        body:     form.body,
        category: form.category.value,
        pinned:   form.pinned,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Announcement' : 'New Announcement'} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Title" error={errors.title}>
          <input type="text" value={form.title}
            onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(er => ({ ...er, title: '' })) }}
            placeholder="Announcement title" className={inputCls(errors.title)} />
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

        <Field label="Content" error={errors.body}>
          <textarea value={form.body} rows={5}
            onChange={e => { setForm(f => ({ ...f, body: e.target.value })); setErrors(er => ({ ...er, body: '' })) }}
            placeholder="Write your announcement here..."
            className={`${inputCls(errors.body)} resize-none`} />
        </Field>

        {/* Pin toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div onClick={() => setForm(f => ({ ...f, pinned: !f.pinned }))}
            className={`w-10 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5
              ${form.pinned ? 'bg-brand-600' : 'bg-brand-200'}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
              ${form.pinned ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
          <span className="text-sm font-medium text-brand-700">Pin this announcement</span>
        </label>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-brand-100">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95
              rounded-xl transition shadow-md shadow-brand-300/30 disabled:opacity-60 flex items-center gap-2">
            {saving
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Check size={14} />}
            {isEdit ? 'Save Changes' : 'Post Announcement'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function EmailMembersModal({ open, onClose }) {
  const [form, setForm] = useState({
    subject: '',
    message: '',
    roles: ['resident'],
  })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (open) setForm({ subject: '', message: '', roles: ['resident'] })
  }, [open])

  const toggleRole = (role) => {
    setForm(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(item => item !== role)
        : [...prev.roles, role],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.subject.trim()) { toast.error('Subject is required'); return }
    if (!form.message.trim()) { toast.error('Message is required'); return }
    if (form.roles.length === 0) { toast.error('Select recipients'); return }

    setSending(true)
    try {
      const { data } = await axiosInstance.post('/announcements/email', form)
      toast.success(data.message)
      if (!data.emailConfigured) {
        toast.info('Email credentials are not set, notification saved only')
      }
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Email Members" size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Recipients">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Residents', value: 'resident' },
              { label: 'Guards', value: 'guard' },
              { label: 'Admins', value: 'admin' },
            ].map(role => (
              <button key={role.value} type="button" onClick={() => toggleRole(role.value)}
                className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${
                  form.roles.includes(role.value)
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-brand-100 bg-brand-50 text-brand-500 hover:border-brand-300'
                }`}>
                {role.label}
              </button>
            ))}
            <button type="button" onClick={() => setForm(prev => ({ ...prev, roles: ['resident', 'guard', 'admin'] }))}
              className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 transition hover:border-emerald-300">
              All
            </button>
          </div>
        </Field>

        <Field label="Subject">
          <input value={form.subject} onChange={e => setForm(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="e.g. Water supply maintenance"
            className={inputCls(false)} />
        </Field>

        <Field label="Message">
          <textarea value={form.message} rows={6}
            onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Write email message..."
            className={`${inputCls(false)} resize-none`} />
        </Field>

        <div className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-xs text-brand-500">
          This also creates in-app notifications for selected users.
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-brand-100 pt-3">
          <button type="button" onClick={onClose}
            className="rounded-xl bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-100">
            Cancel
          </button>
          <button type="submit" disabled={sending}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-300/30 transition hover:bg-brand-700 disabled:opacity-60">
            {sending ? <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : <Mail size={14} />}
            Send Email
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Announcement Card ─────────────────────────────────────────────────────────
function AnnouncementCard({ item, index, onEdit, onDelete, onPin }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), index * 80); return () => clearTimeout(t) }, [index])

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date)
    const mins = Math.floor(diff / 60000)
    if (mins < 60)  return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)   return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 transition-all duration-500
      ${item.pinned ? 'border-brand-300 shadow-brand-100' : 'border-brand-100'}
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {item.pinned && (
            <span className="flex items-center gap-1 text-xs font-bold text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">
              <Pin size={10} /> Pinned
            </span>
          )}
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${categoryStyle[item.category] || 'bg-brand-100 text-brand-700'}`}>
            {item.category}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={() => onPin(item._id)} title={item.pinned ? 'Unpin' : 'Pin'}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition
              ${item.pinned ? 'bg-brand-100 text-brand-600 hover:bg-brand-200' : 'bg-brand-50 text-brand-400 hover:bg-brand-100 hover:text-brand-600'}`}>
            {item.pinned ? <PinOff size={13} /> : <Pin size={13} />}
          </button>
          <button onClick={() => onEdit(item)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-brand-50 text-brand-400 hover:bg-brand-100 hover:text-brand-600 transition">
            <Pencil size={13} />
          </button>
          <button onClick={() => onDelete(item._id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <h3 className="font-bold text-brand-950 text-base mb-1">{item.title}</h3>
      <p className="text-sm text-brand-600 leading-relaxed whitespace-pre-line">{item.body}</p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-brand-50">
        <span className="text-xs text-brand-400">
          Posted by <span className="font-semibold text-brand-600">{item.postedBy?.name || 'Admin'}</span>
        </span>
        <span className="text-xs text-brand-400">{timeAgo(item.createdAt)}</span>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading]   = useState(false)
  const [visible, setVisible]   = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [filterCat, setFilterCat]   = useState('All')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await axiosInstance.get('/announcements')
        setAnnouncements(data)
      } catch { /* show empty */ }
      finally { setLoading(false) }
    }
    load()
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const openAdd  = ()  => { setEditTarget(null); setModalOpen(true) }
  const openEdit = (a) => { setEditTarget(a);    setModalOpen(true) }

  const handleSave = async (form) => {
    try {
      if (editTarget) {
        const { data } = await axiosInstance.put(`/announcements/${editTarget._id}`, form)
        setAnnouncements(prev => prev.map(a => a._id === data._id ? data : a))
        toast.success('Announcement updated')
      } else {
        const { data } = await axiosInstance.post('/announcements', form)
        setAnnouncements(prev => [data, ...prev])
        toast.success('Announcement posted!')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
      throw err
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return
    try {
      await axiosInstance.delete(`/announcements/${id}`)
      setAnnouncements(prev => prev.filter(a => a._id !== id))
      toast.success('Deleted')
    } catch { toast.error('Delete failed') }
  }

  const handlePin = async (id) => {
    try {
      const { data } = await axiosInstance.patch(`/announcements/${id}/pin`)
      setAnnouncements(prev =>
        prev.map(a => a._id === id ? data : a)
            .sort((a, b) => b.pinned - a.pinned || new Date(b.createdAt) - new Date(a.createdAt))
      )
    } catch { toast.error('Failed to pin') }
  }

  const filtered = announcements.filter(a => filterCat === 'All' || a.category === filterCat)

  return (
    <div className="p-6 space-y-6 min-h-screen">

      {/* Header */}
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-950 tracking-tight">Announcements</h1>
            <p className="text-sm text-brand-400 mt-1">Post updates visible to all residents and guards</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setEmailOpen(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-md shadow-emerald-200/40">
              <Mail size={16} /> Email Members
            </button>
            <button onClick={openAdd}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-md shadow-brand-300/30">
              <Plus size={16} /> New Announcement
            </button>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className={`flex items-center gap-1 bg-white border border-brand-100 p-1 rounded-xl w-fit shadow-sm
        transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        {['All', 'General', 'Maintenance', 'Event', 'Security', 'Urgent'].map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all
              ${filterCat === c ? 'bg-brand-600 text-white shadow-sm' : 'text-brand-400 hover:text-brand-700'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-brand-300">
          <Megaphone size={40} className="opacity-40" />
          <p className="text-sm font-medium text-brand-400">No announcements yet</p>
          <button onClick={openAdd}
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 underline transition">
            Post the first one
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((a, i) => (
            <AnnouncementCard key={a._id} item={a} index={i}
              onEdit={openEdit} onDelete={handleDelete} onPin={handlePin} />
          ))}
        </div>
      )}

      <AnnouncementModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editTarget}
      />
      <EmailMembersModal open={emailOpen} onClose={() => setEmailOpen(false)} />
    </div>
  )
}

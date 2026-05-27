import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import {
  Mail, Phone, Shield, Pencil, X,
  Check, Camera, Calendar, MapPin,
} from 'lucide-react'
import { setCredentials } from '../../features/auth/authSlice'
import axiosInstance from '../../utils/axiosInstance'

// ── Role badge colors ─────────────────────────────────────────────────────────
const roleBadge = {
  admin:    'bg-brand-100 text-brand-700',
  resident: 'bg-emerald-100 text-emerald-700',
  guard:    'bg-amber-100 text-amber-700',
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }) {
  return (
    <div className="flex-1 bg-brand-50 rounded-2xl p-4 text-center border border-brand-100">
      <p className="text-2xl font-extrabold text-brand-700">{value}</p>
      <p className="text-xs font-semibold text-brand-900 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-brand-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-brand-50 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-brand-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-brand-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-brand-900 mt-0.5 truncate">{value || '—'}</p>
      </div>
    </div>
  )
}

// ── Edit field ────────────────────────────────────────────────────────────────
function EditField({ label, name, value, onChange, type = 'text', disabled = false }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-brand-700 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition
          text-brand-900 placeholder:text-brand-300
          ${disabled
            ? 'bg-brand-50 border-brand-100 text-brand-400 cursor-not-allowed'
            : 'bg-brand-50 border-brand-200 hover:border-brand-300 focus:ring-2 focus:ring-brand-300 focus:border-brand-400'}`}
      />
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Profile() {
  const dispatch = useDispatch()
  const user     = useSelector(state => state.auth.user)

  const [editing, setEditing]   = useState(false)
  const [saving,  setSaving]    = useState(false)
  const [visible, setVisible]   = useState(false)
  const [form, setForm]         = useState({ name: '', phone: '' })

  // Animate in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  // Sync form with user data
  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '' })
  }, [user])

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name cannot be empty'); return }
    setSaving(true)
    try {
      const { data } = await axiosInstance.put('/auth/me', form)
      // Update Redux + localStorage
      dispatch(setCredentials({ user: data, token: localStorage.getItem('token') }))
      toast.success('Profile updated!')
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm({ name: user?.name || '', phone: user?.phone || '' })
    setEditing(false)
  }

  // Avatar initials
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  // Member since
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A'

  return (
    <div className={`p-6 min-h-screen transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Page heading ── */}
        <div>
          <h1 className="text-2xl font-extrabold text-brand-950 tracking-tight">My Profile</h1>
          <p className="text-sm text-brand-400 mt-1">View and manage your account details</p>
        </div>

        {/* ── Profile Card ── */}
        <div className="bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden">

          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-brand-700 via-brand-500 to-brand-400 relative">
            {/* Decorative circles */}
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute right-16 -bottom-4 w-16 h-16 rounded-full bg-white/10" />
          </div>

          {/* Avatar + name row */}
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-5">

              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400
                  border-4 border-white shadow-lg flex items-center justify-center
                  text-white text-2xl font-extrabold select-none">
                  {initials}
                </div>
                {/* Camera icon overlay */}
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-600 hover:bg-brand-700
                  rounded-full flex items-center justify-center shadow-md transition">
                  <Camera size={12} className="text-white" />
                </button>
              </div>

              {/* Edit / Save buttons */}
              <div className="flex items-center gap-2 pb-1">
                {!editing ? (
                  <button onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold
                      bg-brand-600 hover:bg-brand-700 active:scale-95 text-white
                      rounded-xl transition shadow-md shadow-brand-300/30">
                    <Pencil size={14} /> Edit Profile
                  </button>
                ) : (
                  <>
                    <button onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold
                        text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition">
                      <X size={14} /> Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold
                        text-white bg-brand-600 hover:bg-brand-700 active:scale-95
                        rounded-xl transition shadow-md shadow-brand-300/30
                        disabled:opacity-60 disabled:cursor-not-allowed">
                      {saving
                        ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : <Check size={14} />}
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Name + role */}
            <div className="mb-5">
              <h2 className="text-xl font-bold text-brand-950">{user?.name || 'User'}</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${roleBadge[user?.role] || roleBadge.resident}`}>
                  {user?.role}
                </span>
                <span className="flex items-center gap-1 text-xs text-brand-400">
                  <Calendar size={11} /> Member since {memberSince}
                </span>
              </div>
            </div>

            {/* ── View mode ── */}
            {!editing && (
              <div className="space-y-0">
                <InfoRow icon={Mail}   label="Email Address" value={user?.email}  />
                <InfoRow icon={Phone}  label="Phone Number"  value={user?.phone}  />
                <InfoRow icon={Shield} label="Role"          value={user?.role}   />
                <InfoRow icon={MapPin} label="Member ID"     value={user?._id?.slice(-8).toUpperCase()} />
              </div>
            )}

            {/* ── Edit mode ── */}
            {editing && (
              <div className="space-y-4 pt-2">
                <EditField label="Full Name"    name="name"  value={form.name}  onChange={handleChange} />
                <EditField label="Phone Number" name="phone" value={form.phone} onChange={handleChange} type="tel" />
                <EditField label="Email Address" name="email" value={user?.email || ''} onChange={() => {}} disabled />
                <EditField label="Role"          name="role"  value={user?.role  || ''} onChange={() => {}} disabled />
                <p className="text-xs text-brand-400">* Email and Role cannot be changed</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="flex gap-4">
          <StatCard label="Visitors"  value="—" sub="Total added" />
          <StatCard label="Staff"     value="—" sub="Managed"     />
          <StatCard label="Approvals" value="—" sub="This month"  />
        </div>

        {/* ── Account Info Card ── */}
        <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-brand-950 mb-4">Account Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-brand-50 rounded-xl p-3 border border-brand-100">
              <p className="text-xs text-brand-400 font-medium">Account Status</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm font-semibold text-brand-900">Active</span>
              </div>
            </div>
            <div className="bg-brand-50 rounded-xl p-3 border border-brand-100">
              <p className="text-xs text-brand-400 font-medium">Last Login</p>
              <p className="text-sm font-semibold text-brand-900 mt-1">Today</p>
            </div>
            <div className="bg-brand-50 rounded-xl p-3 border border-brand-100">
              <p className="text-xs text-brand-400 font-medium">Member ID</p>
              <p className="text-sm font-semibold text-brand-900 mt-1 font-mono">
                #{user?._id?.slice(-8).toUpperCase() || 'N/A'}
              </p>
            </div>
            <div className="bg-brand-50 rounded-xl p-3 border border-brand-100">
              <p className="text-xs text-brand-400 font-medium">Joined</p>
              <p className="text-sm font-semibold text-brand-900 mt-1">{memberSince}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

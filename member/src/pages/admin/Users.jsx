import { useEffect, useState } from 'react'
import { Search, Pencil, Trash2, ShieldOff, ShieldCheck, UserPlus, Plus, X } from 'lucide-react'
import Select from 'react-select'
import Modal from '../../components/Modal'
import { toast } from 'react-toastify'
import axiosInstance from '../../utils/axiosInstance'

// ── Static data ───────────────────────────────────────────────────────────────
const initialUsers = [
  { id: 1, name: 'Chandra Prakash', email: 'chandra@example.com', role: 'resident', status: 'Active',  joined: 'Jan 10, 2026', flat: 'A-204', phone: '9876543210' },
  { id: 2, name: 'Ramesh Guard',    email: 'ramesh@example.com',  role: 'guard',    status: 'Active',  joined: 'Feb 05, 2026', phone: '9123456780' },
  { id: 3, name: 'Sunita Devi',     email: 'sunita@example.com',  role: 'resident', status: 'Blocked', joined: 'Mar 01, 2026', flat: 'B-102', phone: '9001234567' },
  { id: 4, name: 'Admin User',      email: 'admin@example.com',   role: 'admin',    status: 'Active',  joined: 'Jan 01, 2026', phone: '9988776655' },
  { id: 5, name: 'Priya Sharma',    email: 'priya@example.com',   role: 'resident', status: 'Active',  joined: 'Apr 10, 2026', flat: 'C-301', phone: '9871234560' },
  { id: 6, name: 'Mohan Guard',     email: 'mohan@example.com',   role: 'guard',    status: 'Active',  joined: 'Apr 15, 2026', phone: '9765432100' },
]

// ── Config ────────────────────────────────────────────────────────────────────
const roleOptions = [
  { value: 'all',      label: 'All Roles' },
  { value: 'admin',    label: 'Admin'     },
  { value: 'resident', label: 'Resident'  },
  { value: 'guard',    label: 'Guard'     },
]
const roleOpts = roleOptions.filter(r => r.value !== 'all')

const shiftOptions = [
  { value: 'Morning', label: 'Morning (6AM - 2PM)' },
  { value: 'Evening', label: 'Evening (2PM - 10PM)' },
  { value: 'Night',   label: 'Night (10PM - 6AM)'  },
]

const relationOptions = [
  { value: 'Spouse',   label: 'Spouse'   },
  { value: 'Son',      label: 'Son'      },
  { value: 'Daughter', label: 'Daughter' },
  { value: 'Parent',   label: 'Parent'   },
  { value: 'Sibling',  label: 'Sibling'  },
  { value: 'Other',    label: 'Other'    },
]

const roleBadge = {
  admin:    'bg-brand-100 text-brand-700',
  resident: 'bg-emerald-100 text-emerald-700',
  guard:    'bg-amber-100 text-amber-700',
}
const avatarColors = ['bg-brand-500','bg-brand-600','bg-emerald-500','bg-amber-500','bg-teal-500','bg-rose-500']

// ── Shared select styles ──────────────────────────────────────────────────────
const sel = (err) => ({
  control: (b, s) => ({ ...b, borderRadius:'0.75rem', borderColor: err?'#fca5a5':s.isFocused?'#a795f0':'#c5bcf6', backgroundColor: err?'#fef2f2':'#f5f4fe', boxShadow: s.isFocused?'0 0 0 2px #c5bcf6':'none', padding:'1px 2px', fontSize:'0.875rem', '&:hover':{ borderColor: err?'#f87171':'#a795f0' } }),
  option: (b, s) => ({ ...b, backgroundColor: s.isSelected?'#784add':s.isFocused?'#edebfc':'white', color: s.isSelected?'white':'#2c185d', fontSize:'0.875rem', borderRadius:'0.5rem', cursor:'pointer' }),
  singleValue: (b) => ({ ...b, color:'#2c185d' }),
  placeholder: (b) => ({ ...b, color:'#c5bcf6', fontSize:'0.875rem' }),
  menu: (b) => ({ ...b, borderRadius:'0.75rem', overflow:'hidden', zIndex:99 }),
  menuList: (b) => ({ ...b, padding:'4px' }),
  indicatorSeparator: () => ({ display:'none' }),
  dropdownIndicator: (b) => ({ ...b, color:'#a795f0', padding:'0 6px' }),
})

// ── Reusable field ────────────────────────────────────────────────────────────
const inp = (err) =>
  `w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition focus:ring-2 focus:ring-brand-300 focus:border-brand-400 text-brand-900 placeholder:text-brand-300 ${err?'border-red-300 bg-red-50':'border-brand-200 bg-brand-50 hover:border-brand-300'}`

const Field = ({ label, error, half, children }) => (
  <div className={`flex flex-col gap-1 ${half ? 'flex-1 min-w-0' : ''}`}>
    <label className="text-xs font-semibold text-brand-700 uppercase tracking-wide">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-2 pt-2">
    <div className="flex-1 h-px bg-brand-100" />
    <span className="text-xs font-bold text-brand-500 uppercase tracking-widest whitespace-nowrap">{children}</span>
    <div className="flex-1 h-px bg-brand-100" />
  </div>
)

// ── Add/Edit User Modal ───────────────────────────────────────────────────────
function UserModal({ open, onClose, initial, onSave }) {
  const isEdit = !!initial

  const emptyForm = {
    name: '', email: '', password: '', phone: '',
    role: null,
    // resident
    flat: '', memberSince: '',
    familyMembers: [],
    emergencyName: '', emergencyRelation: '', emergencyPhone: '',
    // guard
    shift: null, assignedGate: '',
  }

  const [form, setForm]     = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [tab, setTab]       = useState('basic') // 'basic' | 'resident' | 'guard'

  useEffect(() => {
    if (!open) return
    if (initial) {
      setForm({
        name:            initial.name || '',
        email:           initial.email || '',
        password:        '',
        phone:           initial.phone || '',
        role:            roleOpts.find(r => r.value === initial.role) || null,
        flat:            initial.flat || '',
        memberSince:     initial.memberSince || '',
        familyMembers:   initial.familyMembers || [],
        emergencyName:   initial.emergencyContact?.name || '',
        emergencyRelation: initial.emergencyContact?.relation || '',
        emergencyPhone:  initial.emergencyContact?.phone || '',
        shift:           shiftOptions.find(s => s.value === initial.shift) || null,
        assignedGate:    initial.assignedGate || '',
      })
    } else {
      setForm(emptyForm)
    }
    setErrors({})
    setTab('basic')
  }, [initial, open])

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))
  const setSelect = (f) => (opt) => { setForm(p => ({ ...p, [f]: opt })); setErrors(er => ({ ...er, [f]: '' })) }

  const currentRole = form.role?.value

  // Family member helpers
  const addFamily = () => setForm(p => ({ ...p, familyMembers: [...p.familyMembers, { name:'', relation: null, age:'', phone:'' }] }))
  const removeFamily = (i) => setForm(p => ({ ...p, familyMembers: p.familyMembers.filter((_,idx) => idx !== i) }))
  const setFamily = (i, field, val) => setForm(p => {
    const arr = [...p.familyMembers]
    arr[i] = { ...arr[i], [field]: val }
    return { ...p, familyMembers: arr }
  })

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!isEdit && form.password.length < 6) e.password = 'Min 6 characters'
    if (!form.role) e.role = 'Required'
    if (currentRole === 'resident' && !form.flat.trim()) e.flat = 'Required'
    if (currentRole === 'guard' && !form.shift) e.shift = 'Required'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); setTab('basic'); return }

    const payload = {
      ...(initial || { id: Date.now(), status: 'Active', joined: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) }),
      name: form.name, email: form.email, phone: form.phone,
      role: form.role.value,
      ...(currentRole === 'resident' && {
        flat: form.flat,
        memberSince: form.memberSince,
        familyMembers: form.familyMembers.map(m => ({ ...m, relation: m.relation?.value || m.relation })),
        emergencyContact: { name: form.emergencyName, relation: form.emergencyRelation, phone: form.emergencyPhone },
      }),
      ...(currentRole === 'guard' && {
        shift: form.shift?.value,
        assignedGate: form.assignedGate,
      }),
    }
    onSave(payload)
    onClose()
  }

  // Tab labels — show resident/guard tab only when role selected
  const tabs = [
    { key: 'basic', label: 'Basic Info' },
    ...(currentRole === 'resident' ? [{ key: 'resident', label: 'Resident Details' }] : []),
    ...(currentRole === 'guard'    ? [{ key: 'guard',    label: 'Guard Details'    }] : []),
  ]

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit User' : 'Add New User'} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-0">

        {/* Tab bar */}
        <div className="flex gap-1 bg-brand-50 border border-brand-100 p-1 rounded-xl mb-5">
          {tabs.map(t => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all
                ${tab === t.key ? 'bg-brand-600 text-white shadow-sm' : 'text-brand-400 hover:text-brand-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── BASIC INFO TAB ── */}
        {tab === 'basic' && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <Field label="Full Name" error={errors.name} half>
                <input value={form.name} onChange={set('name')} placeholder="e.g. John Doe" className={inp(errors.name)} />
              </Field>
              <Field label="Phone" half>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="10-digit" className={inp(false)} />
              </Field>
            </div>
            <Field label="Email Address" error={errors.email}>
              <input type="email" value={form.email} onChange={set('email')} placeholder="user@example.com" className={inp(errors.email)} />
            </Field>
            {!isEdit && (
              <Field label="Password" error={errors.password}>
                <input type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" className={inp(errors.password)} />
              </Field>
            )}
            <Field label="Role" error={errors.role}>
              <Select options={roleOpts} value={form.role} onChange={(opt) => { setSelect('role')(opt); setTab('basic') }}
                styles={sel(!!errors.role)} isSearchable={false} placeholder="Select role..." />
            </Field>
            {currentRole && currentRole !== 'basic' && (
              <p className="text-xs text-brand-400 bg-brand-50 border border-brand-100 rounded-xl px-3 py-2">
                {currentRole === 'resident' && '👉 Go to "Resident Details" tab to fill flat, family & emergency info'}
                {currentRole === 'guard'    && '👉 Go to "Guard Details" tab to fill shift & gate info'}
              </p>
            )}
          </div>
        )}

        {/* ── RESIDENT DETAILS TAB ── */}
        {tab === 'resident' && (
          <div className="flex flex-col gap-4">

            <SectionTitle>Flat & Membership</SectionTitle>
            <div className="flex gap-3">
              <Field label="Flat Number" error={errors.flat} half>
                <input value={form.flat} onChange={set('flat')} placeholder="e.g. A-204" className={inp(errors.flat)} />
              </Field>
              <Field label="Member Since" half>
                <input type="date" value={form.memberSince} onChange={set('memberSince')} className={inp(false)} />
              </Field>
            </div>

            <SectionTitle>Family Members</SectionTitle>
            {form.familyMembers.map((m, i) => (
              <div key={i} className="bg-brand-50 border border-brand-100 rounded-xl p-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-600">Member {i + 1}</span>
                  <button type="button" onClick={() => removeFamily(i)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition">
                    <X size={12} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input value={m.name} onChange={e => setFamily(i,'name',e.target.value)}
                    placeholder="Full name" className={`${inp(false)} flex-1`} />
                  <div className="w-36">
                    <Select options={relationOptions} value={relationOptions.find(r=>r.value===m.relation)||null}
                      onChange={opt => setFamily(i,'relation',opt?.value||'')}
                      styles={sel(false)} isSearchable={false} placeholder="Relation" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <input type="number" value={m.age} onChange={e => setFamily(i,'age',e.target.value)}
                    placeholder="Age" className={`${inp(false)} w-24`} />
                  <input type="tel" value={m.phone} onChange={e => setFamily(i,'phone',e.target.value)}
                    placeholder="Phone (optional)" className={`${inp(false)} flex-1`} />
                </div>
              </div>
            ))}
            <button type="button" onClick={addFamily}
              className="flex items-center gap-2 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 border-dashed px-4 py-2.5 rounded-xl transition">
              <Plus size={14} /> Add Family Member
            </button>

            <SectionTitle>Emergency Contact</SectionTitle>
            <div className="flex gap-3">
              <Field label="Contact Name" half>
                <input value={form.emergencyName} onChange={set('emergencyName')} placeholder="e.g. Rahul Sharma" className={inp(false)} />
              </Field>
              <Field label="Relation" half>
                <input value={form.emergencyRelation} onChange={set('emergencyRelation')} placeholder="e.g. Brother" className={inp(false)} />
              </Field>
            </div>
            <Field label="Emergency Phone">
              <input type="tel" value={form.emergencyPhone} onChange={set('emergencyPhone')} placeholder="10-digit number" className={inp(false)} />
            </Field>
          </div>
        )}

        {/* ── GUARD DETAILS TAB ── */}
        {tab === 'guard' && (
          <div className="flex flex-col gap-4">
            <SectionTitle>Duty Information</SectionTitle>
            <Field label="Shift" error={errors.shift}>
              <Select options={shiftOptions} value={form.shift} onChange={setSelect('shift')}
                styles={sel(!!errors.shift)} isSearchable={false} placeholder="Select shift..." />
            </Field>
            <Field label="Assigned Gate">
              <input value={form.assignedGate} onChange={set('assignedGate')} placeholder="e.g. Main Gate, Gate 2" className={inp(false)} />
            </Field>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-5 mt-2 border-t border-brand-100">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition">
            Cancel
          </button>
          <button type="submit"
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 rounded-xl transition shadow-md shadow-brand-300/30">
            {isEdit ? 'Save Changes' : 'Add User'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ open, onClose, user, onConfirm }) {
  if (!user) return null
  return (
    <Modal open={open} onClose={onClose} title="Delete User" size="sm">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <div>
          <p className="font-bold text-brand-950">Delete {user.name}?</p>
          <p className="text-sm text-brand-400 mt-1">This cannot be undone.</p>
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition">
            Cancel
          </button>
          <button onClick={() => { onConfirm(user.id); onClose() }}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 active:scale-95 rounded-xl transition shadow-md">
            Delete
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── View Details Modal ────────────────────────────────────────────────────────
function ViewModal({ open, onClose, user }) {
  if (!user) return null
  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const InfoRow = ({ label, value }) => value ? (
    <div className="flex items-start justify-between py-2.5 border-b border-brand-50 last:border-0 gap-4">
      <span className="text-xs font-semibold text-brand-400 uppercase tracking-wide flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-brand-900 text-right">{value}</span>
    </div>
  ) : null

  return (
    <Modal open={open} onClose={onClose} title="User Details" size="md">
      <div className="space-y-4">

        {/* Avatar + name */}
        <div className="flex items-center gap-4 pb-4 border-b border-brand-100">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-extrabold flex-shrink-0 ${avatarColors[user.id % avatarColors.length]}`}>
            {initials}
          </div>
          <div>
            <p className="text-lg font-bold text-brand-950">{user.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${roleBadge[user.role]}`}>{user.role}</span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>{user.status}</span>
            </div>
          </div>
        </div>

        {/* Basic info */}
        <div>
          <InfoRow label="Email"   value={user.email}  />
          <InfoRow label="Phone"   value={user.phone}  />
          <InfoRow label="Joined"  value={user.joined} />
        </div>

        {/* Resident details */}
        {user.role === 'resident' && (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-brand-100" />
              <span className="text-xs font-bold text-brand-500 uppercase tracking-widest">Resident Info</span>
              <div className="flex-1 h-px bg-brand-100" />
            </div>
            <div>
              <InfoRow label="Flat"         value={user.flat} />
              <InfoRow label="Member Since" value={user.memberSince} />
            </div>

            {/* Family members */}
            {user.familyMembers?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-2">Family Members</p>
                <div className="space-y-2">
                  {user.familyMembers.map((m, i) => (
                    <div key={i} className="flex items-center justify-between bg-brand-50 rounded-xl px-3 py-2.5 border border-brand-100">
                      <div>
                        <p className="text-sm font-semibold text-brand-900">{m.name}</p>
                        <p className="text-xs text-brand-400">{m.relation}{m.age ? ` · Age ${m.age}` : ''}</p>
                      </div>
                      {m.phone && <p className="text-xs text-brand-600">{m.phone}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency contact */}
            {user.emergencyContact?.name && (
              <div>
                <p className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-2">Emergency Contact</p>
                <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                  <p className="text-sm font-semibold text-brand-900">{user.emergencyContact.name}</p>
                  <p className="text-xs text-brand-400">{user.emergencyContact.relation}</p>
                  <p className="text-xs text-brand-600 mt-0.5">{user.emergencyContact.phone}</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Guard details */}
        {user.role === 'guard' && (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-brand-100" />
              <span className="text-xs font-bold text-brand-500 uppercase tracking-widest">Guard Info</span>
              <div className="flex-1 h-px bg-brand-100" />
            </div>
            <div>
              <InfoRow label="Shift"         value={user.shift}       />
              <InfoRow label="Assigned Gate" value={user.assignedGate} />
            </div>
          </>
        )}

        <button onClick={onClose}
          className="w-full py-2.5 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition mt-2">
          Close
        </button>
      </div>
    </Modal>
  )
}

// ── User Row ──────────────────────────────────────────────────────────────────
function UserRow({ user, index, onEdit, onDelete, onView, onToggleBlock }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), index * 60); return () => clearTimeout(t) }, [index])
  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <tr className={`border-b border-brand-100 hover:bg-brand-50 transition-all duration-300
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>

      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColors[user.id % avatarColors.length]}`}>
            {initials}
          </div>
          <div>
            <p className="font-semibold text-brand-900 text-sm">{user.name}</p>
            <p className="text-xs text-brand-400">
              {user.role === 'resident' && user.flat ? `Flat ${user.flat} · ` : ''}
              {user.joined}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-3.5 text-sm text-brand-600">{user.email}</td>

      <td className="px-5 py-3.5">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${roleBadge[user.role]}`}>
          {user.role}
        </span>
      </td>

      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full
          ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
          {user.status}
        </span>
      </td>

      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          {/* View */}
          <button onClick={() => onView(user)} title="View Details"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-100 text-brand-600 hover:bg-brand-200 transition">
            <Search size={13} />
          </button>
          {/* Edit */}
          <button onClick={() => onEdit(user)} title="Edit"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-100 text-brand-600 hover:bg-brand-200 transition">
            <Pencil size={13} />
          </button>
          {/* Block / Unblock */}
          <button onClick={() => onToggleBlock(user.id)} title={user.status === 'Active' ? 'Block' : 'Unblock'}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition
              ${user.status === 'Active' ? 'bg-amber-50 text-amber-500 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100'}`}>
            {user.status === 'Active' ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
          </button>
          {/* Delete */}
          <button onClick={() => onDelete(user)} title="Delete"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition">
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [roleFilter, setRoleFilter] = useState(roleOptions[0])
  const [visible, setVisible]       = useState(false)

  const [userModal,   setUserModal]   = useState({ open: false, user: null })
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null })
  const [viewModal,   setViewModal]   = useState({ open: false, user: null })

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosInstance.get('/users')
        // normalize _id → id for compatibility
        setUsers(data.map(u => ({ ...u, id: u._id, status: u.isActive ? 'Active' : 'Blocked', joined: new Date(u.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) })))
      } catch { setUsers(initialUsers) }
      finally { setLoading(false) }
    }
    load()
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const openAdd  = ()  => setUserModal({ open: true, user: null })
  const openEdit = (u) => setUserModal({ open: true, user: u })
  const openDel  = (u) => setDeleteModal({ open: true, user: u })
  const openView = (u) => setViewModal({ open: true, user: u })

  const handleSave = async (saved) => {
    try {
      if (saved._id) {
        const { data } = await axiosInstance.put(`/users/${saved._id}`, saved)
        setUsers(prev => prev.map(u => u._id === data._id ? { ...data, id: data._id, status: data.isActive ? 'Active' : 'Blocked', joined: u.joined } : u))
        toast.success('User updated')
      } else {
        const { data } = await axiosInstance.post('/users', { ...saved, password: saved.password || 'changeme123' })
        setUsers(prev => [{ ...data, id: data._id, status: 'Active', joined: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) }, ...prev])
        toast.success('User added')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const handleDelete = async (id) => {
    const user = users.find(u => u.id === id || u._id === id)
    try {
      await axiosInstance.delete(`/users/${user?._id || id}`)
    } catch { /* demo */ }
    setUsers(prev => prev.filter(u => u.id !== id && u._id !== id))
    toast.success('User deleted')
  }

  const handleToggleBlock = async (id) => {
    const user = users.find(u => u.id === id || u._id === id)
    const newActive = user?.status !== 'Active'
    try {
      await axiosInstance.put(`/users/${user?._id || id}`, { isActive: newActive })
    } catch { /* demo */ }
    setUsers(prev => prev.map(u =>
      (u.id === id || u._id === id) ? { ...u, status: newActive ? 'Active' : 'Blocked' } : u
    ))
    toast.success(newActive ? 'User unblocked' : 'User blocked')
  }

  const filtered = users.filter(u => {
    const m = u.name.toLowerCase().includes(search.toLowerCase()) ||
              u.email.toLowerCase().includes(search.toLowerCase())
    return m && (roleFilter.value === 'all' || u.role === roleFilter.value)
  })

  const counts = {
    total:    users.length,
    active:   users.filter(u => u.status === 'Active').length,
    blocked:  users.filter(u => u.status === 'Blocked').length,
    residents:users.filter(u => u.role === 'resident').length,
    guards:   users.filter(u => u.role === 'guard').length,
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">

      {/* Header */}
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-950 tracking-tight">User Management</h1>
            <p className="text-sm text-brand-400 mt-1">Manage all society users with full details</p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-md shadow-brand-300/30">
            <UserPlus size={15} /> Add User
          </button>
        </div>
      </div>

      {/* Stat Pills */}
      <div className={`flex flex-wrap gap-3 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        {[
          { label: 'Total',     value: counts.total,     color: 'bg-brand-600'   },
          { label: 'Residents', value: counts.residents, color: 'bg-emerald-500' },
          { label: 'Guards',    value: counts.guards,    color: 'bg-amber-500'   },
          { label: 'Blocked',   value: counts.blocked,   color: 'bg-red-500'     },
        ].map(p => (
          <div key={p.label} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${p.color} shadow-sm`}>
            <span className="text-xl font-extrabold text-white">{p.value}</span>
            <span className="text-xs font-medium text-white/80">{p.label}</span>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className={`bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden
        transition-all duration-700 delay-150 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-brand-100">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
            <input type="text" placeholder="Search name or email..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-brand-50 border border-brand-100 rounded-xl w-full
                         focus:outline-none focus:ring-2 focus:ring-brand-300 transition text-brand-900 placeholder:text-brand-300" />
          </div>
          <div className="w-40">
            <Select options={roleOptions} value={roleFilter} onChange={setRoleFilter}
              styles={sel(false)} isSearchable={false} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-50 border-b border-brand-100">
                {['User', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                    <p className="text-sm text-brand-400">Loading users...</p>
                  </div>
                </td></tr>
              )}
              {!loading && filtered.map((u, i) => (
                <UserRow key={u.id || u._id} user={u} index={i}
                  onEdit={openEdit} onDelete={openDel}
                  onView={openView} onToggleBlock={handleToggleBlock} />
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="py-14 text-center text-sm text-brand-400">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-brand-100 bg-brand-50/60">
          <p className="text-xs text-brand-400">
            Showing <span className="font-semibold text-brand-600">{filtered.length}</span> of{' '}
            <span className="font-semibold text-brand-600">{users.length}</span> users
          </p>
        </div>
      </div>

      {/* Modals */}
      <UserModal
        open={userModal.open}
        onClose={() => setUserModal({ open: false, user: null })}
        initial={userModal.user}
        onSave={handleSave}
      />
      <DeleteModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, user: null })}
        user={deleteModal.user}
        onConfirm={handleDelete}
      />
      <ViewModal
        open={viewModal.open}
        onClose={() => setViewModal({ open: false, user: null })}
        user={viewModal.user}
      />
    </div>
  )
}

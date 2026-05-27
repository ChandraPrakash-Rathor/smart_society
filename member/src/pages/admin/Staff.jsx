import { useEffect, useState } from 'react'
import { Search, UserPlus, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import Select from 'react-select'
import Modal from '../../components/Modal'
import { toast } from 'react-toastify'
import axiosInstance from '../../utils/axiosInstance'

const initialStaff = [
  { id: 1, name: 'Ramesh Kumar', role: 'Cleaner',  phone: '9876501234', status: 'Active',   joined: 'Jan 10, 2026' },
  { id: 2, name: 'Sunita Devi',  role: 'Cook',     phone: '9123409876', status: 'Active',   joined: 'Feb 05, 2026' },
  { id: 3, name: 'Mohan Lal',    role: 'Driver',   phone: '9001122334', status: 'Inactive', joined: 'Mar 18, 2026' },
  { id: 4, name: 'Geeta Bai',    role: 'Security', phone: '9988001122', status: 'Active',   joined: 'Apr 01, 2026' },
  { id: 5, name: 'Arjun Singh',  role: 'Gardener', phone: '9871100234', status: 'Active',   joined: 'Apr 10, 2026' },
]

const roleColors = { Cleaner:'bg-brand-100 text-brand-700', Cook:'bg-emerald-100 text-emerald-700', Driver:'bg-amber-100 text-amber-700', Security:'bg-red-100 text-red-600', Gardener:'bg-teal-100 text-teal-700', Other:'bg-gray-100 text-gray-600' }
const statusCfg  = { Active:{ bg:'bg-emerald-100', text:'text-emerald-700', dot:'bg-emerald-400' }, Inactive:{ bg:'bg-red-100', text:'text-red-600', dot:'bg-red-400' } }
const avatarColors = ['bg-brand-500','bg-brand-600','bg-brand-400','bg-brand-700','bg-brand-300','bg-brand-800']

const roleOptions   = ['Cleaner','Cook','Driver','Security','Gardener','Other'].map(r => ({ value: r, label: r }))
const statusOptions = [{ value:'Active', label:'Active' }, { value:'Inactive', label:'Inactive' }]

const selectStyles = (err) => ({
  control: (base, state) => ({
    ...base, borderRadius:'0.75rem',
    borderColor: err ? '#fca5a5' : state.isFocused ? '#a795f0' : '#c5bcf6',
    backgroundColor: err ? '#fef2f2' : '#f5f4fe',
    boxShadow: state.isFocused ? '0 0 0 2px #c5bcf6' : 'none',
    padding:'1px 2px', fontSize:'0.875rem',
    '&:hover':{ borderColor: err ? '#f87171' : '#a795f0' },
  }),
  option: (base, state) => ({ ...base, backgroundColor: state.isSelected ? '#784add' : state.isFocused ? '#edebfc' : 'white', color: state.isSelected ? 'white' : '#2c185d', fontSize:'0.875rem', borderRadius:'0.5rem', cursor:'pointer' }),
  singleValue: (base) => ({ ...base, color:'#2c185d' }),
  placeholder: (base) => ({ ...base, color:'#c5bcf6', fontSize:'0.875rem' }),
  menu: (base) => ({ ...base, borderRadius:'0.75rem', overflow:'hidden', zIndex:99 }),
  menuList: (base) => ({ ...base, padding:'4px' }),
  indicatorSeparator: () => ({ display:'none' }),
  dropdownIndicator: (base) => ({ ...base, color:'#a795f0', padding:'0 6px' }),
})

const inputCls = (err) =>
  `w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition focus:ring-2 focus:ring-brand-300 focus:border-brand-400 text-brand-900 placeholder:text-brand-300
   ${err ? 'border-red-300 bg-red-50' : 'border-brand-200 bg-brand-50 hover:border-brand-300'}`

const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-brand-700 uppercase tracking-wide">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

// ── Add / Edit Staff Modal ────────────────────────────────────────────────────
function StaffModal({ open, onClose, initial, onSave }) {
  const isEdit = !!initial
  const empty  = { name:'', phone:'', role:null, status:{ value:'Active', label:'Active' } }
  const [form, setForm]     = useState(empty)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm(initial
      ? { name:initial.name, phone:initial.phone, role:roleOptions.find(r=>r.value===initial.role)||null, status:statusOptions.find(s=>s.value===initial.status)||statusOptions[0] }
      : empty)
    setErrors({})
  }, [initial, open])

  const set = (f) => (e) => { setForm(p=>({...p,[f]:e.target.value})); setErrors(er=>({...er,[f]:''})) }

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Name is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    else if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter valid 10-digit phone'
    if (!form.role)         e.role  = 'Role is required'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      ...(initial || { id:Date.now(), joined:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) }),
      name:form.name, phone:form.phone, role:form.role.value, status:form.status?.value||'Active',
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Staff Member' : 'Add New Staff'} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Full Name" error={errors.name}>
          <input value={form.name} onChange={set('name')} placeholder="e.g. Ramesh Kumar" className={inputCls(errors.name)} />
        </Field>
        <Field label="Phone Number" error={errors.phone}>
          <input type="tel" value={form.phone} onChange={set('phone')} placeholder="10-digit number" className={inputCls(errors.phone)} />
        </Field>
        <Field label="Role" error={errors.role}>
          <Select options={roleOptions} value={form.role}
            onChange={opt=>{setForm(f=>({...f,role:opt}));setErrors(er=>({...er,role:''}))}}
            styles={selectStyles(!!errors.role)} isSearchable={false} placeholder="Select role..." />
        </Field>
        <Field label="Status">
          <Select options={statusOptions} value={form.status}
            onChange={opt=>setForm(f=>({...f,status:opt}))}
            styles={selectStyles(false)} isSearchable={false} />
        </Field>
        <div className="flex gap-3 pt-2 border-t border-brand-100">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition">Cancel</button>
          <button type="submit" className="flex-1 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 rounded-xl transition shadow-md shadow-brand-300/30">
            {isEdit ? 'Save Changes' : 'Add Staff'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ open, onClose, member, onConfirm }) {
  if (!member) return null
  return (
    <Modal open={open} onClose={onClose} title="Delete Staff Member" size="sm">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <div>
          <p className="font-bold text-brand-950">Delete {member.name}?</p>
          <p className="text-sm text-brand-400 mt-1">This action cannot be undone.</p>
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition">Cancel</button>
          <button onClick={() => { onConfirm(member.id); onClose() }} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 active:scale-95 rounded-xl transition shadow-md">Delete</button>
        </div>
      </div>
    </Modal>
  )
}

// ── Staff Row ─────────────────────────────────────────────────────────────────
function StaffRow({ member, index, onEdit, onDelete }) {
  const [visible, setVisible] = useState(false)
  const cfg = statusCfg[member.status]
  useEffect(() => { const t = setTimeout(() => setVisible(true), index * 60); return () => clearTimeout(t) }, [index])
  const initials = member.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)

  return (
    <tr className={`border-b border-brand-100 hover:bg-brand-50 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColors[member.id % avatarColors.length]}`}>{initials}</div>
          <div>
            <p className="font-semibold text-brand-900 text-sm">{member.name}</p>
            <p className="text-xs text-brand-400">{member.joined}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[member.role]}`}>{member.role}</span></td>
      <td className="px-5 py-3.5 text-sm text-brand-600">{member.phone}</td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{member.status}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(member)} title="Edit" className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-100 text-brand-600 hover:bg-brand-200 transition"><Pencil size={13} /></button>
          <button onClick={() => onDelete(member)} title="Delete" className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition"><Trash2 size={13} /></button>
        </div>
      </td>
    </tr>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminStaff() {
  const [staff, setStaff]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('All')
  const [visible, setVisible] = useState(false)
  const [staffModal, setStaffModal]   = useState({ open:false, member:null })
  const [deleteModal, setDeleteModal] = useState({ open:false, member:null })

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosInstance.get('/staff')
        setStaff(data.map(s => ({ ...s, id: s._id, joined: new Date(s.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) })))
      } catch { setStaff(initialStaff) }
      finally { setLoading(false) }
    }
    load()
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const openAdd  = ()  => setStaffModal({ open:true, member:null })
  const openEdit = (s) => setStaffModal({ open:true, member:s })
  const openDel  = (s) => setDeleteModal({ open:true, member:s })

  const handleSave = async (saved) => {
    try {
      if (saved._id) {
        const { data } = await axiosInstance.put(`/staff/${saved._id}`, saved)
        setStaff(prev => prev.map(s => s._id === data._id ? { ...data, id: data._id, joined: s.joined } : s))
        toast.success('Staff updated')
      } else {
        const { data } = await axiosInstance.post('/staff', saved)
        setStaff(prev => [{ ...data, id: data._id, joined: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) }, ...prev])
        toast.success('Staff added')
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleDelete = async (id) => {
    const member = staff.find(s => s.id === id || s._id === id)
    try { await axiosInstance.delete(`/staff/${member?._id || id}`) } catch { /* demo */ }
    setStaff(prev => prev.filter(s => s.id !== id && s._id !== id))
    toast.success('Staff deleted')
  }

  const filtered = staff.filter(s => {
    const m = s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase())
    return m && (filter === 'All' || s.status === filter)
  })

  const counts = { total:staff.length, active:staff.filter(s=>s.status==='Active').length, inactive:staff.filter(s=>s.status==='Inactive').length }

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-950 tracking-tight">Staff Management</h1>
            <p className="text-sm text-brand-400 mt-1">Monitor all society staff members</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-md shadow-brand-300/30">
            <UserPlus size={15} /> Add Staff
          </button>
        </div>
      </div>

      <div className={`flex flex-wrap gap-3 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        {[{label:'Total',value:counts.total,color:'bg-brand-600'},{label:'Active',value:counts.active,color:'bg-emerald-500'},{label:'Inactive',value:counts.inactive,color:'bg-red-500'}].map(p=>(
          <div key={p.label} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${p.color} shadow-sm`}>
            <span className="text-xl font-extrabold text-white">{p.value}</span>
            <span className="text-xs font-medium text-white/80">{p.label}</span>
          </div>
        ))}
      </div>

      <div className={`bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden transition-all duration-700 delay-150 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-brand-100">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
            <input type="text" placeholder="Search name or role..." value={search} onChange={e=>setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-brand-50 border border-brand-100 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-brand-300 transition text-brand-900 placeholder:text-brand-300" />
          </div>
          <div className="flex items-center gap-1 bg-brand-50 border border-brand-100 p-1 rounded-xl">
            {['All','Active','Inactive'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${filter===f?'bg-brand-600 text-white shadow-sm':'text-brand-400 hover:text-brand-700'}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-50 border-b border-brand-100">
                {['Staff Member','Role','Phone','Status','Actions'].map(h=>(
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                    <p className="text-sm text-brand-400">Loading staff...</p>
                  </div>
                </td></tr>
              )}
              {!loading && filtered.map((s,i)=><StaffRow key={s.id||s._id} member={s} index={i} onEdit={openEdit} onDelete={openDel} />)}
              {!loading && filtered.length===0 && <tr><td colSpan={5} className="py-14 text-center text-sm text-brand-400">No staff found</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-brand-100 bg-brand-50/60">
          <p className="text-xs text-brand-400">Showing <span className="font-semibold text-brand-600">{filtered.length}</span> of <span className="font-semibold text-brand-600">{staff.length}</span> staff members</p>
        </div>
      </div>

      <StaffModal open={staffModal.open} onClose={()=>setStaffModal({open:false,member:null})} initial={staffModal.member} onSave={handleSave} />
      <DeleteModal open={deleteModal.open} onClose={()=>setDeleteModal({open:false,member:null})} member={deleteModal.member} onConfirm={handleDelete} />
    </div>
  )
}

import { useEffect, useState } from 'react'
import Select from 'react-select'
import Modal from '../Modal'

const empty = { name: '', phone: '', role: null, status: { value: 'Active', label: 'Active' } }

const roleOptions = [
  { value: 'Cleaner',  label: 'Cleaner'  },
  { value: 'Cook',     label: 'Cook'     },
  { value: 'Driver',   label: 'Driver'   },
  { value: 'Security', label: 'Security' },
  { value: 'Gardener', label: 'Gardener' },
  { value: 'Other',    label: 'Other'    },
]

const statusOptions = [
  { value: 'Active',   label: 'Active'   },
  { value: 'Inactive', label: 'Inactive' },
]

// ── Shared react-select styles ────────────────────────────────────────────────
const selectStyles = (hasError) => ({
  control: (base, state) => ({
    ...base,
    borderRadius: '0.75rem',
    borderColor: hasError ? '#fca5a5' : state.isFocused ? '#a795f0' : '#c5bcf6',
    backgroundColor: hasError ? '#fef2f2' : '#f5f4fe',
    boxShadow: state.isFocused ? '0 0 0 2px #c5bcf6' : 'none',
    padding: '1px 2px',
    fontSize: '0.875rem',
    '&:hover': { borderColor: hasError ? '#f87171' : '#a795f0' },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#784add' : state.isFocused ? '#edebfc' : 'white',
    color: state.isSelected ? 'white' : '#2c185d',
    fontSize: '0.875rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
  }),
  singleValue: (base) => ({ ...base, color: '#2c185d' }),
  placeholder: (base) => ({ ...base, color: '#c5bcf6', fontSize: '0.875rem' }),
  menu: (base) => ({ ...base, borderRadius: '0.75rem', overflow: 'hidden', zIndex: 99 }),
  menuList: (base) => ({ ...base, padding: '4px' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? '#784add' : '#a795f0',
    transition: 'transform 0.2s',
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
  }),
})

// ── Field wrapper ─────────────────────────────────────────────────────────────
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

// ── Modal ─────────────────────────────────────────────────────────────────────
export default function StaffModal({ open, onClose, onSave, initial = null }) {
  const isEdit = !!initial
  const [form, setForm]     = useState(empty)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initial) {
      setForm({
        name:   initial.name,
        phone:  initial.phone,
        role:   roleOptions.find(o => o.value === initial.role)     || null,
        status: statusOptions.find(o => o.value === initial.status) || statusOptions[0],
      })
    } else {
      setForm(empty)
    }
    setErrors({})
  }, [initial, open])

  const setField = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(er => ({ ...er, [field]: '' }))
  }

  const setSelect = (field) => (option) => {
    setForm(f => ({ ...f, [field]: option }))
    setErrors(er => ({ ...er, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Name is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    else if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit phone'
    if (!form.role)         e.role  = 'Role is required'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      name:   form.name,
      phone:  form.phone,
      role:   form.role.value,
      status: form.status?.value || 'Active',
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Staff Member' : 'Add New Staff'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <Field label="Full Name" error={errors.name}>
          <input type="text" value={form.name} onChange={setField('name')}
            placeholder="e.g. Ramesh Kumar" className={inputCls(errors.name)} />
        </Field>

        <Field label="Phone Number" error={errors.phone}>
          <input type="tel" value={form.phone} onChange={setField('phone')}
            placeholder="10-digit number" className={inputCls(errors.phone)} />
        </Field>

        <Field label="Role" error={errors.role}>
          <Select
            options={roleOptions}
            value={form.role}
            onChange={setSelect('role')}
            placeholder="Select role..."
            styles={selectStyles(!!errors.role)}
            isSearchable={false}
          />
        </Field>

        <Field label="Status">
          <Select
            options={statusOptions}
            value={form.status}
            onChange={setSelect('status')}
            placeholder="Select status..."
            styles={selectStyles(false)}
            isSearchable={false}
          />
        </Field>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-brand-100 mt-1">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition">
            Cancel
          </button>
          <button type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 rounded-xl transition shadow-md shadow-brand-300/30">
            {isEdit ? 'Save Changes' : 'Add Staff'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

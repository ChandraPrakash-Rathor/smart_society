import { useEffect, useState } from 'react'
import Select from 'react-select'
import Modal from '../Modal'

const empty = { name: '', phone: '', purpose: null, status: null, host: '' }

const purposeOptions = [
  { value: 'Delivery',  label: 'Delivery'  },
  { value: 'Meeting',   label: 'Meeting'   },
  { value: 'Repair',    label: 'Repair'    },
  { value: 'Visit',     label: 'Visit'     },
  { value: 'Interview', label: 'Interview' },
  { value: 'Other',     label: 'Other'     },
]

const statusOptions = [
  { value: 'Pending',  label: 'Pending'  },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
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
export default function VisitorModal({ open, onClose, onSave, initial = null }) {
  const isEdit = !!initial
  const [form, setForm]     = useState(empty)
  const [errors, setErrors] = useState({})

  // Populate when editing
  useEffect(() => {
    if (initial) {
      setForm({
        name:    initial.name,
        phone:   initial.phone,
        host:    initial.host || '',
        purpose: purposeOptions.find(o => o.value === initial.purpose) || null,
        status:  statusOptions.find(o => o.value === initial.status)   || null,
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
    if (!form.name.trim())  e.name    = 'Name is required'
    if (!form.phone.trim()) e.phone   = 'Phone is required'
    else if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit phone'
    if (!form.host?.trim()) e.host    = 'Host name is required'
    if (!form.purpose)      e.purpose = 'Purpose is required'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      name:    form.name,
      phone:   form.phone,
      host:    form.host,
      purpose: form.purpose.value,
      status:  form.status?.value || 'Pending',
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Visitor' : 'Add New Visitor'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <Field label="Full Name" error={errors.name}>
          <input type="text" value={form.name} onChange={setField('name')}
            placeholder="e.g. John Doe" className={inputCls(errors.name)} />
        </Field>

        <Field label="Phone Number" error={errors.phone}>
          <input type="tel" value={form.phone} onChange={setField('phone')}
            placeholder="10-digit number" className={inputCls(errors.phone)} />
        </Field>

        <Field label="Host / Flat No." error={errors.host}>
          <input type="text" value={form.host} onChange={setField('host')}
            placeholder="e.g. A-204 / Rahul Sharma" className={inputCls(errors.host)} />
        </Field>

        <Field label="Purpose" error={errors.purpose}>
          <Select
            options={purposeOptions}
            value={form.purpose}
            onChange={setSelect('purpose')}
            placeholder="Select purpose..."
            styles={selectStyles(!!errors.purpose)}
            isSearchable={false}
          />
        </Field>

        {/* Status only in edit mode */}
        {isEdit && (
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
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-brand-100 mt-1">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition">
            Cancel
          </button>
          <button type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 rounded-xl transition shadow-md shadow-brand-300/30">
            {isEdit ? 'Save Changes' : 'Add Visitor'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

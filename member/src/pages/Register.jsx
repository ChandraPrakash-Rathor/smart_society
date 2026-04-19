import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { toast } from 'react-toastify'
import EyeIcon from '../components/EyeIcon'
import api from '../api/axios'

// ─── Initial form state ───────────────────────────────────────────────────────
const initialForm = {
  name: '',
  email: '',
  password: '',
  role: null,
}

// ─── Role options for react-select ───────────────────────────────────────────
const ROLE_OPTIONS = [
  { value: 'admin',    label: 'Admin' },
  { value: 'resident', label: 'Resident' },
  { value: 'guard',    label: 'Guard' },
]

// ─── Custom react-select styles using brand palette ──────────────────────────
const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: '0.75rem',
    borderColor: state.isFocused ? 'transparent' : '#ead3ff',
    backgroundColor: '#faf5ff',
    boxShadow: state.isFocused ? '0 0 0 2px #c57fff' : base.boxShadow,
    padding: '1px 4px',
    fontSize: '0.875rem',
    '&:hover': { borderColor: '#dab1ff' },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#9c2bf2'
      : state.isFocused
      ? '#f4e7ff'
      : 'white',
    color: state.isSelected ? 'white' : '#400368',
    fontSize: '0.875rem',
    cursor: 'pointer',
  }),
  singleValue: (base) => ({ ...base, color: '#400368' }),
  placeholder: (base) => ({ ...base, color: '#c57fff' }),
  menu: (base) => ({ ...base, borderRadius: '0.75rem', overflow: 'hidden', zIndex: 50 }),
  menuList: (base) => ({ ...base, padding: '4px' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? '#9c2bf2' : '#c57fff',
    '&:hover': { color: '#871ad6' },
    transition: 'transform 0.2s',
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
  }),
}

// Error variant — red border
const selectStylesError = {
  ...selectStyles,
  control: (base, state) => ({
    ...selectStyles.control(base, state),
    borderColor: '#f87171',
    backgroundColor: '#fef2f2',
  }),
}

function Register() {
  const navigate = useNavigate()

  // ── State ──────────────────────────────────────────────────────────────────
  const [form, setForm]                 = useState(initialForm)
  const [errors, setErrors]             = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}

    if (!form.name.trim())
      e.name = 'Name is required'

    if (!form.email)
      e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address'

    if (!form.password)
      e.password = 'Password is required'
    else if (form.password.length < 6)
      e.password = 'Password must be at least 6 characters'

    if (!form.role)
      e.role = 'Please select a role'

    return e
  }

  // ── Field change handler ───────────────────────────────────────────────────
  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    // Clear field error on change
    if (errors[field]) setErrors({ ...errors, [field]: '' })
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Run validation
    const validationErrors = validate()
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register', {
        name:     form.name,
        email:    form.email,
        password: form.password,
        role:     form.role?.value,
      })

      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Shared input class ─────────────────────────────────────────────────────
  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition
     focus:ring-2 focus:ring-brand-400 focus:border-transparent
     placeholder:text-brand-300 text-brand-900
     ${errors[field]
       ? 'border-red-400 bg-red-50'
       : 'border-brand-200 bg-brand-50 hover:border-brand-300'}`

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-brand-200/60 p-8 sm:p-10 border border-brand-100">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-100 rounded-2xl mb-4">
            <svg className="w-7 h-7 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-brand-950">Create account</h1>
          <p className="text-sm text-brand-400 mt-1">Fill in the details to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

          {/* ── Name ── */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-900">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="John Doe"
              className={inputClass('name')}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* ── Email ── */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-900">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="you@example.com"
              className={inputClass('email')}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* ── Password ── */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-900">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange('password')}
                placeholder="Min. 6 characters"
                className={inputClass('password')}
              />
              <EyeIcon visible={showPassword} onClick={() => setShowPassword(!showPassword)} />
            </div>
            {/* Password strength hint */}
            {form.password && (
              <p className={`text-xs mt-0.5 ${form.password.length >= 6 ? 'text-green-600' : 'text-yellow-600'}`}>
                {form.password.length >= 6 ? '✓ Strong enough' : `${6 - form.password.length} more characters needed`}
              </p>
            )}
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* ── Role dropdown (react-select) ── */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-900">Role</label>
            <Select
              options={ROLE_OPTIONS}
              value={form.role}
              onChange={(selected) => {
                setForm({ ...form, role: selected })
                if (errors.role) setErrors({ ...errors, role: '' })
              }}
              placeholder="Select a role..."
              styles={errors.role ? selectStylesError : selectStyles}
              isSearchable={false}
            />
            {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
          </div>

          {/* ── Submit button ── */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-1 bg-brand-600 hover:bg-brand-700 active:bg-brand-800
                       active:scale-95 text-white font-semibold rounded-xl transition-all duration-200
                       shadow-md shadow-brand-300/50 hover:shadow-lg hover:shadow-brand-400/40
                       disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100
                       flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                {/* Spinner */}
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        {/* ── Footer link ── */}
        <p className="text-center text-sm text-brand-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 hover:text-brand-800 font-semibold transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register

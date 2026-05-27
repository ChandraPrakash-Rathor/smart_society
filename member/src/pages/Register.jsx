import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { Plus, X, ChevronRight, ChevronLeft, Building2, Shield, Users, UserPlus, Home, Phone, Mail, Lock } from 'lucide-react'
import EyeIcon from '../components/EyeIcon'
import api from '../utils/axiosInstance'

// ── Options ───────────────────────────────────────────────────────────────────
const ROLE_OPTIONS = [
  { value: 'resident', label: '🏠 Resident' },
  { value: 'guard',    label: '🛡️ Guard'    },
  { value: 'admin',    label: '⚙️ Admin'    },
]
const SHIFT_OPTIONS = [
  { value: 'Morning', label: 'Morning  (6AM – 2PM)'  },
  { value: 'Evening', label: 'Evening  (2PM – 10PM)' },
  { value: 'Night',   label: 'Night    (10PM – 6AM)' },
]
const RELATION_OPTIONS = [
  { value: 'Spouse', label: 'Spouse' }, { value: 'Son', label: 'Son' },
  { value: 'Daughter', label: 'Daughter' }, { value: 'Parent', label: 'Parent' },
  { value: 'Sibling', label: 'Sibling' }, { value: 'Other', label: 'Other' },
]

// ── Left panel features ───────────────────────────────────────────────────────
const features = [
  { icon: Building2, text: 'Smart Society Management'   },
  { icon: Shield,    text: 'Secure Gate & Guard System'  },
  { icon: Users,     text: 'Resident & Staff Portal'     },
  { icon: UserPlus,  text: 'Easy Onboarding'             },
]

// ── react-select styles ───────────────────────────────────────────────────────
const sel = (err) => ({
  control: (b, s) => ({
    ...b, borderRadius: '0.75rem',
    borderColor: err ? '#fca5a5' : s.isFocused ? '#a795f0' : '#c5bcf6',
    backgroundColor: err ? '#fef2f2' : '#f5f4fe',
    boxShadow: s.isFocused ? '0 0 0 2px #c5bcf6' : 'none',
    padding: '2px 4px', fontSize: '0.875rem',
    '&:hover': { borderColor: err ? '#f87171' : '#a795f0' },
  }),
  option: (b, s) => ({
    ...b, backgroundColor: s.isSelected ? '#784add' : s.isFocused ? '#edebfc' : 'white',
    color: s.isSelected ? 'white' : '#2c185d', fontSize: '0.875rem', borderRadius: '0.5rem', cursor: 'pointer',
  }),
  singleValue: (b) => ({ ...b, color: '#2c185d' }),
  placeholder: (b) => ({ ...b, color: '#c5bcf6' }),
  menu: (b) => ({ ...b, borderRadius: '0.75rem', overflow: 'hidden', zIndex: 50 }),
  menuList: (b) => ({ ...b, padding: '4px' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (b, s) => ({
    ...b, color: s.isFocused ? '#784add' : '#a795f0',
    transition: 'transform 0.2s',
    transform: s.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
  }),
})

// ── Helpers ───────────────────────────────────────────────────────────────────
const inp = (err) =>
  `w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition
   focus:ring-2 focus:ring-brand-300 focus:border-brand-400
   placeholder:text-brand-300 text-brand-900
   ${err ? 'border-red-300 bg-red-50' : 'border-brand-200 bg-brand-50 hover:border-brand-300'}`

const inpPlain = (err) =>
  `w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition
   focus:ring-2 focus:ring-brand-300 focus:border-brand-400
   placeholder:text-brand-300 text-brand-900
   ${err ? 'border-red-300 bg-red-50' : 'border-brand-200 bg-brand-50 hover:border-brand-300'}`

const Field = ({ label, error, half, children }) => (
  <div className={`flex flex-col gap-1 ${half ? 'flex-1 min-w-0' : ''}`}>
    <label className="text-xs font-semibold text-brand-700 uppercase tracking-wide">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

const Divider = ({ label }) => (
  <div className="flex items-center gap-2 py-1">
    <div className="flex-1 h-px bg-brand-100" />
    <span className="text-xs font-bold text-brand-400 uppercase tracking-widest whitespace-nowrap">{label}</span>
    <div className="flex-1 h-px bg-brand-100" />
  </div>
)

// ── Step bar ──────────────────────────────────────────────────────────────────
function StepBar({ steps, current }) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all duration-300
            ${i < current ? 'bg-brand-600 text-white' : i === current ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-brand-100 text-brand-400'}`}>
            {i < current ? '✓' : i + 1}
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 transition-all duration-500 ${i < current ? 'bg-brand-600' : 'bg-brand-100'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Tag pill for left panel ───────────────────────────────────────────────────
function Tag({ icon: Icon, text, delay }) {
  const [v, setV] = useState(false)
  useEffect(() => { const t = setTimeout(() => setV(true), delay); return () => clearTimeout(t) }, [delay])
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
      bg-white/15 border border-white/20 text-white backdrop-blur-sm
      transition-all duration-700 ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
      <Icon size={11} /> {text}
    </span>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate()

  const [step, setStep]         = useState(0)
  const [loading, setLoading]   = useState(false)
  const [showPwd, setShowPwd]   = useState(false)
  const [errors, setErrors]     = useState({})
  const [panelV, setPanelV]     = useState(false)
  const [formV, setFormV]       = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setPanelV(true), 100)
    const t2 = setTimeout(() => setFormV(true), 300)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', role: null,
    flat: '', memberSince: '', familyMembers: [],
    emergencyName: '', emergencyRelation: '', emergencyPhone: '',
    shift: null, assignedGate: '',
  })

  const set  = (f) => (e) => { setForm(p => ({ ...p, [f]: e.target.value })); setErrors(er => ({ ...er, [f]: '' })) }
  const setS = (f) => (o)  => { setForm(p => ({ ...p, [f]: o }));             setErrors(er => ({ ...er, [f]: '' })) }
  const role = form.role?.value

  const steps = role === 'resident'
    ? ['Basic Info', 'Resident Details', 'Review']
    : role === 'guard'
    ? ['Basic Info', 'Guard Details', 'Review']
    : ['Basic Info', 'Review']

  const addFamily    = () => setForm(p => ({ ...p, familyMembers: [...p.familyMembers, { name:'', relation:null, age:'', phone:'' }] }))
  const removeFamily = (i) => setForm(p => ({ ...p, familyMembers: p.familyMembers.filter((_,idx) => idx !== i) }))
  const setFam = (i, f, v) => setForm(p => {
    const arr = [...p.familyMembers]; arr[i] = { ...arr[i], [f]: v }; return { ...p, familyMembers: arr }
  })

  const validateStep = (s) => {
    const e = {}
    if (s === 0) {
      if (!form.name.trim())  e.name  = 'Required'
      if (!form.email.trim()) e.email = 'Required'
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
      if (form.password.length < 6) e.password = 'Min 6 characters'
      if (!form.role) e.role = 'Required'
    }
    if (s === 1 && role === 'resident' && !form.flat.trim()) e.flat = 'Required'
    if (s === 1 && role === 'guard' && !form.shift) e.shift = 'Required'
    return e
  }

  const next = () => {
    const errs = validateStep(step)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.post('/auth/register', {
        name: form.name, email: form.email, password: form.password, phone: form.phone, role: form.role?.value,
        ...(role === 'resident' && {
          flat: form.flat, memberSince: form.memberSince,
          familyMembers: form.familyMembers.map(m => ({ ...m, relation: m.relation?.value || m.relation })),
          emergencyContact: { name: form.emergencyName, relation: form.emergencyRelation, phone: form.emergencyPhone },
        }),
        ...(role === 'guard' && { shift: form.shift?.value, assignedGate: form.assignedGate }),
      })
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const ReviewRow = ({ label, value }) => value ? (
    <div className="flex justify-between py-2 border-b border-brand-50 last:border-0 text-sm">
      <span className="text-brand-400 font-medium">{label}</span>
      <span className="text-brand-900 font-semibold text-right max-w-48 truncate">{value}</span>
    </div>
  ) : null

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel ── */}
      <div className={`hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-12
        bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 relative overflow-hidden
        transition-all duration-1000 ${panelV ? 'opacity-100' : 'opacity-0'}`}>

        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-8 w-40 h-40 rounded-full bg-white/5" />

        {/* Logo */}
        <div className={`transition-all duration-700 delay-200 ${panelV ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Smart Society</span>
          </div>
        </div>

        {/* Tagline */}
        <div className={`space-y-6 transition-all duration-700 delay-300 ${panelV ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div>
            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight">
              Join Your<br />
              <span className="text-brand-200">Community.</span>
            </h2>
            <p className="text-brand-200 mt-4 text-base leading-relaxed max-w-sm">
              Register as a resident, guard or admin and get instant access to your society's smart management portal.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {features.map((f, i) => (
              <Tag key={f.text} icon={f.icon} text={f.text} delay={500 + i * 150} />
            ))}
          </div>
        </div>

        {/* Steps preview */}
        <div className={`transition-all duration-700 delay-700 ${panelV ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-brand-300 text-xs mb-3 font-semibold uppercase tracking-widest">Registration Steps</p>
          <div className="space-y-2">
            {['Fill basic info & choose role', 'Add role-specific details', 'Review & submit'].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${i <= step ? 'bg-white text-brand-700' : 'bg-white/20 text-white/60'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-sm ${i <= step ? 'text-white font-medium' : 'text-brand-300'}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div className="flex-1 flex items-start justify-center px-6 py-10 bg-brand-50/30 overflow-y-auto">
        <div className={`w-full max-w-md transition-all duration-700 ${formV ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Building2 size={16} className="text-white" />
            </div>
            <span className="font-bold text-brand-950">Smart Society</span>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-brand-950 tracking-tight">Create Account 🚀</h1>
            <p className="text-brand-400 mt-1.5 text-sm">
              Step {step + 1} of {steps.length} — <span className="font-semibold text-brand-600">{steps[step]}</span>
            </p>
          </div>

          {/* Step bar */}
          <StepBar steps={steps} current={step} />

          {/* ── STEP 0: Basic Info ── */}
          {step === 0 && (
            <div className="flex flex-col gap-4">
              {/* Name + Phone */}
              <div className="flex gap-3">
                <Field label="Full Name" error={errors.name} half>
                  <div className="relative">
                    <UserPlus size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
                    <input value={form.name} onChange={set('name')} placeholder="John Doe"
                      className={`${inp(errors.name)} pl-9`} />
                  </div>
                </Field>
                <Field label="Phone" half>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
                    <input type="tel" value={form.phone} onChange={set('phone')} placeholder="10-digit"
                      className={`${inp(false)} pl-9`} />
                  </div>
                </Field>
              </div>

              {/* Email */}
              <Field label="Email Address" error={errors.email}>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
                  <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com"
                    className={inp(errors.email)} />
                </div>
              </Field>

              {/* Password */}
              <Field label="Password" error={errors.password}>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
                  <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')}
                    placeholder="Min. 6 characters" className={inp(errors.password)} />
                  <EyeIcon visible={showPwd} onClick={() => setShowPwd(!showPwd)} />
                </div>
                {form.password && (
                  <p className={`text-xs mt-0.5 ${form.password.length >= 6 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {form.password.length >= 6 ? '✓ Strong enough' : `${6 - form.password.length} more characters needed`}
                  </p>
                )}
              </Field>

              {/* Role */}
              <Field label="I am a..." error={errors.role}>
                <Select options={ROLE_OPTIONS} value={form.role} onChange={setS('role')}
                  styles={sel(!!errors.role)} isSearchable={false} placeholder="Select your role..." />
              </Field>

              {/* Role hint */}
              {role && (
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium
                  ${role === 'resident' ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : role === 'guard'    ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-brand-50 border-brand-200 text-brand-700'}`}>
                  {role === 'resident' && <><Home size={13} /> Next: Add flat number, family & emergency contact</>}
                  {role === 'guard'    && <><Shield size={13} /> Next: Add shift timing & assigned gate</>}
                  {role === 'admin'    && <><Building2 size={13} /> Next: Review & create your account</>}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 1: Resident Details ── */}
          {step === 1 && role === 'resident' && (
            <div className="flex flex-col gap-4">
              <Divider label="Flat & Membership" />
              <div className="flex gap-3">
                <Field label="Flat Number" error={errors.flat} half>
                  <input value={form.flat} onChange={set('flat')} placeholder="e.g. A-204" className={inpPlain(errors.flat)} />
                </Field>
                <Field label="Member Since" half>
                  <input type="date" value={form.memberSince} onChange={set('memberSince')} className={inpPlain(false)} />
                </Field>
              </div>

              <Divider label="Family Members" />
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
                    <input value={m.name} onChange={e => setFam(i,'name',e.target.value)}
                      placeholder="Full name" className={`${inpPlain(false)} flex-1`} />
                    <div className="w-36">
                      <Select options={RELATION_OPTIONS}
                        value={RELATION_OPTIONS.find(r => r.value === m.relation) || null}
                        onChange={opt => setFam(i,'relation',opt?.value||'')}
                        styles={sel(false)} isSearchable={false} placeholder="Relation" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input type="number" value={m.age} onChange={e => setFam(i,'age',e.target.value)}
                      placeholder="Age" className={`${inpPlain(false)} w-24`} />
                    <input type="tel" value={m.phone} onChange={e => setFam(i,'phone',e.target.value)}
                      placeholder="Phone (optional)" className={`${inpPlain(false)} flex-1`} />
                  </div>
                </div>
              ))}
              <button type="button" onClick={addFamily}
                className="flex items-center gap-2 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 border-dashed px-4 py-2.5 rounded-xl transition">
                <Plus size={14} /> Add Family Member
              </button>

              <Divider label="Emergency Contact" />
              <div className="flex gap-3">
                <Field label="Contact Name" half>
                  <input value={form.emergencyName} onChange={set('emergencyName')} placeholder="e.g. Rahul Sharma" className={inpPlain(false)} />
                </Field>
                <Field label="Relation" half>
                  <input value={form.emergencyRelation} onChange={set('emergencyRelation')} placeholder="e.g. Brother" className={inpPlain(false)} />
                </Field>
              </div>
              <Field label="Emergency Phone">
                <input type="tel" value={form.emergencyPhone} onChange={set('emergencyPhone')} placeholder="10-digit number" className={inpPlain(false)} />
              </Field>
            </div>
          )}

          {/* ── STEP 1: Guard Details ── */}
          {step === 1 && role === 'guard' && (
            <div className="flex flex-col gap-4">
              <Divider label="Duty Information" />
              <Field label="Shift" error={errors.shift}>
                <Select options={SHIFT_OPTIONS} value={form.shift} onChange={setS('shift')}
                  styles={sel(!!errors.shift)} isSearchable={false} placeholder="Select your shift..." />
              </Field>
              <Field label="Assigned Gate">
                <input value={form.assignedGate} onChange={set('assignedGate')} placeholder="e.g. Main Gate" className={inpPlain(false)} />
              </Field>
            </div>
          )}

          {/* ── REVIEW STEP ── */}
          {step === steps.length - 1 && (
            <div className="flex flex-col gap-4">
              <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4">
                <p className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-3">Basic Info</p>
                <ReviewRow label="Name"  value={form.name}        />
                <ReviewRow label="Email" value={form.email}       />
                <ReviewRow label="Phone" value={form.phone}       />
                <ReviewRow label="Role"  value={form.role?.label} />
              </div>
              {role === 'resident' && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Resident Details</p>
                  <ReviewRow label="Flat"         value={form.flat}        />
                  <ReviewRow label="Member Since" value={form.memberSince} />
                  <ReviewRow label="Family"       value={form.familyMembers.length ? `${form.familyMembers.length} member(s)` : null} />
                  <ReviewRow label="Emergency"    value={form.emergencyName ? `${form.emergencyName} (${form.emergencyRelation})` : null} />
                </div>
              )}
              {role === 'guard' && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3">Guard Details</p>
                  <ReviewRow label="Shift"         value={form.shift?.label} />
                  <ReviewRow label="Assigned Gate" value={form.assignedGate} />
                </div>
              )}
              <p className="text-xs text-brand-400 text-center bg-brand-50 border border-brand-100 rounded-xl py-2.5">
                ✅ Everything looks good? Click "Create Account" to finish.
              </p>
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button type="button" onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 px-5 py-3 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition border border-brand-200">
                <ChevronLeft size={15} /> Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button type="button" onClick={next}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 rounded-xl transition shadow-lg shadow-brand-300/40">
                Next <ChevronRight size={15} />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 rounded-xl transition shadow-lg shadow-brand-300/40 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating...</>
                  : <><UserPlus size={15} /> Create Account</>}
              </button>
            )}
          </div>

          <p className="text-center text-sm text-brand-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-800 font-semibold transition">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

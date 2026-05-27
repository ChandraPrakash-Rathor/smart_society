import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { Mail, Lock, ArrowRight, Building2, Shield, Users } from 'lucide-react'
import EyeIcon from '../components/EyeIcon'
import axiosInstance from '../utils/axiosInstance'
import { setCredentials } from '../features/auth/authSlice'
import { getRoleHome } from '../utils/roleRedirect'

// ── Feature tags shown on left panel ─────────────────────────────────────────
const features = [
  { icon: Building2, text: 'Smart Society Management'  },
  { icon: Shield,    text: 'Secure Gate & Guard System' },
  { icon: Users,     text: 'Resident & Staff Portal'    },
]

// ── Floating tag pill ─────────────────────────────────────────────────────────
function Tag({ children, delay, className }) {
  const [v, setV] = useState(false)
  useEffect(() => { const t = setTimeout(() => setV(true), delay); return () => clearTimeout(t) }, [delay])
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
      bg-white/15 border border-white/20 text-white backdrop-blur-sm
      transition-all duration-700 ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'} ${className}`}>
      {children}
    </span>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [form, setForm]             = useState({ email: '', password: '', remember: false })
  const [showPwd, setShowPwd]       = useState(false)
  const [errors, setErrors]         = useState({})
  const [loading, setLoading]       = useState(false)
  const [panelVisible, setPanelVisible] = useState(false)
  const [formVisible, setFormVisible]   = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setPanelVisible(true), 100)
    const t2 = setTimeout(() => setFormVisible(true), 300)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const set = (f) => (e) => {
    setForm(p => ({ ...p, [f]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
    setErrors(er => ({ ...er, [f]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const { data } = await axiosInstance.post('/auth/login', { email: form.email, password: form.password })
      dispatch(setCredentials({ user: data, token: data.token }))
      toast.success(`Welcome back, ${data.name}!`)
      navigate(getRoleHome(data.role))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inp = (err) =>
    `w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition
     focus:ring-2 focus:ring-brand-300 focus:border-brand-400
     placeholder:text-brand-300 text-brand-900
     ${err ? 'border-red-300 bg-red-50' : 'border-brand-200 bg-brand-50 hover:border-brand-300'}`

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel — Branding ── */}
      <div className={`hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-12
        bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 relative overflow-hidden
        transition-all duration-1000 ${panelVisible ? 'opacity-100' : 'opacity-0'}`}>

        {/* Background decorations */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-8 w-40 h-40 rounded-full bg-white/5" />

        {/* Logo */}
        <div className={`transition-all duration-700 delay-200 ${panelVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Smart Society</span>
          </div>
        </div>

        {/* Main tagline */}
        <div className={`space-y-6 transition-all duration-700 delay-300 ${panelVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div>
            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight">
              Your Society,<br />
              <span className="text-brand-200">Smarter.</span>
            </h2>
            <p className="text-brand-200 mt-4 text-base leading-relaxed max-w-sm">
              One platform for residents, guards and admins to manage everything — visitors, staff, complaints and more.
            </p>
          </div>

          {/* Feature tags */}
          <div className="flex flex-wrap gap-2">
            {features.map((f, i) => (
              <Tag key={f.text} delay={500 + i * 150}>
                <f.icon size={12} /> {f.text}
              </Tag>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className={`transition-all duration-700 delay-700 ${panelVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-brand-300 text-xs">
            Trusted by 500+ societies across India
          </p>
          <div className="flex items-center gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-4 h-4 text-brand-300 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-brand-300 text-xs ml-1">4.9 / 5 rating</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-brand-50/30">
        <div className={`w-full max-w-md transition-all duration-700
          ${formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Building2 size={16} className="text-white" />
            </div>
            <span className="font-bold text-brand-950">Smart Society</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-brand-950 tracking-tight">Welcome back 👋</h1>
            <p className="text-brand-400 mt-2 text-sm">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-brand-700 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-300" />
                <input type="email" value={form.email} onChange={set('email')}
                  placeholder="you@example.com" className={inp(errors.email)} />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-brand-700 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-300" />
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="••••••••" className={inp(errors.password)} />
                <EyeIcon visible={showPwd} onClick={() => setShowPwd(!showPwd)} />
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-brand-600">
                <input type="checkbox" checked={form.remember} onChange={set('remember')}
                  className="w-4 h-4 rounded accent-brand-600" />
                Remember me
              </label>
              <span className="text-brand-600 hover:text-brand-800 cursor-pointer font-semibold transition text-xs">
                Forgot password?
              </span>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold rounded-xl
                         transition-all shadow-lg shadow-brand-300/40 hover:shadow-xl hover:shadow-brand-400/30
                         disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : (
                <>Sign in <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-brand-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 hover:text-brand-800 font-semibold transition">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

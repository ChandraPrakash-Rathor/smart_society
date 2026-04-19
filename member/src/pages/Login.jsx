import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import InputField from '../components/InputField'
import EyeIcon from '../components/EyeIcon'
import api from '../api/axios'
import { setCredentials } from '../features/auth/authSlice'

function Login() {
  const navigate  = useNavigate()
  const dispatch  = useDispatch()

  const [form, setForm]               = useState({ email: '', password: '', remember: false })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors]           = useState({})
  const [loading, setLoading]         = useState(false)

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validate()
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return }
    setErrors({})

    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      })

      // Save token
      localStorage.setItem('token', data.token)

      // Save to Redux store
      dispatch(setCredentials({ user: data, token: data.token }))

      toast.success(`Welcome back, ${data.name}!`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) =>
    setForm({ ...form, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-brand-200/60 p-8 sm:p-10 border border-brand-100">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-100 rounded-2xl mb-4">
            <svg className="w-7 h-7 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-brand-950">Welcome back</h1>
          <p className="text-sm text-brand-400 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <InputField
            label="Email address"
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
            error={errors.email}
          />

          <InputField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={set('password')}
            placeholder="••••••••"
            error={errors.password}
          >
            <EyeIcon visible={showPassword} onClick={() => setShowPassword(!showPassword)} />
          </InputField>

          {/* Remember me + Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-brand-700">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={set('remember')}
                className="w-4 h-4 rounded accent-brand-600"
              />
              Remember me
            </label>
            <span className="text-brand-600 hover:text-brand-800 cursor-pointer font-medium transition">
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800
                       active:scale-95 text-white font-semibold rounded-xl transition-all duration-200
                       shadow-md shadow-brand-300/50 hover:shadow-lg hover:shadow-brand-400/40 mt-1
                       disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100
                       flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </>
            ) : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-brand-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-600 hover:text-brand-800 font-semibold transition">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login

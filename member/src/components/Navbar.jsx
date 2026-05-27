import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'

function Navbar({ onMenuClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-brand-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 shadow-sm">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-brand-400 hover:bg-brand-50 hover:text-brand-600 transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="relative hidden sm:block">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-300"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 text-sm bg-brand-50 border border-brand-100 rounded-xl w-56
                       outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition
                       text-brand-900 placeholder:text-brand-300"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">

        {/* Bell */}
        <button className="relative p-2 rounded-xl text-brand-400 hover:bg-brand-50 hover:text-brand-600 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-brand-50 transition"
          >
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-brand-950 leading-none">{user?.name || 'User'}</p>
              <p className="text-xs text-brand-400 capitalize mt-0.5">{user?.role || ''}</p>
            </div>
            <svg className="w-4 h-4 text-brand-300 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl shadow-brand-200/40 border border-brand-100 py-1.5 z-50">
                <div className="px-4 py-2.5 border-b border-brand-100 mb-1">
                  <p className="text-xs font-semibold text-brand-900">{user?.name}</p>
                  <p className="text-xs text-brand-400">{user?.email}</p>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm text-brand-700 hover:bg-brand-50 transition">
                  My Profile
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-brand-700 hover:bg-brand-50 transition">
                  Settings
                </button>
                <div className="border-t border-brand-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar

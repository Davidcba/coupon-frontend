import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../firebase'
import { useState } from 'react'
import SideNav from './SideNav'
import { useIsAdmin } from '../hooks/useIsAdmin'

export default function Navbar() {
  const [user] = useAuthState(auth)
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [navOpen, setNavOpen] = useState(false)
  const isAdmin = useIsAdmin()

  const handleLogout = async () => {
    await auth.signOut()
    navigate('/login')
  }

  const isLoginPage = location.pathname === '/login'
  const isLoggedIn = !!user && !isLoginPage

  const bgColor = isLoggedIn ? 'bg-[#3B3B98]' : 'bg-white'
  const textColor = isLoggedIn ? 'text-white' : 'text-gray-800'
  const logoSrc = isLoggedIn ? '/tucheck-white.svg' : '/tucheck.svg'

  return (
    <>
    <nav className={`w-full px-6 py-3 ${bgColor} shadow-md flex items-center justify-between transition-colors duration-300 sticky top-0 z-50`}>
      {/* Left: Logo */}
      <Link to="/" className="flex items-center">
        <img src={logoSrc} alt="TUCHECK Logo" className="h-8 md:h-10" />
      </Link>

      {/* Center: Search Bar */}
      {isLoggedIn && (
        <div className="flex-1 flex justify-center">
          <div className="flex items-center border rounded-full px-3 py-1 bg-white w-full max-w-md transition hover:shadow-lg">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none px-2 text-sm text-gray-700 w-full"
            />
            <button className="text-sm text-[#3B3B98] font-medium hover:underline">Go</button>
          </div>
        </div>
      )}

      {/* Right: Navigation & Profile */}
      {isLoggedIn && (
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className={`text-sm font-medium hover:underline ${textColor}`}>My Coupons</Link>
          <Link to="/redemptions" className={`text-sm font-medium hover:underline ${textColor}`}>History</Link>

          <div className="relative group">
            <div className="w-8 h-8 rounded-full bg-white text-[#3B3B98] flex items-center justify-center font-bold cursor-pointer">
              {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-friendly Hamburger */}
      {isLoggedIn && (
        <button
          className="md:hidden text-white"
          onClick={() => setNavOpen(true)}
        >
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </nav>
    <SideNav open={navOpen} onClose={() => setNavOpen(false)} isAdmin={isAdmin} />
    </>

  )
}

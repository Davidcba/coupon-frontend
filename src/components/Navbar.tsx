import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../firebase'
import React, { useEffect, useState } from 'react'
import SideNav from './SideNav'
import { useIsAdmin } from '../hooks/useIsAdmin'
import { useUserInfo } from '../hooks/useUserInfo'
import { useFirebaseUser } from '../hooks/useFirebaseUser'
import { api } from '../lib/api'

type Coupon = {
  id: string
  title: string
  code: string
  endDate: string
  description?: string
  terms?: string
  category?: string
  brand?: { name: string }
}

export default function Navbar() {
  const [user] = useAuthState(auth)
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<Coupon[]>([])
  const token = useFirebaseUser()
  const [navOpen, setNavOpen] = useState(false)
  const isAdmin = useIsAdmin()
  useUserInfo()

  const isLoginPage = location.pathname === '/login'
  const isLoggedIn = !!user && !isLoginPage

  const bgColor = isLoggedIn ? 'bg-[#3B3B98]' : 'bg-white'
  const textColor = isLoggedIn ? 'text-white' : 'text-gray-800'
  const logoSrc = isLoggedIn ? '/whiteLogo.png' : '/tucheckLoginLogo.png'

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!search.trim()) return
    navigate(`/search?keyword=${encodeURIComponent(search.trim())}`)
    setSuggestions([])
  }

  const handleSuggestionClick = (id: string) => {
    navigate(`/coupon/${id}`)
    setSuggestions([])
    setSearch('')
  }

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([])
      return
    }

    const handler = setTimeout(() => {
      if (!token) return
      api<Coupon[]>(
        `/coupons/search?keyword=${encodeURIComponent(search.trim())}`,
        token,
      )
        .then(data => setSuggestions(data.slice(0, 5)))
        .catch(() => setSuggestions([]))
    }, 300)

    return () => clearTimeout(handler)
  }, [search, token])

  const handleLogout = async () => {
    await auth.signOut()
    navigate('/login')
  }

  return (
    <>
      <nav className={`w-full ${bgColor} shadow-md transition-colors duration-300 sticky top-0 z-50`}>
        <div className="max-w-screen-xl mx-auto px-4 py-2 flex flex-col md:flex-row md:items-center md:justify-between">
          
          {/* Logo centered on mobile */}
          <div className="flex justify-center md:justify-start w-full md:w-auto mb-2 md:mb-0">
            <Link to="/" className="flex items-center flex-shrink-0">
              <img src={logoSrc} alt="TUCHECK Logo" className="h-4 md:h-6" />
            </Link>
          </div>

          {/* Mobile: Search bar + hamburger in same row */}
          {isLoggedIn && (
            <div className="flex w-full items-center justify-between md:hidden space-x-2">
              <form
                onSubmit={handleSearch}
                className="flex items-center flex-1 bg-white border border-gray-300 rounded-full px-4 py-1"
              >
                <input
                  type="text"
                  placeholder="Buscar en tucheck"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
                <div className="mx-2 h-5 w-px bg-gray-300" />
                <button
                  type="submit"
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </form>

              {/* Hamburger Menu */}
              <button className="text-white" onClick={() => setNavOpen(true)}>
                <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}

          {/* Desktop: Centered search bar */}
          {isLoggedIn && (
            <div className="flex-1 mx-4 hidden md:flex justify-center relative">
              <form
                onSubmit={handleSearch}
                className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-1 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl"
              >
                <input
                  type="text"
                  placeholder="Buscar en tucheck tu próximo beneficio"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-base text-gray-700 placeholder-gray-400 outline-none px-2"
                />
                <div className="mx-2 h-5 w-px bg-gray-300" />
                <button
                  type="submit"
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </form>

              {/* Autocomplete Suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute top-full mt-1 w-full max-w-xl bg-white border border-gray-400 rounded-xl shadow-md z-50">
                  {suggestions.map((s) => (
                    <div
                      key={s.id}
                      onMouseDown={() => handleSuggestionClick(s.id)}
                      className="flex justify-between items-center px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer rounded-xl"
                    >
                      <span className="truncate">{s.title}</span>
                      {s.brand?.name && (
                        <span className="ml-4 text-gray-400 text-xs whitespace-nowrap">
                          {s.brand.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Desktop: Right user menu */}
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
        </div>
      </nav>

      <SideNav open={navOpen} onClose={() => setNavOpen(false)} isAdmin={isAdmin} />
    </>
  )
}

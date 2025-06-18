import { Link } from 'react-router-dom'

interface SideNavProps {
  open: boolean
  onClose: () => void
  isAdmin?: boolean
}

export default function SideNav({ open, onClose, isAdmin }: SideNavProps) {
  const baseClasses =
    'fixed inset-y-0 left-0 w-64 bg-[#3B3B98] text-white transform transition-transform z-40'
  return (
    <>
      <div
        className={`${baseClasses} ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 font-bold text-lg">Menu</div>
        <nav className="space-y-2 px-4">
          <Link to="/" className="block py-2" onClick={onClose}>
            My Coupons
          </Link>
          <Link to="/redemptions" className="block py-2" onClick={onClose}>
            History
          </Link>
          {isAdmin && (
            <>
              <Link to="/admin/dashboard" className="block py-2" onClick={onClose}>
                Dashboard
              </Link>
              <Link to="/admin/coupons" className="block py-2" onClick={onClose}>
                Coupons
              </Link>
              <Link to="/admin/brands" className="block py-2" onClick={onClose}>
                Brands
              </Link>
              <Link to="/admin/redemptions" className="block py-2" onClick={onClose}>
                Redemptions
              </Link>
            </>
          )}
        </nav>
      </div>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={onClose}
        />
      )}
    </>
  )
}

import { Link } from 'react-router-dom'

interface SideNavProps {
  open: boolean
  onClose: () => void
  isAdmin?: boolean
}

export default function SideNav({ open, onClose, isAdmin }: SideNavProps) {
  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 w-72 max-w-full bg-gray-100 text-gray-800 transform transition-transform duration-300 z-50 shadow-lg ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="bg-[#3B3B98] text-white px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.121 17.804A4 4 0 019 15h6a4 4 0 013.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <span className="font-medium">Mi cuenta &gt;</span>
          </div>
          <button onClick={onClose}>
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search bar */}
        <div className="bg-[#3B3B98] px-4 pb-4">
          <form className="flex items-center bg-white rounded-full px-4 py-1">
            <input
              type="text"
              placeholder="Buscar en tucheck tu próximo beneficio"
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
            />
            <svg
              className="w-5 h-5 text-gray-500 ml-2"
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
          </form>
        </div>

        {/* Navigation Links */}
        <nav className="overflow-y-auto py-4 px-4 space-y-2">
          <Link to="/" className="block py-2" onClick={onClose}>
            Volver al inicio
          </Link>
          <Link to="/favorites" className="block py-2" onClick={onClose}>
            Favoritos
          </Link>
          <Link to="/redemptions" className="block py-2" onClick={onClose}>
            Historial
          </Link>
          <Link to="/help" className="block py-2" onClick={onClose}>
            Ayuda
          </Link>
          <Link to="/devices" className="block py-2" onClick={onClose}>
            Dispositivos
          </Link>

          <hr className="my-3 border-gray-400" />

          {["Bar/Restaurante", "Entretenimiento", "Indumentaria", "Salud y Belleza", "Viajes", "Hogar y Jardín", "Automóvil", "Educación", "Supermercados"].map((label) => (
            <div key={label} className="py-2 text-sm">
              {label}
            </div>
          ))}

          <hr className="my-3 border-gray-400" />

          <Link to="/privacy" className="block py-2 text-sm" onClick={onClose}>
            Política de Privacidad
          </Link>
          <Link to="/terms" className="block py-2 text-sm" onClick={onClose}>
            Términos y condiciones
          </Link>

          {isAdmin && (
            <>
              <hr className="my-3 border-gray-400" />
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
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={onClose}
        />
      )}
    </>
  )
}
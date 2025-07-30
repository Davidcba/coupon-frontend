import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUser } from '@fortawesome/free-solid-svg-icons';

interface SideNavProps {
  open: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

/**
 * Sliding side navigation for mobile. Displays navigation links, categories,
 * privacy/terms, and admin items (if isAdmin=true). Click the overlay or X to close.
 */
export default function SideNav({ open, onClose, isAdmin = false }: SideNavProps) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 z-50 flex flex-col overflow-y-auto`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faUser} className="text-gray-700" />
            <span className="font-semibold text-gray-700">Mi cuenta &gt;</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="text-gray-500 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faXmark} size="lg" />
          </button>
        </div>
        <div className="p-4">
          <input
            type="text"
            placeholder="Buscar en tucheck tu próximo beneficio"
            className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">
            Volver al inicio
          </button>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">
            Favoritos
          </button>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">
            Historial
          </button>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">
            Ayuda
          </button>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">
            Dispositivos
          </button>
        </nav>
        <div className="mt-4 px-4 border-t pt-4 space-y-1">
          {[
            'Bar/Restaurante',
            'Entretenimiento',
            'Indumentaria',
            'Salud y Belleza',
            'Viajes',
            'Hogar y Jardín',
            'Automóvil',
            'Educación',
            'Supermercados',
          ].map((label) => (
            <button
              key={label}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-4 px-4 border-t pt-4">
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">
            Política de Privacidad
          </button>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">
            Términos y condiciones
          </button>
        </div>
        {isAdmin && (
          <div className="mt-4 px-4 border-t pt-4">
            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">
              Dashboard
            </button>
            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">
              Coupons
            </button>
            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">
              Brands
            </button>
            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">
              Redemptions
            </button>
          </div>
        )}
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={onClose} />
      )}
    </>
  );
}

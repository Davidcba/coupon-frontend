import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUser } from '@fortawesome/free-solid-svg-icons';

interface SideNavProps {
  open: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

/**
 * A responsive side navigation drawer. On mobile it slides in from the left and
 * overlays the page content with a semi-transparent backdrop. The drawer
 * contains navigation links and category labels similar to those shown in the
 * provided design. The isAdmin prop can be used later on to display
 * administrative options.
 */
export default function SideNav({ open, onClose, isAdmin = false }: SideNavProps) {
  return (
    <>
      {/* Sliding drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${open ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 z-50 flex flex-col overflow-y-auto`}
      >
        {/* Header with user info and close button */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faUser} className="text-gray-700" />
            <span className="font-semibold text-gray-700">Mi cuenta &gt;</span>
          </div>
          <button onClick={onClose} aria-label="Cerrar menú" className="text-gray-500 hover:text-gray-700">
            <FontAwesomeIcon icon={faXmark} size="lg" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Buscar en tucheck tu próximo beneficio"
            className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 space-y-2">
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">Volver al inicio</button>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">Favoritos</button>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">Historial</button>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">Ayuda</button>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">Dispositivos</button>
        </nav>

        {/* Categories list */}
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

        {/* Privacy and terms */}
        <div className="mt-4 px-4 border-t pt-4">
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">
            Política de Privacidad
          </button>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">
            Términos y condiciones
          </button>
        </div>

        {/* Admin links (if needed) */}
        {isAdmin && (
          <div className="mt-4 px-4 border-t pt-4">
            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">Dashboard</button>
            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">Coupons</button>
            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">Brands</button>
            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">Redemptions</button>
          </div>
        )}
      </aside>

      {/* Semi-transparent overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={onClose}
        />
      )}
    </>
  );
}
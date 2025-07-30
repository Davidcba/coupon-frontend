import React, { useEffect, useState } from 'react';
import { faSearch, faBars, faUser, faUtensils, faTicketAlt, faTshirt, faSpa, faPlane, faHome, faCar, faBookOpen, faShoppingBasket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CouponCard from '../components/CouponCard';
import CouponModal from '../components/CouponModal';
import SideNav from '../components/SideNav';
import Hero from '../components/Hero';

/**
 * A single coupon data structure. In a real application this would come from the backend.
 */
interface Coupon {
  id: string;
  title: string;
  description: string;
  code: string;
  endDate: string;
  imageUrl: string;
  category: string;
}

/**
 * Hardcoded list of coupons used while the API integration is disabled. To restore
 * live data, re-enable the API call in the useEffect hook below.
 */
const sampleCoupons: Coupon[] = [
  {
    id: 'c1',
    title: 'Sushiman',
    description: '25% Off en tu próxima compra en nuestros locales adheridos a esta promoción.',
    code: 'SUSHI25',
    endDate: '2025-09-18',
    imageUrl: '/images/sushi.png',
    category: 'Restaurantes',
  },
  {
    id: 'c2',
    title: 'HP Farma',
    description: '15% Off en antigripales.',
    code: 'HP15',
    endDate: '2025-10-01',
    imageUrl: '/images/pharmacy.png',
    category: 'Salud y Belleza',
  },
  {
    id: 'c3',
    title: 'Burger King',
    description: '20% Off en tu próxima compra.',
    code: 'BK20',
    endDate: '2025-11-01',
    imageUrl: '/images/burger_fries.png',
    category: 'Restaurantes',
  },
  {
    id: 'c4',
    title: 'Glow Gym',
    description: '20% de descuento en tu rutina personal.',
    code: 'GYM20',
    endDate: '2025-09-30',
    imageUrl: '/images/gym.png',
    category: 'Salud y Belleza',
  },
  {
    id: 'c5',
    title: 'Pesso',
    description: '15% off en tu próxima herramienta.',
    code: 'TOOL15',
    endDate: '2025-12-15',
    imageUrl: '/images/power_drill.png',
    category: 'Hogar y Jardín',
  },
];

/**
 * Categories available in the app along with their associated FontAwesome icons.
 */
const categories = [
  { label: 'Bar/Restaurante', icon: faUtensils },
  { label: 'Entretenimiento', icon: faTicketAlt },
  { label: 'Indumentaria', icon: faTshirt },
  { label: 'Salud y Belleza', icon: faSpa },
  { label: 'Viajes', icon: faPlane },
  { label: 'Hogar y Jardín', icon: faHome },
  { label: 'Automóvil', icon: faCar },
  { label: 'Educación', icon: faBookOpen },
  { label: 'Supermercados', icon: faShoppingBasket },
];

/**
 * The main page that lists available coupons and handles filtering and modal state.
 */
export default function CouponsList() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Load coupons from the backend. This API call is commented out while the
  // design is being finalized. Once ready, remove the comments and delete
  // the sampleCoupons assignment to restore live data.
  useEffect(() => {
    /*
    // Example of how to fetch coupons from the backend. Ensure useFirebaseUser and api
    // are imported when uncommenting this code.
    const token = useFirebaseUser();
    if (!token) return;
    api('/coupons/my-coupons', token)
      .then((data: Coupon[]) => setCoupons(data))
      .catch(err => console.error(err));
    */
    // Use hardcoded coupons while the API integration is disabled.
    setCoupons(sampleCoupons);
  }, []);

  // Filter coupons by category when one is selected.
  const filteredCoupons = selectedCategory
    ? coupons.filter((c) => c.category === selectedCategory)
    : coupons;

  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* Header / Navigation Bar */}
     
      {/* Mobile search bar */}
      <div className="md:hidden px-4 mt-4">
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900"
            placeholder="Buscar en tucheck tu próximo beneficio"
          />
        </div>
      </div>

      {/* Hero section */}
      <div className="mt-6 px-4 md:px-8">
        <Hero />
      </div>

      {/* Featured coupons row (small cards) */}
      <div className="mt-8 px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sampleCoupons.slice(0, 3).map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition flex items-center p-4 space-x-4"
          >
            <img
              src={c.imageUrl}
              alt={c.title}
              className="w-16 h-16 object-cover rounded-md flex-shrink-0"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-sm">{c.title}</h3>
              <p className="text-xs text-gray-500 truncate">{c.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Categories row */}
      <div className="mt-8 px-4 md:px-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Categorias</h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9 gap-4">
          {categories.map(({ label, icon }) => (
            <button
              key={label}
              onClick={() => setSelectedCategory(label)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border hover:bg-gray-100 transition ${
                selectedCategory === label ? 'bg-blue-100 border-blue-500' : 'bg-white'
              }`}
            >
              <FontAwesomeIcon icon={icon} size="lg" className="text-blue-600" />
              <span className="mt-2 text-xs text-gray-700 text-center leading-tight">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Coupon grid */}
      <div className="mt-8 px-4 md:px-8 mb-16">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Cupones disponibles</h2>
        {filteredCoupons.length === 0 ? (
          <p className="text-gray-500">No hay cupones disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCoupons.map((coupon: Coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              onClick={() => setSelectedCoupon(coupon)}
            />
          ))}
          </div>
        )}
      </div>

      {/* Coupon modal */}
      {selectedCoupon && (
        <CouponModal
          coupon={selectedCoupon}
          onClose={() => setSelectedCoupon(null)}
        />
      )}

      {/* Side navigation for mobile */}
      <SideNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        isAdmin={false}
      />
    </div>
  );
}
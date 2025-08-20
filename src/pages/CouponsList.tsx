import  { useEffect, useMemo, useRef, useState } from 'react';
import { faSearch, faUtensils, faTicketAlt, faTshirt, faSpa, faPlane, faHome, faCar, faBookOpen, faShoppingBasket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CouponCard from '../components/CouponCard';
import CouponModal from '../components/CouponModal';
import SideNav from '../components/SideNav';
import Hero from '../components/Hero';
import {safeISO, parseApiDate, endOfDay } from '../lib/dates';
import { getPublicCoupons } from '../lib/api';
import { useAuthToken } from '../hooks/useAuthToken';

type BackendCoupon = {
  id: string; title: string;
  description?: string | null; terms?: string | null;
  code?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  imageUrl?: string | null;
  category?: string | null;
};

interface Coupon {
  id: string;
  title: string;
  description: string;
  code: string | null;
  startDate: Date | null;        // <- store as Date
  endDate: Date | null;          // <- store as Date
  imageUrl: string | null;
  category: string | null;
}

function mapCoupon(c: BackendCoupon): Coupon {
  return {
    id: c.id,
    title: c.title ?? 'Cupón',
    description: (c.description ?? c.terms ?? '') || '',
    code: c.code ?? null,
    startDate: parseApiDate(c.startDate),
    endDate: parseApiDate(c.endDate),
    imageUrl: c.imageUrl ?? null,
    category: c.category ?? null,
  };
}

// Optional: keep active-only client filter (inclusive endDate)
function isActive(c: Coupon): boolean {
  const now = new Date();
  const started = !c.startDate || c.startDate.getTime() <= now.getTime();
  const notExpired = !c.endDate || endOfDay(c.endDate).getTime() >= now.getTime();
  return started && notExpired;
}

export default function CouponsList() {
  const token = useAuthToken();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // --- loop guard: only fetch once per mount unless user clicks "retry"
  const fetchedOnceRef = useRef(false);

const load = async (_signal?: AbortSignal) => {
  if (!token) return;
  setLoading(true);
  setErr(null);
  try {
    const data = await getPublicCoupons(token, { signed: true, take: 50 });
    setCoupons(data.map(mapCoupon));
  } catch (e: any) {
    if (e?.name !== 'AbortError') {
      setErr(e?.body?.message || 'No pudimos cargar los cupones.');
    }
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    if (!token || fetchedOnceRef.current) return;
    fetchedOnceRef.current = true;            // prevent StrictMode duplicates + token churn loops
    const abort = new AbortController();
    load(abort.signal);
    return () => abort.abort();
  }, [token]);

  // manual retry clears guard so user can reattempt after login / fix
  const retry = () => {
    fetchedOnceRef.current = false;
    setErr(null);
    setCoupons([]);
    const abort = new AbortController();
    load(abort.signal);
  };

  const filteredCoupons = useMemo(() => {
    let list = coupons;
    const needle = q.trim().toLowerCase();
    if (needle) {
      list = list.filter(
        c =>
          c.title.toLowerCase().includes(needle) ||
          (c.description ?? '').toLowerCase().includes(needle) ||
          (c.category ?? '').toLowerCase().includes(needle),
      );
    }
    if (selectedCategory) list = list.filter(c => c.category === selectedCategory);
    return list;
  }, [coupons, q, selectedCategory]);

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

  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* Mobile search */}
      <div className="md:hidden px-4 mt-4">
        <div className="relative">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            className="w-full pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900"
            placeholder="Buscar en tucheck tu próximo beneficio"
          />
        </div>
      </div>

      {/* Hero */}
      <div className="mt-6 px-4 md:px-8">
        <Hero />
      </div>

      {/* Featured (live data) */}
      <div className="mt-8 px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoupons.slice(0, 3).map((c) => (
          <button key={c.id} onClick={() => setSelectedCoupon(c)} className="bg-white rounded-lg shadow hover:shadow-md transition flex items-center p-4 space-x-4 text-left">
            <img
              src={c.imageUrl || '/tucheck.png'}
              alt={c.title}
              className="w-16 h-16 object-cover rounded-md flex-shrink-0"
              onError={(e) => (e.currentTarget.src = '/tucheck.png')}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-sm">{c.title}</h3>
              <p className="text-xs text-gray-500 truncate">{c.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Categories */}
      <div className="mt-8 px-4 md:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Categorias</h2>
          {selectedCategory && (
            <button className="text-sm text-blue-700 hover:underline" onClick={() => setSelectedCategory(null)}>
              Limpiar filtro
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9 gap-4">
          {categories.map(({ label, icon }) => (
            <button
              key={label}
              onClick={() => setSelectedCategory(label)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border hover:bg-gray-100 transition ${selectedCategory === label ? 'bg-blue-100 border-blue-500' : 'bg-white'
                }`}
            >
              <FontAwesomeIcon icon={icon} size="lg" className="text-blue-600" />
              <span className="mt-2 text-xs text-gray-700 text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Coupon grid */}
      <div className="mt-8 px-4 md:px-8 mb-16">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Cupones disponibles</h2>

        {loading && <p className="text-gray-500">Cargando cupones…</p>}

        {!loading && err && (
          <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded-md flex items-center gap-3">
            <span>{err}</span>
            <button className="ml-auto text-sm underline" onClick={retry}>Reintentar</button>
          </div>
        )}

        {!loading && !err && filteredCoupons.length === 0 && (
          <p className="text-gray-500">No hay cupones disponibles.</p>
        )}

        {!loading && !err && filteredCoupons.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCoupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} onClick={() => setSelectedCoupon(coupon)} />
            ))}
          </div>
        )}
      </div>

      {/* Modal + SideNav */}
      {selectedCoupon && <CouponModal coupon={selectedCoupon} onClose={() => setSelectedCoupon(null)} />}
      <SideNav open={menuOpen} onClose={() => setMenuOpen(false)} isAdmin={false} />
    </div>
  );
}

import { useFirebaseUser } from '../hooks/useFirebaseUser'
import { api } from '../lib/api'
import { useEffect, useState } from 'react'
import FilterBar from '../components/FilterBar'
import CouponCard from '../components/CouponCard'
import CouponModal from '../components/CouponModal'
import CouponCarousel from '../components/CouponCarousel'

type Coupon = {
  id: string
  title: string
  code: string
  endDate: string
  description?: string
  terms?: string
  category?: string
}
const featuredCoupons = [
  { id: '1', title: '50% OFF Pizza', imageUrl: '/images/pizza.jpeg' },
  { id: '2', title: 'Free Dessert', imageUrl: '/images/dessert.jpeg' },
  { id: '3', title: 'Buy 1 Get 1', imageUrl: '/images/bogo.jpeg' },
]

export default function CouponList() {
  const token = useFirebaseUser()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    api<Coupon[]>('/coupons/my-coupons', token)
      .then(setCoupons)
      .catch((err) => {
        console.error(err)
        setError('Failed to load coupons')
      })
      .finally(() => setLoading(false))
  }, [token])

  const categories = ['Restaurantes', 'Mercados', 'Helados', 'Café & Deli', 'Kioscos']
  const filteredCoupons = selectedCategory
    ? coupons.filter(c => c.category === selectedCategory)
    : coupons

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-[#3B3B98] mb-8">🎟️ Tus Cupones Disponibles</h1>
         <CouponCarousel coupons={featuredCoupons} />
        <FilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {loading && <p className="text-center text-gray-500">Cargando cupones...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && filteredCoupons.length === 0 && (
          <p className="text-center text-gray-500">No hay cupones disponibles</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCoupons.map(coupon => (
            <div
              key={coupon.id}
              onClick={() => setSelectedCoupon(coupon)}
              className="cursor-pointer"
            >
              <CouponCard coupon={coupon} onCopy={() => {}} />
            </div>
          ))}
        </div>
      </div>

      {/* Coupon Modal */}
      {selectedCoupon && (
        <CouponModal coupon={selectedCoupon} onClose={() => setSelectedCoupon(null)} />
      )}
    </div>
  )
}

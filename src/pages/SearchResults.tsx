import { useEffect, useRef, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useFirebaseUser } from '../hooks/useFirebaseUser'
import { api } from '../lib/api'
import CouponCard from '../components/CouponCard'

type Coupon = {
  id: string
  title: string
  code: string
  endDate: string
  description: string
  terms?: string
  category: string
  imageUrl: string | null
}

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('keyword') || ''
const { token } = useFirebaseUser();
  const [results, setResults] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const tokenRef = useRef<string | null>(null);
useEffect(() => { tokenRef.current = token; }, [token]);
  useEffect(() => {
  if (!query?.trim()) { setResults([]); return; }

  let cancelled = false;
  setLoading(true);
  setError(null);

  const t = setTimeout(async () => {
    const tkn = tokenRef.current;
    if (!tkn) { if (!cancelled) setLoading(false); return; }

    try {
      const data = await api<Coupon[]>(
        `/coupons/search?keyword=${encodeURIComponent(query.trim())}`,
        tkn
      );
      if (!cancelled) setResults(data);
    } catch {
      if (!cancelled) setError('Failed to fetch results');
    } finally {
      if (!cancelled) setLoading(false);
    }
  }, 300);

  return () => { cancelled = true; clearTimeout(t); };
}, [query]);

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-[#3B3B98] mb-4">
          Results for "{query}"
        </h1>
        {loading && <p className="text-gray-600">Searching...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && results.length === 0 && !error && (
          <p className="text-gray-600">No results found.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map(coupon => (
            <Link key={coupon.id} to={`/coupon/${coupon.id}`} className="cursor-pointer">
              <CouponCard coupon={coupon} onClick={() => {}} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useFirebaseUser } from '../hooks/useFirebaseUser'
import { api } from '../lib/api'

type Redemption = {
  id: string
  redeemedAt: string
}

export default function CouponRedemptions() {
  const { id } = useParams()
  const token = useFirebaseUser()
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token || !id) return
    api<Redemption[]>(`/coupons/${id}/redemptions`, token)
      .then(setRedemptions)
      .catch(err => {
        console.error(err)
        setError('Failed to load redemptions')
      })
      .finally(() => setLoading(false))
  }, [token, id])

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Coupon Redemptions</h1>
      {loading && <p>Loading redemptions...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && (
        <ul className="space-y-2">
          {redemptions.map(r => (
            <li key={r.id} className="border p-2 rounded">
              {new Date(r.redeemedAt).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

import { useFirebaseUser } from '../hooks/useFirebaseUser'
import { api } from '../lib/api'
import { useEffect, useState } from 'react'

type Redemption = {
  id: string
  redeemedAt: string
  coupon: {
    id: string
    title: string
    code: string
  }
}

export default function RedemptionHistory() {
  const token = useFirebaseUser()
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    api<Redemption[]>('/coupons/redemptions/my', token)
      .then(setRedemptions)
      .catch((err) => {
        console.error(err)
        setError('Failed to load redemptions')
      })
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">🧾 Redemption History</h1>

        {loading && <p className="text-center text-gray-500">Loading redemptions...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && redemptions.length === 0 && (
          <p className="text-center text-gray-500">You haven’t redeemed any coupons yet.</p>
        )}

        <ul className="space-y-4">
          {redemptions.map((r) => (
            <li key={r.id} className="bg-white rounded-xl shadow p-4 border hover:shadow-md transition">
              <h2 className="text-lg font-semibold">{r.coupon.title}</h2>
              <p className="text-sm text-gray-600">
                Code: <span className="font-mono">{r.coupon.code}</span>
              </p>
              <p className="text-sm text-gray-500">
                Redeemed at: {new Date(r.redeemedAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

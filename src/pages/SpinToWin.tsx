import { useFirebaseUser } from '../hooks/useFirebaseUser'
import { api } from '../lib/api'
import { useState } from 'react'
import Navbar from '../components/Navbar'

type Coupon = {
  id: string
  title: string
  code: string
  description?: string
}

export default function SpinToWin() {
  const token = useFirebaseUser()
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSpin = async () => {
    setError(null)
    setCoupon(null)
    setLoading(true)

    try {
      const result = await api<Coupon>('/spin', token!)
      setCoupon(result)
    } catch (err: any) {
      console.error(err)
      setError('Could not spin right now. Try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />

      <div className="p-4 max-w-xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-6">🎰 Spin-to-Win</h1>

        {!coupon && (
          <button
            onClick={handleSpin}
            disabled={loading}
            className="bg-yellow-500 text-white px-6 py-3 rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            {loading ? 'Spinning...' : 'Spin Now'}
          </button>
        )}

        {error && <p className="text-red-600 mt-4">{error}</p>}

        {coupon && (
          <div className="mt-6 border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{coupon.title}</h2>
            <p className="my-2 font-mono text-lg bg-gray-100 inline-block px-2 py-1 rounded">
              {coupon.code}
            </p>
            {coupon.description && (
              <p className="text-sm text-gray-600">{coupon.description}</p>
            )}
          </div>
        )}
      </div>
    </>
  )
}

import { useParams } from 'react-router-dom'
import { useFirebaseUser } from '../hooks/useFirebaseUser'
import { api } from '../lib/api'
import { useEffect, useState } from 'react'

type Coupon = {
  id: string
  title: string
  description?: string
  code: string
  category: string
  startDate: string
  endDate: string
}

export default function CouponDetail() {
  const { id } = useParams()
  const token = useFirebaseUser()
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [redeemed, setRedeemed] = useState(false)
  const [redeemError, setRedeemError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !token) return

    api<Coupon>(`/coupons/my-coupons/${id}`, token)
      .then(setCoupon)
      .catch((err) => {
        console.error(err)
        setError('Failed to load coupon')
      })
  }, [id, token])

  const handleCopy = () => {
    if (coupon) {
      navigator.clipboard.writeText(coupon.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRedeem = async () => {
    if (!coupon || !token) return

    setRedeemError(null)

    try {
      await api(`/coupons/${coupon.id}/redeem`, token, { method: 'POST' })
      setRedeemed(true)
    } catch (err) {
      console.error(err)
      setRedeemError('Failed to redeem this coupon')
    }
  }

  if (error) return <p className="text-red-600 p-4">{error}</p>
  if (!coupon) return <p className="p-4 text-gray-600">Loading coupon...</p>

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border rounded-xl p-6 shadow">
        <h1 className="text-2xl font-bold mb-2">{coupon.title}</h1>
        <p className="text-gray-600 mb-4">{coupon.description || 'No description provided.'}</p>

        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">
            Valid from {new Date(coupon.startDate).toLocaleDateString()} to{' '}
            {new Date(coupon.endDate).toLocaleDateString()}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="font-mono bg-gray-100 px-3 py-1 rounded text-lg">{coupon.code}</span>
            <button
              onClick={handleCopy}
              className="text-sm text-blue-600 hover:underline ml-2"
            >
              {copied ? '✅ Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-400 italic mb-4">Category: {coupon.category}</p>

        <button
          onClick={handleRedeem}
          disabled={redeemed}
          className={`w-full px-4 py-2 rounded ${
            redeemed
              ? 'bg-green-500 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {redeemed ? '✅ Coupon Redeemed' : 'Redeem Now'}
        </button>

        {redeemError && <p className="text-red-600 mt-2 text-sm">{redeemError}</p>}
      </div>
    </div>
  )
}

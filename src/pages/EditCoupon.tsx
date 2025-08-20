import { useEffect, useState, FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthToken } from '../hooks/useAuthToken'

type Coupon = {
  id: string
  title: string
  code: string
  startDate: string
  endDate: string
}

export default function EditCoupon() {
  const { id } = useParams()
  const token = useAuthToken()
  const navigate = useNavigate()
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !id) return
    api<Coupon>(`/coupons/${id}`, token)
      .then(setCoupon)
      .catch(err => {
        console.error(err)
        setError('Failed to load coupon')
      })
  }, [token, id])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token || !coupon) return
    try {
      await api(`/coupons/${coupon.id}`, token, {
        method: 'PUT',
        body: JSON.stringify(coupon),
      })
      navigate('/admin/coupons')
    } catch (err) {
      console.error(err)
      setError('Failed to update coupon')
    }
  }

  if (!coupon) return <p className="p-4">Loading coupon...</p>

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Edit Coupon</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={coupon.title}
          onChange={e => setCoupon({ ...coupon, title: e.target.value })}
          className="w-full border px-3 py-2 rounded"
          placeholder="Title"
        />
        <input
          type="text"
          value={coupon.code}
          onChange={e => setCoupon({ ...coupon, code: e.target.value })}
          className="w-full border px-3 py-2 rounded"
          placeholder="Code"
        />
        <input
          type="date"
          value={coupon.startDate.split('T')[0]}
          onChange={e => setCoupon({ ...coupon, startDate: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={coupon.endDate.split('T')[0]}
          onChange={e => setCoupon({ ...coupon, endDate: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Save
        </button>
      </form>
    </div>
  )
}

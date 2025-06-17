import { useEffect, useState } from 'react'
import { useFirebaseUser } from '../hooks/useFirebaseUser'
import { api } from '../lib/api'
import { Link, useNavigate } from 'react-router-dom'

type Coupon = {
  id: string
  title: string
  code: string
  startDate: string
  endDate: string
}

export default function AdminCoupons() {
  const token = useFirebaseUser()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) return
    api<Coupon[]>('/coupons', token)
      .then(setCoupons)
      .catch(err => {
        console.error(err)
        setError('Failed to load coupons')
      })
      .finally(() => setLoading(false))
  }, [token])

  const handleDelete = async (id: string) => {
    if (!token) return
    if (!confirm('Delete this coupon?')) return
    try {
      await api(`/coupons/${id}`, token, { method: 'DELETE' })
      setCoupons(coupons.filter(c => c.id !== id))
    } catch (err) {
      console.error(err)
      alert('Failed to delete coupon')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Coupons</h1>
      {loading && <p>Loading coupons...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border">Title</th>
              <th className="py-2 px-4 border">Code</th>
              <th className="py-2 px-4 border">Start</th>
              <th className="py-2 px-4 border">End</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border">{c.title}</td>
                <td className="py-2 px-4 border font-mono">{c.code}</td>
                <td className="py-2 px-4 border">{new Date(c.startDate).toLocaleDateString()}</td>
                <td className="py-2 px-4 border">{new Date(c.endDate).toLocaleDateString()}</td>
                <td className="py-2 px-4 border space-x-2 text-sm">
                  <button onClick={() => navigate(`/admin/coupons/${c.id}/edit`)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">Delete</button>
                  <Link to={`/admin/coupons/${c.id}/redemptions`} className="text-green-600 hover:underline">Redemptions</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

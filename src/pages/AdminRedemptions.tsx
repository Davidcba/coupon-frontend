import { useEffect, useState } from 'react'
import { useFirebaseUser } from '../hooks/useFirebaseUser'
import { api } from '../lib/api'

export type Redemption = {
  id: string
  redeemedAt: string
  code: string
  coupon: {
    title: string
  }
  user: {
    email: string
  }
}

export default function AdminRedemptions() {
  const token = useFirebaseUser()
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    api<Redemption[]>('/redemptions', token)
      .then(setRedemptions)
      .catch(err => {
        console.error(err)
        setError('Failed to load redemptions')
      })
      .finally(() => setLoading(false))
  }, [token])

  const handleExport = () => {
    const headers = ['Coupon', 'User email', 'Date/time', 'Code']
    const rows = redemptions.map(r => [
      r.coupon.title,
      r.user.email,
      new Date(r.redeemedAt).toISOString(),
      r.code,
    ])
    const csv = [headers, ...rows]
      .map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'redemptions.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Redemptions</h1>
        <button
          onClick={handleExport}
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={!redemptions.length}
        >
          Export CSV
        </button>
      </div>
      {loading && <p>Loading redemptions...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border">Coupon</th>
              <th className="py-2 px-4 border">User email</th>
              <th className="py-2 px-4 border">Date/time</th>
              <th className="py-2 px-4 border">Code</th>
            </tr>
          </thead>
          <tbody>
            {redemptions.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border">{r.coupon.title}</td>
                <td className="py-2 px-4 border">{r.user.email}</td>
                <td className="py-2 px-4 border">{new Date(r.redeemedAt).toLocaleString()}</td>
                <td className="py-2 px-4 border font-mono">{r.code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

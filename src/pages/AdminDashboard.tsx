import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { useFirebaseUser } from '../hooks/useFirebaseUser'
import { useCompanyId } from '../hooks/useCompanyId'
import { api } from '../lib/api'

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export type DailyRedemption = {
  date: string
  count: number
}

export type TopCoupon = {
  id: string
  title: string
  count: number
}

export type DashboardData = {
  totalCoupons: number
  totalRedemptions: number
  dailyRedemptions: DailyRedemption[]
  topCoupons: TopCoupon[]
}

export default function AdminDashboard() {
  const token = useFirebaseUser()
  const companyId = useCompanyId()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    if (!companyId) {
      setError('Missing company ID')
      setLoading(false)
      return
    }

    api<DashboardData>(`/dashboard/summary/${companyId}`, token)
      .then(setData)
      .catch(err => {
        console.error(err)
        setError('Failed to load dashboard')
      })
      .finally(() => setLoading(false))
  }, [token, companyId])

  if (loading) return <p className="p-4">Loading dashboard...</p>
  if (error) return <p className="p-4 text-red-600">{error}</p>
  if (!data) return null

  const chartData = {
    labels: data.dailyRedemptions.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Redemptions',
        data: data.dailyRedemptions.map(d => d.count),
        backgroundColor: '#4f46e5',
      },
    ],
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-sm text-gray-500">Total Coupons</p>
          <p className="text-3xl font-bold">{data.totalCoupons}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-sm text-gray-500">Total Redemptions</p>
          <p className="text-3xl font-bold">{data.totalRedemptions}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Redemptions per Day</h2>
        <Bar data={chartData} />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Top Redeemed Coupons</h2>
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="py-2 px-4 border">Coupon</th>
              <th className="py-2 px-4 border">Redemptions</th>
            </tr>
          </thead>
          <tbody>
            {data.topCoupons.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border">{c.title}</td>
                <td className="py-2 px-4 border">{c.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

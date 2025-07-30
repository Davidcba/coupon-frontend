import React from 'react'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend)

const AdminDashboard: React.FC = () => {
  const redemptionData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Redemptions',
        data: [100, 300, 250, 400, 450, 500, 600],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const audienceData = {
    labels: ['Mobile', 'Tablet', 'Desktop'],
    datasets: [
      {
        data: [60, 20, 20],
        backgroundColor: ['#3b82f6', '#60a5fa', '#93c5fd'],
        hoverOffset: 4,
      },
    ],
  }

  const demographicsData = {
    labels: ['18-24', '25-34', '35-44', '45+'],
    datasets: [
      {
        data: [25, 40, 20, 15],
        backgroundColor: ['#34d399', '#10b981', '#059669', '#047857'],
        hoverOffset: 4,
      },
    ],
  }

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      {/* Top metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-500">Total Active Coupons</h2>
          <p className="text-2xl font-bold">25</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-500">Total Redemptions</h2>
          <p className="text-2xl font-bold">1,492</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-500">Top Performing Coupon</h2>
          <p className="text-2xl font-bold">SUMMER25</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-500">Redemption Rate</h2>
          <p className="text-2xl font-bold">18.7%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Redemption Trends</h2>
          <Line data={redemptionData} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Audience Insights</h2>
          <div className="flex justify-around">
            <div className="w-1/2">
              <h3 className="text-sm font-medium mb-1">Device Types</h3>
              <Doughnut data={audienceData} />
            </div>
            <div className="w-1/2">
              <h3 className="text-sm font-medium mb-1">Demographics</h3>
              <Doughnut data={demographicsData} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded shadow overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Coupon Performance</h2>
        <table className="min-w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase border-b">
            <tr>
              <th className="px-4 py-2">Coupon Name</th>
              <th className="px-4 py-2">Campaign</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Redemptions</th>
              <th className="px-4 py-2">Impressions</th>
              <th className="px-4 py-2">CTR</th>
              <th className="px-4 py-2">Start Date</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['SAVE20', 'Spring Sale', 'Seasonal', 1024, '10,000', '4.7%', 'Sep 2020'],
              ['WELCOME10', 'Q1 Promo', 'Welcome Offer', 1656, '7,500', '25%', 'Jun 2020'],
              ['FREESHIP', 'Holiday Sale', 'Shipping', 1390, '12,400', '36%', 'Nov 2020'],
              ['DISCOUNT15', 'Year-End', 'Clearance', 1003, '5,500', '28%', 'Nov 2020'],
              ['BLACKFRIDAY', 'Black Friday', 'Clearance', 1350, '5,600', '30%', 'Feb 2021'],
            ].map(([name, camp, cat, red, imp, ctr, date], i) => (
              <tr key={i} className="border-b">
                <td className="px-4 py-2">{name}</td>
                <td className="px-4 py-2">{camp}</td>
                <td className="px-4 py-2">{cat}</td>
                <td className="px-4 py-2">{red}</td>
                <td className="px-4 py-2">{imp}</td>
                <td className="px-4 py-2">{ctr}</td>
                <td className="px-4 py-2">{date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminDashboard

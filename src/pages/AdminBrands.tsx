import { useEffect, useState, FormEvent } from 'react'
import { useFirebaseUser } from '../hooks/useFirebaseUser'
import { api } from '../lib/api'

export type Brand = {
  id: string
  name: string
}

export default function AdminBrands() {
  const token = useFirebaseUser()
  const [brands, setBrands] = useState<Brand[]>([])
  const [newBrand, setNewBrand] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    api<Brand[]>('/brands', token)
      .then(setBrands)
      .catch((err) => {
        console.error(err)
        setError('Failed to load brands')
      })
      .finally(() => setLoading(false))
  }, [token])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!token || !newBrand.trim()) return
    try {
      const created = await api<Brand>('/brands', token, {
        method: 'POST',
        body: JSON.stringify({ name: newBrand.trim() }),
      })
      setBrands([...brands, created])
      setNewBrand('')
    } catch (err) {
      console.error(err)
      alert('Failed to create brand')
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    if (!confirm('Delete this brand and all associated coupons?')) return
    try {
      await api(`/brands/${id}`, token, { method: 'DELETE' })
      setBrands(brands.filter((b) => b.id !== id))
    } catch (err) {
      console.error(err)
      alert('Failed to delete brand')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Brands</h1>
      <form onSubmit={handleCreate} className="mb-4 flex space-x-2">
        <input
          type="text"
          placeholder="Brand name"
          value={newBrand}
          onChange={(e) => setNewBrand(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </form>
      {loading && <p>Loading brands...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border">{b.name}</td>
                <td className="py-2 px-4 border">
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

import { useEffect } from 'react'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'

export default function Logout() {
  const navigate = useNavigate()

  useEffect(() => {
    auth.signOut().then(() => navigate('/login'))
  }, [navigate])

  return <p className="text-center mt-4">Logging out...</p>
}

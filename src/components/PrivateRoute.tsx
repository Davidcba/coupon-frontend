import { Navigate } from 'react-router-dom'
import { useFirebaseUserWithStatus } from '../hooks/useFirebaseWithStatus'
import { JSX } from 'react'

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token, loading } = useFirebaseUserWithStatus()

  if (loading) {
    return <p className="p-4">Loading...</p> // or a spinner
  }

  if (!token) {
    return <Navigate to="/login" />
  }

  return children
}

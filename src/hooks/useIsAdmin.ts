import { useMemo } from 'react'
import { useFirebaseUser } from './useFirebaseUser'

export const useIsAdmin = () => {
  const token = useFirebaseUser()
  return useMemo(() => {
    if (!token) return false
    try {
      const base64 = token.split('.')[1]
      const payload = JSON.parse(atob(base64))
      return payload.admin === true || payload.role === 'admin'
    } catch {
      return false
    }
  }, [token])
}

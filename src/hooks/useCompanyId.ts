import { useMemo } from 'react'
import { useFirebaseUser } from './useFirebaseUser'

export const useCompanyId = () => {
  const token = useFirebaseUser()
  return useMemo(() => {
    if (!token) return null
    try {
      const base64 = token.split('.')[1]
      const payload = JSON.parse(atob(base64))
      return (
        payload.companyId ||
        payload.companyID ||
        payload.company_id ||
        (payload.company && (payload.company.id || payload.company)) ||
        null
      )
    } catch {
      return null
    }
  }, [token])
}

import { useEffect, useMemo } from 'react'
import { useFirebaseUser } from './useFirebaseUser'

export const useCompanyId = () => {
  const token = useFirebaseUser()
  const companyId = useMemo(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('companyId')
      if (stored) return stored
    }

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

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (companyId) {
      sessionStorage.setItem('companyId', companyId)
    } else if (!token) {
      sessionStorage.removeItem('companyId')
    }
  }, [companyId, token])

  return companyId
}

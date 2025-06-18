import { useEffect, useMemo } from 'react'
import { useFirebaseUser } from './useFirebaseUser'

export type UserInfo = {
  userId: string | null
  companyId: string | null
  role: string | null
}

const parsePayload = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const companyId =
      payload.companyId ||
      payload.companyID ||
      payload.company_id ||
      (payload.company && (payload.company.id || payload.company)) ||
      null
    const role = payload.role || (payload.admin ? 'admin' : null)
    const userId =
      payload.userId ||
      payload.user_id ||
      payload.uid ||
      payload.sub ||
      null
    return { userId, companyId, role } as UserInfo
  } catch {
    return { userId: null, companyId: null, role: null }
  }
}

export const useUserInfo = (): UserInfo => {
  const token = useFirebaseUser()

  const info = useMemo(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('userInfo')
      if (stored) {
        try {
          return JSON.parse(stored) as UserInfo
        } catch {
          // ignore corrupted data
        }
      }
    }
    if (!token) return { userId: null, companyId: null, role: null }
    return parsePayload(token)
  }, [token])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (info.userId || info.companyId || info.role) {
      sessionStorage.setItem('userInfo', JSON.stringify(info))
    } else if (!token) {
      sessionStorage.removeItem('userInfo')
    }
  }, [info, token])

  return info
}

import { useEffect, useState } from 'react'
import { useFirebaseUser } from './useFirebaseUser'
import { api } from '../lib/api'
import { FeatureFlags } from '../types/Feature'

export const useFeatures = () => {
  const { token } = useFirebaseUser()
  const [features, setFeatures] = useState<FeatureFlags>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    api<FeatureFlags>('/companies/my-features', token)
      .then((data) => {
        setFeatures(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading features:', err)
        setLoading(false)
      })
  }, [token])

  return { features, loading }
}

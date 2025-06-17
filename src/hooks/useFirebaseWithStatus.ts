import { useEffect, useState } from 'react'
import { onAuthStateChanged, getIdToken } from 'firebase/auth'
import { auth } from '../firebase'

export function useFirebaseUserWithStatus() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await getIdToken(firebaseUser)
        setToken(idToken)
      } else {
        setToken(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { token, loading }
}

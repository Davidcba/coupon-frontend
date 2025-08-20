// src/hooks/useFirebaseUser.ts
import { useEffect, useState } from 'react';
import { onIdTokenChanged, getIdToken, User } from 'firebase/auth';
import { auth } from '../firebase';

type UseFirebaseUser = {
  user: User | null;
  token: string | null;
  loading: boolean;
};

export const useFirebaseUser = (): UseFirebaseUser => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (u) => {
      setUser(u ?? null);
      if (!u) {
        setToken(null);
        setLoading(false);
        return;
      }
      const t = await getIdToken(u);     // normal refresh
      setToken(t);
      setLoading(false);
    });

    // one forced refresh on mount (ensures new custom claims are included)
    (async () => {
      if (auth.currentUser) {
        const fresh = await getIdToken(auth.currentUser, true);
        setToken(fresh);
      }
      setLoading(false);
    })();

    return () => unsub();
  }, []);

  return { user, token, loading };
};

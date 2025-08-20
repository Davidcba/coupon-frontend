// src/hooks/useIsAdmin.ts
import { useEffect, useState } from 'react';
import { getIdTokenResult } from 'firebase/auth';
import { auth } from '../firebase';

export const useIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = auth.currentUser;
      if (!u) { mounted && setIsAdmin(false); setLoading(false); return; }
      const res = await getIdTokenResult(u, true); // force to pick new claims
      const role = (res.claims?.role as string | undefined)?.toUpperCase();
      mounted && setIsAdmin(role === 'ADMIN' || role === 'SUPERADMIN');
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  return { isAdmin, loading };
};

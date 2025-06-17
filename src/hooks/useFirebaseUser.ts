import { useEffect, useState } from 'react';
import { onAuthStateChanged, getIdToken } from 'firebase/auth';
import { auth } from '../firebase';

export const useFirebaseUser = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await getIdToken(firebaseUser);
        setToken(token);
      } else {
        setToken(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return token;
};

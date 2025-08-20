// src/hooks/useAuthToken.ts
import { useFirebaseUser } from './useFirebaseUser';

/**
 * Normalizes whatever your useFirebaseUser() returns into a string token (or null).
 * Works whether useFirebaseUser returns string|null or an object { token?: string }.
 */
export function useAuthToken(): string | null {
  const raw: any = useFirebaseUser();
  if (raw == null) return null;
  // If it's already a string, use it
  if (typeof raw === 'string') return raw;
  // If it's an object shape { token?: string }
  if (typeof raw === 'object' && typeof raw.token === 'string') return raw.token;
  return null;
}

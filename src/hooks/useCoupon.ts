// src/hooks/useCoupon.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFirebaseUser } from './useFirebaseUser';
import { CouponDetails, getCouponDetails, postView } from '../lib/api';

type UseCouponOptions = {
  trackView?: boolean;   // fire /analytics/view (default: true)
  signed?: boolean;      // include signed image URLs (default: true)
  ttlSeconds?: number;   // signed URL TTL (default: 21600 = 6h)
};

export function useCoupon(id: string, options: UseCouponOptions = {}) {
  const { token, loading: authLoading } = useFirebaseUser();
  const [data, setData] = useState<CouponDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const opts = {
    trackView: true,
    signed: true,
    ttlSeconds: 21600,
    ...options,
  };

  // avoid setState after unmount
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const reload = useCallback(async () => {
    if (!id) {
      if (isMounted.current) {
        setLoading(false);
        setError('Missing coupon id');
      }
      return;
    }
    if (!token) {
      if (isMounted.current) {
        setLoading(false);
        setError('Not authenticated.');
      }
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const details = await getCouponDetails(id, token, {
        signed: opts.signed,
        ttlSeconds: opts.ttlSeconds,
      });
      if (isMounted.current) setData(details);

      // fire-and-forget analytics; never block UI or surface errors
      if (opts.trackView) {
        postView(token, id).catch(() => {});
      }
    } catch (e: any) {
      if (isMounted.current) {
        setData(null);
        setError(e?.message ?? 'Failed to load coupon');
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [id, token, opts.signed, opts.ttlSeconds, opts.trackView]);

  useEffect(() => {
    if (authLoading) return;
    reload();
  }, [authLoading, reload]);

  return { data, loading, error, reload, token };
}

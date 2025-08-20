// src/pages/CouponDetailPage.tsx
import React, { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CouponImages } from '../components/CouponImages';
import { CouponImageUploader } from '../components/CouponImageUploader';
import { postView } from '../lib/api';
import { useFirebaseUser } from '../hooks/useFirebaseUser'; // <-- add

export default function CouponDetailPage() {
  const { id } = useParams<{ id: string }>();
  const couponId = id || '';

  // works whether your hook returns string|null or { token, loading }
  const u: any = useFirebaseUser();
  const token: string | null =
    typeof u === 'string' || u === null ? u : u?.token ?? null;

  const onUploaded = useCallback(() => {
    // You can lift state and call child.load() via ref; simplest is let CouponImages reload on token change:
    // Or add a key to remount: setKey(k => k + 1)
  }, []);

  // 🔹 Track “view” once per day per coupon, first time the tab is visible
  useEffect(() => {
    if (!couponId || !token) return;

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const key = `viewed:${couponId}:${today}`;
    if (sessionStorage.getItem(key)) return;

    let cancelled = false;
    const fire = async () => {
      try {
        if (cancelled) return;
        await postView(token, couponId);
        sessionStorage.setItem(key, '1'); // avoid duplicates this day
      } catch {
        // swallow silently; tracking failure shouldn't affect UX
      }
    };

    // Fire immediately if tab is visible; otherwise when it becomes visible/focused
    if (document.visibilityState === 'visible') fire();
    const onVisible = () => {
      if (!sessionStorage.getItem(key)) fire();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [couponId, token]);

  if (!couponId) return <div>Missing couponId</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">Coupon {couponId}</h1>

      <div className="flex items-center gap-2">
        <CouponImageUploader couponId={couponId} onDone={onUploaded} />
        <span className="text-sm text-gray-500">Pick a JPG/PNG/WebP (emulator)</span>
      </div>

      <hr />

      <CouponImages couponId={couponId} />
    </div>
  );
}

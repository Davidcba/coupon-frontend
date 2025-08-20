import React, { useEffect, useState } from 'react';
import { useFirebaseUser } from '../hooks/useFirebaseUser';
import { fetchSignedImages, CouponImageRow } from '../lib/fetchSignedImages';

export function CouponImages({ couponId }: { couponId: string }) {
  const { token } = useFirebaseUser();
  const [rows, setRows] = useState<CouponImageRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchSignedImages(couponId, token);
      setRows(data);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [couponId, token]);

  if (loading) return <div>Loading images…</div>;
  if (!rows.length) return <div>No images yet</div>;

  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
      {rows.map(img => (
        <figure key={img.id} className="rounded border overflow-hidden">
          <img src={img.imageUrl} alt={img.variant} loading="lazy" />
          <figcaption className="p-2 text-sm text-gray-600">{img.variant}</figcaption>
        </figure>
      ))}
    </div>
  );
}

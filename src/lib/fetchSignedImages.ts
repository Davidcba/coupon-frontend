export type CouponImageRow = {
  id: string;
  variant: 'orig' | 'web' | 'medium' | 'thumb';
  storagePath: string;
  imageUrl: string;
};
export async function fetchSignedImages(couponId: string, token: string) {
  const res = await fetch(`/coupons/${couponId}/images/signed?ttl=3600`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<CouponImageRow[]>;
}

import { uploadToEmulator as uploadToEmu } from "./uploadToEmulator";

export async function uploadCouponImage(
  couponId: string,
  file: File,
  token: string
) {
    const isDev = import.meta.env.DEV;

  if (isDev) {
    // Emulator path: upload via SDK
    const { storagePath, contentType, sizeBytes } = await uploadToEmu(couponId, file);
    // save metadata (orig)
    const metaRes = await fetch(`/coupons/${couponId}/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponId, storagePath, variant: 'orig', contentType, sizeBytes }),
    });
    if (!metaRes.ok) throw new Error(`save-meta ${metaRes.status}`);
    return metaRes.json();
  }
  // 1) infer type/ext
  const contentType = file.type || 'image/jpeg';
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();

  // 2) ask API for a signed url
  const signed = await fetch('/uploads/images/signed-url', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ couponId, contentType, ext }),
  }).then(r => {
    if (!r.ok) throw new Error(`signed-url ${r.status}`);
    return r.json();
  });

  // 3) PUT file to GCS
  await fetch(signed.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  }).then(r => {
    if (!r.ok) throw new Error(`upload ${r.status}`);
  });

  // 4) tell API we saved the original
  const meta = await fetch(`/coupons/${couponId}/images`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      couponId,
      storagePath: signed.storagePath,
      variant: 'orig',
      contentType,
      sizeBytes: file.size,
    }),
  }).then(r => {
    if (!r.ok) throw new Error(`save-meta ${r.status}`);
    return r.json();
  });

  return meta; // the created CouponImage row
}

// src/components/CouponImageUploader.tsx
import React, { useRef, useState } from 'react';
import { useFirebaseUser } from '../hooks/useFirebaseUser';
import { uploadCouponImage } from '../lib/uploadCouponImage';

export function CouponImageUploader({ couponId, onDone }: { couponId: string; onDone?: () => void; }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { token } = useFirebaseUser();
  const [busy, setBusy] = useState(false);

  const pick = () => inputRef.current?.click();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !token) return;
    setBusy(true);
    try {
      await uploadCouponImage(couponId, file, token);
      onDone?.();
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button onClick={pick} disabled={busy} className="px-3 py-2 rounded border">
        {busy ? 'Uploading…' : 'Upload image'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onChange}
      />
    </>
  );
}

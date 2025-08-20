import React, { useRef, useState } from 'react';
import { uploadCouponImage } from '../lib/uploadCouponImage';
import { useFirebaseUser } from '../hooks/useFirebaseUser';

export function CouponImageUploader({ couponId }: { couponId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { token } = useFirebaseUser();
  const [busy, setBusy] = useState(false);

  const onClick = () => inputRef.current?.click();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setBusy(true);
    try {
      await uploadCouponImage(couponId, file, token);
      // TODO: refresh list / toast success
    } catch (e) {
      console.error(e);
      // TODO: toast error
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  return (
    <>
      <button disabled={busy} onClick={onClick}>
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

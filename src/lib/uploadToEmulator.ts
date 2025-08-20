
import { storage } from '../firebase';
import { ref, uploadBytes } from 'firebase/storage';

export async function uploadToEmulator(couponId: string, file: File) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const contentType = file.type || 'image/jpeg';
  const uuid = (crypto as any).randomUUID ? crypto.randomUUID() : `${Date.now()}`;
  const storagePath = `coupons/${couponId}/orig/${uuid}.${ext}`;

  await uploadBytes(ref(storage, storagePath), file, { contentType });
  return { storagePath, contentType, sizeBytes: file.size };
}

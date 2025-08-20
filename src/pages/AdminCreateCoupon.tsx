// src/pages/AdminCreateCoupon.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthToken } from '../hooks/useAuthToken';
import {
  api,
  ApiError,
  requestImageSignedUrl,
  uploadToSignedUrl,
  saveOriginalImageRow,
} from '../lib/api';
import { uploadToEmulator } from '../lib/uploadToEmulator'; // dev-only helper; you already have this

type Brand = { id: string; name: string };
type Company = { id: string; name: string };

const CODE_TYPES = [
  { value: 'single', label: 'Single code' },
  { value: 'multiple', label: 'Multiple codes' },
] as const;

const LIMIT_TYPES = [
  { value: 'none', label: 'No limit' },
  { value: 'global', label: 'Global limit' },
  { value: 'per_user_per_month', label: 'Per user per month' },
] as const;

export default function AdminCreateCoupon() {
  const token = useAuthToken(); // raw JWT string (or undefined)
  const nav = useNavigate();

  // form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState('');
  const [category, setCategory] = useState('general');

  const [brandId, setBrandId] = useState('');
  const [companyId, setCompanyId] = useState('');

  const [codeType, setCodeType] = useState<'single' | 'multiple'>('single');
  const [code, setCode] = useState('');

  const [limitType, setLimitType] =
    useState<'none' | 'global' | 'per_user_per_month'>('none');
  const [totalLimit, setTotalLimit] = useState<number | ''>('');
  const [perUserPerMonthLimit, setPerUserPerMonthLimit] =
    useState<number | ''>('');

  // IMPORTANT: keep these as "YYYY-MM-DD" strings (from <input type="date">).
  // The backend now accepts date-only or ISO and converts safely.
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [published, setPublished] = useState(false);

  // image file
  const [file, setFile] = useState<File | null>(null);

  // lists
  const [brands, setBrands] = useState<Brand[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  // ui
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const disabled = useMemo(() => submitting || !token, [submitting, token]);

  // tiny authed fetch wrapper using shared api()
  const get = <T,>(path: string) => api<T>(path, token!);
  const post = <T,>(path: string, body: any) =>
    api<T>(path, token!, { method: 'POST', body: JSON.stringify(body) });

  // load brands/companies for selects
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      get<Brand[]>('/brands').catch(() => [] as Brand[]),
      get<Company[]>('/companies').catch(() => [] as Company[]),
    ])
      .then(([b, c]) => {
        setBrands(b ?? []);
        setCompanies(c ?? []);
        if (!brandId && b?.length) setBrandId(b[0].id);
        if (!companyId && c?.length) setCompanyId(c[0].id);
      })
      .catch((e: any) => setErr(e?.message ?? 'No se pudo cargar catálogos.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // submit
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // validations
    if (!title.trim()) return alert('Title is required');
    if (!brandId) return alert('Brand is required');
    if (codeType === 'single' && !code.trim())
      return alert('Code is required for single code type');
    if (limitType === 'global' && totalLimit === '')
      return alert('Global limit is required for global limit type');
    if (limitType === 'per_user_per_month' && perUserPerMonthLimit === '')
      return alert('Per-user/month limit is required for that limit type');

    setSubmitting(true);
    setErr(null);
    try {
      // 1) Create coupon
      // Send date-only strings (YYYY-MM-DD) or null. The backend converts safely.
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        terms: terms.trim() || null,
        category: category.trim() || null,

        brandId,
        companyId: companyId || null,

        codeType,
        code: codeType === 'single' ? code.trim() : null,

        limitType,
        totalLimit:
          limitType === 'global' ? (Number(totalLimit) || 0) : null,
        perUserPerMonthLimit:
          limitType === 'per_user_per_month'
            ? (Number(perUserPerMonthLimit) || 0)
            : null,

        published,
        startDate: startDate || null, // keep as "YYYY-MM-DD"
        endDate: endDate || null,     // keep as "YYYY-MM-DD"
      };

      const created = await post<{ id: string }>('/coupons', payload);
      const couponId = created.id;

      // 2) Optional image
      if (file) {
        if (import.meta.env.DEV) {
          // Dev: upload to emulator via helper you already have
          const up = await uploadToEmulator(couponId, file);
          await post(`/coupons/${couponId}/images`, {
            couponId,
            storagePath: up.storagePath,
            variant: 'orig',
            contentType: up.contentType,
            sizeBytes: up.sizeBytes,
          });
          // allow any async variant worker to run (only if you have one)
          await new Promise((r) => setTimeout(r, 1000));
        } else {
          // Prod: signed URL PUT
          const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
          const { uploadUrl, storagePath } = await requestImageSignedUrl(
            token!,
            couponId,
            ext,
            file.type || 'image/jpeg',
          );

          await uploadToSignedUrl(uploadUrl, file, file.type || 'image/jpeg');

          await saveOriginalImageRow(
            token!,
            couponId,
            storagePath,
            file.type || 'image/jpeg',
            file.size,
          );
        }
      }

      // 3) Go to details
      nav(`/coupon/${couponId}`);
    } catch (e: any) {
      console.error(e);
      const msg =
        (e as ApiError)?.body?.message ||
        (e as ApiError)?.message ||
        e?.message ||
        'Failed to create coupon';
      setErr(msg);
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">Create Coupon</h1>

      {err && (
        <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded">
          {err}
        </div>
      )}

      {loading ? (
        <div>Loading…</div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm">Title</span>
              <input
                className="border rounded px-2 py-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm">Category</span>
              <input
                className="border rounded px-2 py-1"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm">Description</span>
              <textarea
                className="border rounded px-2 py-1"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm">Terms</span>
              <textarea
                className="border rounded px-2 py-1"
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm">Brand</span>
              <select
                className="border rounded px-2 py-1"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                required
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm">Company (optional)</span>
              <select
                className="border rounded px-2 py-1"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
              >
                <option value="">— none —</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm">Code type</span>
              <select
                className="border rounded px-2 py-1"
                value={codeType}
                onChange={(e) =>
                  setCodeType(e.target.value as 'single' | 'multiple')
                }
              >
                {CODE_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value}>
                    {ct.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm">Code (when single)</span>
              <input
                className="border rounded px-2 py-1"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={codeType !== 'single'}
                placeholder={codeType === 'single' ? 'ABC-123' : '—'}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm">Limit type</span>
              <select
                className="border rounded px-2 py-1"
                value={limitType}
                onChange={(e) =>
                  setLimitType(
                    e.target.value as 'none' | 'global' | 'per_user_per_month',
                  )
                }
              >
                {LIMIT_TYPES.map((lt) => (
                  <option key={lt.value} value={lt.value}>
                    {lt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm">Global limit</span>
              <input
                type="number"
                className="border rounded px-2 py-1"
                value={totalLimit}
                onChange={(e) =>
                  setTotalLimit(e.target.value === '' ? '' : Number(e.target.value))
                }
                disabled={limitType !== 'global'}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm">Per-user / month limit</span>
              <input
                type="number"
                className="border rounded px-2 py-1"
                value={perUserPerMonthLimit}
                onChange={(e) =>
                  setPerUserPerMonthLimit(
                    e.target.value === '' ? '' : Number(e.target.value),
                  )
                }
                disabled={limitType !== 'per_user_per_month'}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm">Start date</span>
              <input
                type="date"
                className="border rounded px-2 py-1"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm">End date</span>
              <input
                type="date"
                className="border rounded px-2 py-1"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm">Image (JPG/PNG/WebP)</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="border rounded px-2 py-1"
              />
              <span className="text-xs text-gray-500">
                Optional. If provided, it will be uploaded after creation.
              </span>
            </label>

            <label className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              <span className="text-sm">Published</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={disabled}
              className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create coupon'}
            </button>
            <button
              type="button"
              onClick={() => nav(-1)}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// src/lib/api.ts
// Set in .env: VITE_API_BASE=http://localhost:3000
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE?.replace(/\/+$/, '') ||
  'http://localhost:3000';

function buildUrl(path: string) {
  return `${API_BASE}${path}`;
}

export class ApiError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any, message?: string) {
    super(message || body?.message || body?.error || `API ${status}`);
    this.status = status;
    this.body = body;
  }
}

/** ------------------------------------------------------------------
 * Generic JSON API helper
 * - Optional Bearer token
 * - Smart Content-Type for JSON bodies
 * ------------------------------------------------------------------ */
export async function api<T>(
  path: string,
  token?: string,                     // <-- made optional
  init: RequestInit = {},
): Promise<T> {
  const url = buildUrl(path);
  const headers = new Headers(init.headers as any);

  if (token) headers.set('Authorization', `Bearer ${token}`);

  const method = (init.method || 'GET').toUpperCase();
  const isForm = init.body instanceof FormData;
  const hasCT = [...headers.keys()].some((k) => k.toLowerCase() === 'content-type');

  if (!isForm && !hasCT && method !== 'GET' && method !== 'HEAD') {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  const data = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      })()
    : null;

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }
  return data as T;
}

/* ------------------------------------------------------------------ */
/* Types shared across features                                        */
/* ------------------------------------------------------------------ */

export type CouponImage = {
  id: string;
  variant: 'web' | 'medium' | 'thumb' | 'orig';
  storagePath: string;
  url?: string | null;
  width?: number | null;
  height?: number | null;
  contentType?: string | null;
  sizeBytes?: number | null;
  createdAt: string;
};

export type CouponDetails = {
  id: string;
  title: string;
  description: string;
  terms: string;
  codeType: 'single' | 'multiple';
  code: string | null;
  totalLimit: number | null;
  perUserPerMonthLimit: number | null;
  limitType: 'none' | 'global' | 'per_user_per_month';
  published: boolean;
  startDate: string | null;
  endDate: string | null;
  category: string;
  score: number;
  boosted: boolean;
  createdAt: string;
  updatedAt: string;
  brand: { id: string; name: string } | null;
  company: { id: string; name: string } | null;
  counts: { redemptions: number; codes: number };
  images: CouponImage[];
  coverImage: CouponImage | null;
};

/* Dashboard types */
export type StatSummary = {
  totalCoupons: number;
  activeCoupons: number;
  totalUsers: number;
  redemptions7d: number;
  redemptions30d: number;
};

export type DailyRow = { day: string; count: number };

/** Raw rows coming from several endpoints (brand/coupon/category) */
export type CountRow = { title?: string; label?: string; count: number };

/** Normalized rows for charts/lists */
export type NamedRow = { name: string; count: number };

const toNamed = (rows: CountRow[]): NamedRow[] =>
  rows.map((r) => ({ name: r.title ?? r.label ?? '(sin nombre)', count: r.count }));

/** Demographics aggregation */
export type DemographicsSummary = {
  gender: { label: string; count: number }[];
  age: { label: string; count: number }[];
  cities: { label: string; count: number }[];
};

/* ------------------------------------------------------------------ */
/* Coupon endpoints                                                     */
/* ------------------------------------------------------------------ */

/** Public list: published & active coupons. */
export type PublicCoupon = {
  id: string;
  title: string;
  description: string | null;
  code: string | null;
  startDate: string | null;
  endDate: string | null;
  category: string | null;
  published: boolean | null;
  imageUrl: string | null;
};

export async function getPublicCoupons(
  token: string,
  opts?: {
    signed?: boolean;     // default true
    ttlSeconds?: number;  // default 3600
    take?: number;        // default 50
  },
): Promise<PublicCoupon[]> {
  const q = new URLSearchParams();
  if (opts?.signed ?? true) q.set('signed', '1');
  if (opts?.ttlSeconds) q.set('ttl', String(opts.ttlSeconds));
  if (opts?.take) q.set('take', String(opts.take));
  const qs = q.toString();
  return api<PublicCoupon[]>(`/coupons/public${qs ? `?${qs}` : ''}`, token);
}


export async function getCouponDetails(
  id: string,
  token: string,
  opts: { signed?: boolean; ttlSeconds?: number } = {
    signed: true,
    ttlSeconds: 3600,
  },
): Promise<CouponDetails> {
  const q = new URLSearchParams();
  if (opts.signed) q.set('signed', '1');
  if (opts.ttlSeconds) q.set('ttl', String(opts.ttlSeconds));
  return api<CouponDetails>(`/coupons/${id}?${q.toString()}`, token);
}

export async function updateCoupon(
  id: string,
  token: string,
  body: Partial<
    Pick<
      CouponDetails,
      | 'title'
      | 'description'
      | 'terms'
      | 'codeType'
      | 'code'
      | 'totalLimit'
      | 'perUserPerMonthLimit'
      | 'limitType'
      | 'published'
      | 'startDate'
      | 'endDate'
      | 'category'
      | 'boosted'
    >
  >,
) {
  return api<CouponDetails>(`/coupons/${id}`, token, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/* Image upload helpers (signed URL flow) */
export async function requestImageSignedUrl(
  token: string,
  couponId: string,
  ext: string,
  contentType: string,
): Promise<{ uploadUrl: string; storagePath: string }> {
  return api(`/uploads/images/signed-url`, token, {
    method: 'POST',
    body: JSON.stringify({ couponId, ext, contentType }),
  });
}

export async function uploadToSignedUrl(
  uploadUrl: string,
  file: File,
  contentType: string,
) {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });
  if (!res.ok) throw new Error(`Upload failed (HTTP ${res.status})`);
}

export async function saveOriginalImageRow(
  token: string,
  couponId: string,
  storagePath: string,
  contentType: string,
  sizeBytes: number,
) {
  return api(`/coupons/${couponId}/images`, token, {
    method: 'POST',
    body: JSON.stringify({
      couponId,
      storagePath,
      variant: 'orig',
      contentType,
      sizeBytes,
    }),
  });
}

/* ------------------------------------------------------------------ */
/* Dashboard endpoints (match backend routes we implemented)           */
/* ------------------------------------------------------------------ */

export const getDashboardSummary = (token: string) =>
  api<StatSummary>('/dashboard/summary', token);

export const getDailyRedemptions = (token: string, days = 30) =>
  api<DailyRow[]>(`/dashboard/redemptions/daily?days=${days}`, token);

export const getTopBrands = async (token: string, limit = 7) => {
  const raw = await api<CountRow[]>(
    `/dashboard/top/brands?limit=${limit}`,
    token,
  );
  return toNamed(raw);
};

export const getTopCoupons = async (token: string, limit = 7) => {
  const raw = await api<CountRow[]>(
    `/dashboard/top/coupons?limit=${limit}`,
    token,
  );
  return toNamed(raw);
};

export const getCategories = async (token: string) => {
  const raw = await api<CountRow[]>(`/dashboard/categories`, token);
  return toNamed(raw);
};

/* Most viewed coupons (analytics) */
export const getTopViewed = async (token: string, days = 30, limit = 7) => {
  const raw = await api<CountRow[]>(
    `/analytics/top-viewed?days=${days}&limit=${limit}`,
    token,
  );
  return toNamed(raw);
};

/* Demographics (reports module) */
export const getDemographicsSummary = (token: string, days = 30) =>
  api<DemographicsSummary>(`/dashboard/demographics?days=${days}`, token);

/* Track a view for a coupon */
export const postView = (token: string, couponId: string) =>
  api('/analytics/view', token, {
    method: 'POST',
    body: JSON.stringify({ couponId }),
  });

export async function deleteCoupon(id: string, token: string) {
  return api<{ success: boolean; deleted: { coupon: number; images: number; codes: number } }>(
    `/coupons/${id}`,
    token,
    { method: 'DELETE' },
  );
}
export async function createCoupon(token: string, body: any) {
  return api('/coupons', token, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// src/pages/AdminCoupons.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { api, ApiError, deleteCoupon } from '../lib/api';
import { useFirebaseUser } from '../hooks/useFirebaseUser';
import { auth } from '../firebase';

type Row = {
  id: string;
  title: string;
  code: string | null;
  startDate: string | null;
  endDate: string | null;
};

// --------- helpers ----------
function formatDate(d?: string | null) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString();
  } catch {
    return '—';
  }
}

type Status = 'Active' | 'Upcoming' | 'Expired' | '—';

function getStatus(row: Row): Status {
  const now = Date.now();
  const start = row.startDate ? new Date(row.startDate).getTime() : undefined;
  const end = row.endDate ? new Date(row.endDate).getTime() : undefined;

  if (!start && !end) return '—';
  if (start && now < start) return 'Upcoming';
  if (end && now > end) return 'Expired';
  return 'Active';
}

function StatusBadge({ status }: { status: Status }) {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium';
  const styles: Record<Status, string> = {
    Active: `${base} bg-green-100 text-green-800 border border-green-200`,
    Upcoming: `${base} bg-amber-100 text-amber-800 border border-amber-200`,
    Expired: `${base} bg-rose-100 text-rose-800 border border-rose-200`,
    '—': `${base} bg-gray-100 text-gray-700 border border-gray-200`,
  };
  return <span className={styles[status]}>{status}</span>;
}

type SortKey = 'title' | 'code' | 'startDate' | 'endDate' | 'status';
type SortDir = 'asc' | 'desc';

function sortRows(rows: Row[], key: SortKey, dir: SortDir) {
  const sign = dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = key === 'status' ? getStatus(a) : (a as any)[key];
    const bv = key === 'status' ? getStatus(b) : (b as any)[key];

    // dates sort by timestamp
    if (key === 'startDate' || key === 'endDate') {
      const at = av ? new Date(av).getTime() : -Infinity;
      const bt = bv ? new Date(bv).getTime() : -Infinity;
      if (at === bt) return 0;
      return at > bt ? sign : -sign;
    }

    // null-safe string compare
    const as = (av ?? '').toString().toLowerCase();
    const bs = (bv ?? '').toString().toLowerCase();
    if (as === bs) return 0;
    return as > bs ? sign : -sign;
  });
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-gray-600" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 004 12z" />
    </svg>
  );
}

export default function AdminCoupons() {
  const { token, loading: authLoading } = useFirebaseUser();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});
  // UI state
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('title');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);

  const pageSize = 10;
  async function handleDelete(id: string, title: string) {
    if (!token) return;
    const ok = window.confirm(`¿Eliminar el cupón "${title}"? Esta acción no se puede deshacer.`);
    if (!ok) return;

    // optimistic UI
    setDeletingIds(s => ({ ...s, [id]: true }));
    const prev = rows;
    setRows(prev.filter(r => r.id !== id));

    try {
      await deleteCoupon(id, token);
      // success: nothing else to do
    } catch (e: any) {
      // rollback on error
      setRows(prev);
      alert(`No se pudo eliminar: ${e?.message || 'Error desconocido'}`);
    } finally {
      setDeletingIds(s => {
        const { [id]: _, ...rest } = s;
        return rest;
      });
    }
  }
  useEffect(() => {
    if (authLoading) return;
    if (!token) { setError('Not authenticated'); setLoading(false); return; }

    let cancelled = false;

    const load = async (t: string, alreadyRetried = false) => {
      setLoading(true); setError(null);
      try {
        // TODO: replace take with server paging if available
        const data = await api<Row[]>(`/coupons?take=200`, t);
        if (!cancelled) setRows(data);
      } catch (e: any) {
        const looksLikeInvalidToken =
          (e instanceof ApiError && e.status === 401) ||
          String(e?.message || '').toLowerCase().includes('invalid firebase token');

        if (!alreadyRetried && looksLikeInvalidToken) {
          const fresh = await auth.currentUser?.getIdToken(true);
          if (fresh) return load(fresh, true);
        }
        if (!cancelled) setError(e?.message || 'Failed to load coupons');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load(token);
    return () => { cancelled = true; };
  }, [token, authLoading]);

  // derived data
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const base = query
      ? rows.filter(r =>
        r.title.toLowerCase().includes(query) ||
        (r.code ?? '').toLowerCase().includes(query)
      )
      : rows;
    return sortRows(base, sortKey, sortDir);
  }, [rows, q, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const onHeaderClick = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const resetErrorAndReload = async () => {
    setError(null);
    setLoading(true);
    try {
      const fresh = token ?? (await auth.currentUser?.getIdToken(true));
      if (!fresh) throw new Error('Not authenticated');
      const data = await api<Row[]>(`/coupons?take=200`, fresh);
      setRows(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Todos los Cupones</h1>
          <p className="text-gray-500 text-sm">Busca y administra tus cupones</p>
        </div>
        <a
          href="/admin/coupons/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-blue-700"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          Crear Cupón
        </a>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="relative w-full md:max-w-sm">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Busca por Cupon o código…"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none">
            <path d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{filtered.length}</span>
          <span>Resultado{filtered.length === 1 ? '' : 's'}</span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-800">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-medium">Algo salio mal al cargar tus cupones</div>
              <div className="text-sm opacity-80">{error}</div>
            </div>
            <button
              onClick={resetErrorAndReload}
              className="rounded-md bg-rose-700 text-white px-3 py-1.5 text-sm hover:bg-rose-800"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="text-gray-700">
              {[
                { key: 'title', label: 'Cupon' },
                { key: 'code', label: 'Codigo' },
                { key: 'startDate', label: 'Inicio' },
                { key: 'endDate', label: 'Fin' },
                { key: 'status', label: 'Estado' },
              ].map(({ key, label }) => {
                const active = sortKey === (key as SortKey);
                return (
                  <th
                    key={key}
                    className="whitespace-nowrap px-4 py-3 font-semibold cursor-pointer select-none"
                    onClick={() => onHeaderClick(key as SortKey)}
                    title="Click to sort"
                  >
                    <div className="inline-flex items-center gap-1">
                      <span>{label}</span>
                      <svg
                        className={`h-3.5 w-3.5 ${active ? 'opacity-100' : 'opacity-30'}`}
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        {active && sortDir === 'asc' ? (
                          <path d="M7 14l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        ) : (
                          <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        )}
                      </svg>
                    </div>
                  </th>
                );
              })}
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {/* Loading skeleton */}
            {loading && !rows.length && Array.from({ length: 8 }).map((_, i) => (
              <tr key={`sk-${i}`} className="border-t border-gray-100">
                {Array.from({ length: 6 }).map((__, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 w-full max-w-[220px] animate-pulse rounded bg-gray-200" />
                  </td>
                ))}
              </tr>
            ))}

            {/* Data rows */}
            {!loading && paged.map(r => {
              const status = getStatus(r);
              return (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.title}</td>
                  <td className="px-4 py-3 tabular-nums">{r.code ?? '—'}</td>
                  <td className="px-4 py-3">{formatDate(r.startDate)}</td>
                  <td className="px-4 py-3">{formatDate(r.endDate)}</td>
                  <td className="px-4 py-3"><StatusBadge status={status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a
                        className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
                        href={`/admin/coupons/${r.id}`}
                      >
                        Ver / Editar
                      </a>
                      <span className="text-gray-300">•</span>
                      <button
                        onClick={() => handleDelete(r.id, r.title)}
                        disabled={!!deletingIds[r.id]}
                        className={`rounded-md border px-2 py-1 text-sm ${deletingIds[r.id]
                            ? 'opacity-60 cursor-not-allowed'
                            : 'hover:bg-rose-50 border-rose-300 text-rose-700'
                          }`}
                        title="Eliminar cupón permanentemente"
                        aria-label={`Eliminar cupón ${r.title}`}
                      >
                        {deletingIds[r.id] ? 'Eliminando…' : 'Eliminar'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Empty state */}
            {!loading && !error && !filtered.length && (
              <tr>
                <td className="px-4 py-10 text-center text-gray-500" colSpan={6}>
                  <div className="flex flex-col items-center gap-2">
                    <svg className="h-8 w-8 text-gray-300" viewBox="0 0 24 24" fill="none">
                      <path d="M4 6h16M4 10h16M4 14h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <div className="font-medium">No coupons match your search</div>
                    <div className="text-sm">Try a different keyword, or create a new coupon.</div>
                    <a href="/admin/coupons/new" className="mt-1 rounded-md bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-700">
                      Create Coupon
                    </a>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            Mostrando <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>–
            <span className="font-medium">{Math.min(currentPage * pageSize, filtered.length)}</span> de{' '}
            <span className="font-medium">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Anterior
            </button>
            <div className="text-sm tabular-nums">
              Siguiente <span className="font-medium">{currentPage}</span> / {totalPages}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Bottom loading bar */}
      {loading && rows.length > 0 && (
        <div className="mt-4 inline-flex items-center gap-2 text-gray-600 text-sm">
          <Spinner /> <span>Refreshing…</span>
        </div>
      )}
    </div>
  );
}

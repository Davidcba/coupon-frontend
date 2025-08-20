import { useEffect, useMemo, useState } from 'react';
import {
  getCategories,
  getDailyRedemptions,
  getDashboardSummary,
  getTopBrands,
  getTopCoupons,
  getTopViewed,
  getDemographicsSummary,
  type NamedRow,
  type DailyRow,
  type StatSummary,
  type DemographicsSummary,
} from '../lib/api';
import { useAuthToken } from '../hooks/useAuthToken';
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, Tooltip,
  XAxis, YAxis, ResponsiveContainer, Cell,
} from 'recharts';

/* ---------- UI helpers ---------- */
function Card({ title, children, right }:{
  title: string; children: React.ReactNode; right?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base md:text-lg font-semibold text-gray-800">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value, hint }:{ label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {hint && <div className="text-xs text-gray-400 mt-0.5">{hint}</div>}
    </div>
  );
}

function Segmented({
  value, onChange, options,
}:{
  value: string | number;
  onChange: (v:any)=>void;
  options: { label: string; value: any }[];
}) {
  return (
    <div className="inline-flex rounded-xl border border-gray-200 overflow-hidden">
      {options.map((opt, idx) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={[
            'px-3 md:px-4 py-2 text-sm',
            value === opt.value ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50',
            idx !== options.length - 1 ? 'border-r border-gray-200' : '',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const PIE_COLORS = ['#60a5fa', '#34d399', '#f472b6', '#f59e0b', '#a78bfa', '#f87171', '#22d3ee', '#4ade80'];

/* ---------- Page ---------- */
export default function AdminDashboard() {
  const token = useAuthToken();              // string | null
  const hasToken = !!token;

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError]     = useState<string | null>(null);

  // controls
  const [days, setDays]   = useState(30);
  const [limit, setLimit] = useState(7);

  // data
  const [summary, setSummary]     = useState<StatSummary | null>(null);
  const [daily, setDaily]         = useState<DailyRow[]>([]);
  const [topViewed, setTopViewed] = useState<NamedRow[]>([]);
  const [topBrands, setTopBrands] = useState<NamedRow[]>([]);
  const [topCoupons, setTopCoupons] = useState<NamedRow[]>([]);
  const [categories, setCategories] = useState<NamedRow[]>([]);
  const [demos, setDemos] = useState<DemographicsSummary | null>(null);

  useEffect(() => {
    if (!token) return; // wait for auth
    setLoading(true);
    setError(null);

    Promise
      .all([
        getDashboardSummary(token),
        getDailyRedemptions(token, days),
        getTopViewed(token, days, limit),
        getTopBrands(token, limit),
        getTopCoupons(token, limit),
        getCategories(token),
        getDemographicsSummary(token, days),
      ])
      .then(([s, d, tv, tb, tc, cat, dem]) => {
        setSummary(s);
        setDaily(d);
        setTopViewed(tv);
        setTopBrands(tb);
        setTopCoupons(tc);
        setCategories(cat);
        setDemos(dem);
      })
      .catch(() => setError('No se pudieron cargar los datos'))
      .finally(() => setLoading(false));
  }, [token, days, limit]);

  const dailyData = useMemo(
    () => daily.map(r => ({ ...r, dayShort: r.day.slice(5) })), // e.g. "08-19"
    [daily]
  );

  if (!hasToken) return <div className="p-6">Cargando…</div>;
  if (loading)    return <div className="p-6">Cargando panel…</div>;
  if (error)      return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Cupones totales" value={summary?.totalCoupons ?? 0} />
        <Stat label="Cupones activos" value={summary?.activeCoupons ?? 0} />
        <Stat label="Usuarios" value={summary?.totalUsers ?? 0} />
        <Stat
          label="Canjes (30d)"
          value={summary?.redemptions30d ?? 0}
          hint={`Últimos 7d: ${summary?.redemptions7d ?? 0}`}
        />
      </div>

      {/* controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          value={days}
          onChange={setDays}
          options={[
            { label: '7 días', value: 7 },
            { label: '30 días', value: 30 },
            { label: '90 días', value: 90 },
          ]}
        />
        <Segmented
          value={limit}
          onChange={setLimit}
          options={[
            { label: 'Top 5', value: 5 },
            { label: 'Top 7', value: 7 },
            { label: 'Top 10', value: 10 },
          ]}
        />
      </div>

      {/* daily */}
      <Card title={`Canjes diarios (últimos ${days} días)`}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dayShort" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#1f2937" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* grids */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-25">
        {/* Top viewed */}
        <Card title={`Cupones más vistos (últimos ${days} días)`}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topViewed}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>

            <ul className="mt-3 text-sm text-gray-600 space-y-1">
              {topViewed.map((r, i) => (
                <li key={i} className="truncate">{r.name} — {r.count}</li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Top brands */}
        <Card title={`Marcas con más canjes (Top ${limit})`}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topBrands}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>

            <ul className="mt-3 text-sm text-gray-600 space-y-1">
              {topBrands.map((r, i) => (
                <li key={i} className="truncate">{r.name} — {r.count}</li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Top coupons */}
        <Card title={`Cupones con más canjes (Top ${limit})`}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCoupons}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>

            <ul className="mt-3 text-sm text-gray-600 space-y-1">
              {topCoupons.map((r, i) => (
                <li key={i} className="truncate">{r.name} — {r.count}</li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Categories */}
        <Card title="Categorías con más canjes">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="count"
                  nameKey="name"
                  cx="50%" cy="50%" outerRadius={90}
                  label={(e:any) => `${e.name}: ${e.count}`}
                  labelLine={false}
                >
                  {categories.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <ul className="mt-3 text-sm text-gray-600 space-y-1">
              {categories.map((r, i) => (
                <li key={i} className="truncate">{r.name} — {r.count}</li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-25">

      <Card title={`Demografía de usuarios`}>
          {!demos ? (
          <div className="text-gray-500 text-sm">Sin datos</div>
        ) : (  
            <div className="h-72">
              <div className="text-sm font-medium mb-2">Género</div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={demos.gender} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={80} label>
                    {demos.gender.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
        )}  
      </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-25">

      <Card title={`Demografía de usuarios`}>
          {!demos ? (
          <div className="text-gray-500 text-sm">Sin datos</div>
        ) : (  
            <div className="h-55">
              <div className="text-sm font-medium mb-2">Rango de edad</div>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demos.age}>
                  <CartesianGrid strokeDasharray="3 3" />
                  
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
        )}  
      </Card>
      </div>
      
    </div>
  );
}

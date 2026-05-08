import { useEffect, useState } from 'react';
import { api, getApiError } from '../../api';
import StatCard from '../../components/StatCard.jsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/stats')
      .then(({ data }) => setStats(data.stats))
      .catch((err) => setError(getApiError(err)));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-slate-600">Question bank and usage totals.</p>
      </div>
      {error && <div className="rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Users" value={stats?.users ?? '-'} />
        <StatCard label="Total Questions" value={stats?.questions ?? '-'} tone="brass" />
        <StatCard label="Exams Taken" value={stats?.exams ?? '-'} tone="berry" />
      </div>
      <div className="panel p-5">
        <h2 className="text-lg font-semibold">Question Inventory</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {(stats?.by_category || []).map((item) => (
            <div key={item.category} className="rounded border border-slate-200 p-4">
              <p className="capitalize text-slate-500">{item.category}</p>
              <p className="mt-1 text-2xl font-semibold">{item.total}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

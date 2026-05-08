import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getApiError } from '../api';
import StatCard from '../components/StatCard.jsx';

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/exam/history')
      .then(({ data }) => setHistory(data.exams || []))
      .catch((err) => setError(getApiError(err)));
  }, []);

  const latest = history[0];
  const average = history.length
    ? Math.round(history.reduce((sum, exam) => sum + (exam.score / exam.total) * 100, 0) / history.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-slate-600">Start a practice set or continue tracking your progress.</p>
        </div>
        <Link className="focus-ring rounded bg-signal px-4 py-2 font-semibold text-white" to="/exam/start">
          Start Exam
        </Link>
      </div>
      {error && <div className="rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Attempts" value={history.length} />
        <StatCard label="Average Score" value={`${average}%`} tone="brass" />
        <StatCard label="Latest Score" value={latest ? `${latest.score}/${latest.total}` : 'None'} tone="berry" />
      </div>
      <div className="panel p-5">
        <h2 className="text-lg font-semibold">Recent Exams</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-2">Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Score</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 5).map((exam) => (
                <tr key={exam.id} className="border-b border-slate-100">
                  <td className="py-3">{new Date(exam.created_at).toLocaleString()}</td>
                  <td>{exam.exam_type}</td>
                  <td>{exam.category || 'Mixed'}</td>
                  <td>{exam.score}/{exam.total}</td>
                  <td><Link className="text-signal" to={`/exam/result/${exam.id}`}>Review</Link></td>
                </tr>
              ))}
              {!history.length && (
                <tr>
                  <td className="py-4 text-slate-500" colSpan="5">No completed exams yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

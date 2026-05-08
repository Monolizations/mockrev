import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getApiError } from '../api';
import ScoreGraph from '../components/ScoreGraph.jsx';

export default function History() {
  const [exams, setExams] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/exam/history')
      .then(({ data }) => setExams(data.exams || []))
      .catch((err) => setError(getApiError(err)));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">History</h1>
        <p className="text-slate-600">Review completed attempts and watch your score trend.</p>
      </div>
      {error && <div className="rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      <ScoreGraph exams={exams} />
      <div className="panel overflow-x-auto p-5">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="py-2">Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Duration</th>
              <th>Score</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam.id} className="border-b border-slate-100">
                <td className="py-3">{new Date(exam.created_at).toLocaleString()}</td>
                <td>{exam.exam_type}</td>
                <td>{exam.category || 'Mixed'}</td>
                <td>{exam.duration} min</td>
                <td>{exam.score}/{exam.total}</td>
                <td><Link className="text-signal" to={`/exam/result/${exam.id}`}>Review</Link></td>
              </tr>
            ))}
            {!exams.length && (
              <tr>
                <td className="py-4 text-slate-500" colSpan="6">No exam history yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

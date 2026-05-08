import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, getApiError } from '../api';

export default function ExamResult() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/exam/result/${id}`)
      .then(({ data }) => setResult(data))
      .catch((err) => setError(getApiError(err)));
  }, [id]);

  if (error) return <div className="rounded bg-rose-50 p-4 text-rose-700">{error}</div>;
  if (!result) return <div className="panel p-5">Loading result...</div>;

  const { exam, breakdown, incorrect } = result;
  const percentage = exam.total ? Math.round((exam.score / exam.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="panel p-6">
        <p className="text-sm uppercase tracking-wide text-slate-500">Result</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl font-semibold text-signal">{exam.score}/{exam.total}</h1>
            <p className="mt-2 text-lg text-slate-600">{percentage}% score</p>
          </div>
          <Link className="focus-ring rounded bg-signal px-4 py-2 font-semibold text-white" to="/exam/start">
            Take Another
          </Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {breakdown.map((item) => (
          <div key={item.category} className="panel p-4">
            <p className="text-sm capitalize text-slate-500">{item.category}</p>
            <p className="mt-2 text-2xl font-semibold">{item.score}/{item.total}</p>
          </div>
        ))}
      </div>
      <div className="panel p-5">
        <h2 className="text-lg font-semibold">Incorrect Answers</h2>
        <div className="mt-4 space-y-4">
          {incorrect.map((item) => (
            <div key={item.question_id} className="rounded border border-slate-200 p-4">
              <p className="font-medium">{item.question}</p>
              <p className="mt-2 text-sm text-rose-700">Your answer: {item.selected_answer || 'Blank'}</p>
              <p className="text-sm text-signal">Correct answer: {item.correct_answer}</p>
            </div>
          ))}
          {!incorrect.length && <p className="text-slate-500">No incorrect answers. Clean work.</p>}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getApiError } from '../api';

const categories = ['abstract', 'verbal', 'numerical', 'general'];

export default function ExamStart() {
  const navigate = useNavigate();
  const [type, setType] = useState('full');
  const [category, setCategory] = useState('abstract');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function startExam() {
    setError('');
    setSaving(true);
    try {
      const payload = type === 'full' ? { type } : { type, category };
      const { data } = await api.post('/exam/start', payload);
      localStorage.setItem('afpsat_active_exam', String(data.exam.id));
      navigate('/exam/test');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Start Exam</h1>
        <p className="text-slate-600">Full mocks run for 90 minutes. Category exams run for 30 minutes.</p>
      </div>
      {error && <div className="rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2">
        <button
          onClick={() => setType('full')}
          className={`focus-ring panel p-5 text-left ${type === 'full' ? 'border-signal ring-2 ring-signal' : ''}`}
        >
          <h2 className="text-lg font-semibold">Full Mock Exam</h2>
          <p className="mt-2 text-sm text-slate-600">60 questions: 15 each from abstract, verbal, numerical, and general.</p>
        </button>
        <button
          onClick={() => setType('category')}
          className={`focus-ring panel p-5 text-left ${type === 'category' ? 'border-signal ring-2 ring-signal' : ''}`}
        >
          <h2 className="text-lg font-semibold">Category Exam</h2>
          <p className="mt-2 text-sm text-slate-600">15 balanced questions from a single category.</p>
        </button>
      </div>
      {type === 'category' && (
        <label className="block max-w-sm">
          <span className="text-sm font-medium text-slate-700">Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="focus-ring mt-1 w-full rounded border border-slate-300 px-3 py-2 capitalize"
          >
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      )}
      <button
        onClick={startExam}
        disabled={saving}
        className="focus-ring rounded bg-signal px-5 py-3 font-semibold text-white disabled:opacity-60"
      >
        {saving ? 'Preparing...' : 'Begin'}
      </button>
    </div>
  );
}

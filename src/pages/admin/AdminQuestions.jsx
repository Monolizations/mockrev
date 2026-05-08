import { useEffect, useState } from 'react';
import { Edit, Plus, Trash2, X } from 'lucide-react';
import { api, getApiError } from '../../api';

const emptyForm = {
  category: 'abstract',
  question: '',
  choice_a: '',
  choice_b: '',
  choice_c: '',
  choice_d: '',
  correct_answer: 'A',
  difficulty: 'easy',
};
const categories = ['abstract', 'verbal', 'numerical', 'general'];
const difficulties = ['easy', 'medium', 'hard'];

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({ category: '', difficulty: '' });
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadQuestions() {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    const { data } = await api.get(`/questions?${params.toString()}`);
    setQuestions(data.questions || []);
  }

  useEffect(() => {
    loadQuestions().catch((err) => setError(getApiError(err)));
  }, [filters.category, filters.difficulty]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(question) {
    setEditing(question.id);
    setForm({
      category: question.category,
      question: question.question,
      choice_a: question.choice_a,
      choice_b: question.choice_b,
      choice_c: question.choice_c,
      choice_d: question.choice_d,
      correct_answer: question.correct_answer,
      difficulty: question.difficulty,
    });
    setShowForm(true);
  }

  async function save(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      if (editing) await api.put(`/admin/questions/${editing}`, form);
      else await api.post('/admin/questions', form);
      setNotice(editing ? 'Question updated.' : 'Question added.');
      setShowForm(false);
      await loadQuestions();
    } catch (err) {
      setError(getApiError(err));
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this question?')) return;
    setError('');
    setNotice('');
    try {
      await api.delete(`/admin/questions/${id}`);
      setNotice('Question deleted.');
      await loadQuestions();
    } catch (err) {
      setError(getApiError(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Questions</h1>
          <p className="text-slate-600">Manage the AFPSAT question bank.</p>
        </div>
        <button onClick={openCreate} className="focus-ring inline-flex items-center gap-2 rounded bg-signal px-4 py-2 font-semibold text-white">
          <Plus size={18} />
          Add Question
        </button>
      </div>
      {error && <div className="rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      {notice && <div className="rounded bg-teal-50 p-3 text-sm text-signal">{notice}</div>}
      <div className="panel flex flex-wrap gap-3 p-4">
        <Select label="Category" value={filters.category} onChange={(category) => setFilters({ ...filters, category })}>
          <option value="">All categories</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </Select>
        <Select label="Difficulty" value={filters.difficulty} onChange={(difficulty) => setFilters({ ...filters, difficulty })}>
          <option value="">All difficulties</option>
          {difficulties.map((item) => <option key={item} value={item}>{item}</option>)}
        </Select>
      </div>
      {showForm && (
        <div className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{editing ? 'Edit Question' : 'Add Question'}</h2>
            <button className="focus-ring rounded p-2 hover:bg-slate-100" onClick={() => setShowForm(false)} aria-label="Close form">
              <X size={18} />
            </button>
          </div>
          <QuestionForm form={form} setForm={setForm} onSubmit={save} />
        </div>
      )}
      <div className="panel overflow-x-auto p-5">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="py-2">Question</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Correct</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.id} className="border-b border-slate-100 align-top">
                <td className="max-w-xl py-3">{question.question}</td>
                <td className="capitalize">{question.category}</td>
                <td className="capitalize">{question.difficulty}</td>
                <td>{question.correct_answer}</td>
                <td className="flex gap-2 py-2">
                  <button onClick={() => openEdit(question)} className="focus-ring rounded border border-slate-300 p-2" aria-label="Edit question">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => remove(question.id)} className="focus-ring rounded border border-slate-300 p-2 text-rose-700" aria-label="Delete question">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {!questions.length && (
              <tr>
                <td className="py-4 text-slate-500" colSpan="5">No questions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Select({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="focus-ring mt-1 rounded border border-slate-300 px-3 py-2 capitalize">
        {children}
      </select>
    </label>
  );
}

function QuestionForm({ form, setForm, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Select label="Category" value={form.category} onChange={(category) => setForm({ ...form, category })}>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </Select>
        <Select label="Difficulty" value={form.difficulty} onChange={(difficulty) => setForm({ ...form, difficulty })}>
          {difficulties.map((item) => <option key={item} value={item}>{item}</option>)}
        </Select>
        <Select label="Correct Answer" value={form.correct_answer} onChange={(correct_answer) => setForm({ ...form, correct_answer })}>
          {['A', 'B', 'C', 'D'].map((item) => <option key={item} value={item}>{item}</option>)}
        </Select>
      </div>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Question</span>
        <textarea required value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })} className="focus-ring mt-1 min-h-24 w-full rounded border border-slate-300 px-3 py-2" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        {['a', 'b', 'c', 'd'].map((letter) => (
          <label key={letter} className="block">
            <span className="text-sm font-medium text-slate-700">Choice {letter.toUpperCase()}</span>
            <input required value={form[`choice_${letter}`]} onChange={(event) => setForm({ ...form, [`choice_${letter}`]: event.target.value })} className="focus-ring mt-1 w-full rounded border border-slate-300 px-3 py-2" />
          </label>
        ))}
      </div>
      <button className="focus-ring w-fit rounded bg-signal px-4 py-2 font-semibold text-white">Save Question</button>
    </form>
  );
}

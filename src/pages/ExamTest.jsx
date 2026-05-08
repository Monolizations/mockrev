import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getApiError } from '../api';

function formatSeconds(seconds) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export default function ExamTest() {
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const examId = localStorage.getItem('afpsat_active_exam');
    if (!examId) {
      navigate('/exam/start');
      return;
    }
    api
      .get(`/exam/${examId}`)
      .then(({ data }) => {
        setExam(data.exam);
        const initial = {};
        data.exam.questions.forEach((question) => {
          if (question.selected_answer) initial[question.id] = question.selected_answer;
        });
        setAnswers(initial);
      })
      .catch((err) => setError(getApiError(err)));
  }, [navigate]);

  useEffect(() => {
    if (!exam?.expires_at) return undefined;
    const tick = () => {
      const expires = new Date(exam.expires_at).getTime();
      setSecondsLeft(Math.ceil((expires - Date.now()) / 1000));
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [exam]);

  async function submit(auto = false) {
    if (submitting || !exam) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        exam_id: exam.id,
        answers: Object.entries(answers).map(([question_id, selected_answer]) => ({
          question_id: Number(question_id),
          selected_answer,
        })),
      };
      const { data } = await api.post('/exam/submit', payload);
      localStorage.removeItem('afpsat_active_exam');
      navigate(`/exam/result/${data.exam_id}`);
    } catch (err) {
      setError(auto ? `Auto-submit failed: ${getApiError(err)}` : getApiError(err));
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (exam && secondsLeft <= 0 && !submitting) submit(true);
  }, [secondsLeft, exam, submitting]);

  const questions = exam?.questions || [];
  const current = questions[page];
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  if (error && !exam) return <div className="rounded bg-rose-50 p-4 text-rose-700">{error}</div>;
  if (!exam) return <div className="panel p-5">Loading exam...</div>;

  return (
    <div className="space-y-5">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-[#f6f8fb] py-3">
        <div>
          <h1 className="text-2xl font-semibold">Exam</h1>
          <p className="text-sm text-slate-600">{answeredCount}/{questions.length} answered</p>
        </div>
        <div className="rounded bg-ink px-4 py-2 font-mono text-lg font-semibold text-white">
          {formatSeconds(secondsLeft)}
        </div>
      </div>
      {error && <div className="rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      <div className="panel p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <span className="rounded bg-mist px-3 py-1 text-sm font-medium capitalize">
            {current.category} / {current.difficulty}
          </span>
          <span className="text-sm text-slate-500">Question {page + 1} of {questions.length}</span>
        </div>
        <p className="text-lg font-medium leading-relaxed">{current.question}</p>
        <div className="mt-5 grid gap-3">
          {['A', 'B', 'C', 'D'].map((letter) => (
            <button
              key={letter}
              onClick={() => setAnswers({ ...answers, [current.id]: letter })}
              className={`focus-ring rounded border p-4 text-left ${
                answers[current.id] === letter
                  ? 'border-signal bg-teal-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <span className="mr-3 font-semibold">{letter}.</span>
              {current[`choice_${letter.toLowerCase()}`]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="focus-ring rounded border border-slate-300 px-4 py-2 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            disabled={page === questions.length - 1}
            onClick={() => setPage(page + 1)}
            className="focus-ring rounded border border-slate-300 px-4 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </div>
        <button
          disabled={submitting}
          onClick={() => submit(false)}
          className="focus-ring rounded bg-signal px-5 py-2 font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Submit Exam'}
        </button>
      </div>
      <div className="grid grid-cols-10 gap-2">
        {questions.map((question, index) => (
          <button
            key={question.id}
            onClick={() => setPage(index)}
            className={`focus-ring h-9 rounded text-sm font-medium ${
              page === index ? 'bg-ink text-white' : answers[question.id] ? 'bg-teal-100 text-signal' : 'bg-white text-slate-600'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

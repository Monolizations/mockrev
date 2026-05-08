import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiError } from '../api';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthShell title="Welcome back">
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
        <Field label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(password) => setForm({ ...form, password })}
        />
        <button disabled={saving} className="focus-ring w-full rounded bg-signal px-4 py-3 font-semibold text-white disabled:opacity-60">
          {saving ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="text-center text-sm text-slate-600">
          No account? <Link className="font-medium text-signal" to="/register">Create one</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function AuthShell({ title, children }) {
  return (
    <div className="grid min-h-screen place-items-center bg-mist px-4">
      <div className="panel w-full max-w-md p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">AFPSAT</p>
        <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, value, onChange, type = 'text', as = 'input', children, required = true }) {
  const Control = as;
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <Control
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring mt-1 w-full rounded border border-slate-300 px-3 py-2"
      >
        {children}
      </Control>
    </label>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiError } from '../api';
import { useAuth } from '../auth.jsx';
import { AuthShell, Field } from './Login.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthShell title="Create your account">
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
        <Field label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
        <Field label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(password) => setForm({ ...form, password })}
        />
        <button disabled={saving} className="focus-ring w-full rounded bg-signal px-4 py-3 font-semibold text-white disabled:opacity-60">
          {saving ? 'Creating...' : 'Register'}
        </button>
        <p className="text-center text-sm text-slate-600">
          Already registered? <Link className="font-medium text-signal" to="/login">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { api, getApiError } from '../../api';

export default function AdminImport() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!file) return;
    setError('');
    setResult(null);
    setSaving(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post('/admin/questions/import', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bulk Import</h1>
        <p className="text-slate-600">Upload a CSV with category, question, choices, answer, and difficulty.</p>
      </div>
      {error && <div className="rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      <form onSubmit={submit} className="panel max-w-xl space-y-4 p-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">CSV file</span>
          <input
            required
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="focus-ring mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <button disabled={saving} className="focus-ring inline-flex items-center gap-2 rounded bg-signal px-4 py-2 font-semibold text-white disabled:opacity-60">
          <Upload size={18} />
          {saving ? 'Importing...' : 'Import CSV'}
        </button>
      </form>
      {result && (
        <div className="panel p-5">
          <h2 className="text-lg font-semibold">Import Result</h2>
          <p className="mt-2 text-sm text-slate-700">
            Inserted {result.inserted} rows. {result.errors.length} rows need attention.
          </p>
          {result.errors.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-2">Row</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {result.errors.map((item) => (
                    <tr key={`${item.row}-${item.error}`} className="border-b border-slate-100">
                      <td className="py-2">{item.row}</td>
                      <td>{item.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

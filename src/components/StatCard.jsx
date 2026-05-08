export default function StatCard({ label, value, tone = 'signal' }) {
  const tones = {
    signal: 'text-signal',
    brass: 'text-brass',
    berry: 'text-berry',
    ink: 'text-ink',
  };
  return (
    <div className="panel p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${tones[tone] || tones.signal}`}>{value}</p>
    </div>
  );
}

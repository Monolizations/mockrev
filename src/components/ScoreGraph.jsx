export default function ScoreGraph({ exams }) {
  const points = exams
    .filter((exam) => exam.total > 0)
    .slice()
    .reverse()
    .map((exam, index) => ({
      x: index,
      y: Math.round((exam.score / exam.total) * 100),
      label: new Date(exam.created_at).toLocaleDateString(),
    }));

  if (points.length === 0) {
    return <div className="panel p-5 text-sm text-slate-500">No score data yet.</div>;
  }

  const width = 640;
  const height = 220;
  const pad = 28;
  const step = points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0;
  const plotted = points.map((point, index) => ({
    ...point,
    px: points.length === 1 ? width / 2 : pad + index * step,
    py: height - pad - (point.y / 100) * (height - pad * 2),
  }));
  const path = plotted.map((point, index) => `${index ? 'L' : 'M'} ${point.px} ${point.py}`).join(' ');

  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Score Trend</h2>
        <span className="text-sm text-slate-500">Last {points.length} attempts</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full" role="img">
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#cbd5e1" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#cbd5e1" />
        {[0, 25, 50, 75, 100].map((tick) => {
          const y = height - pad - (tick / 100) * (height - pad * 2);
          return (
            <g key={tick}>
              <line x1={pad} y1={y} x2={width - pad} y2={y} stroke="#eef2f7" />
              <text x={4} y={y + 4} fontSize="11" fill="#64748b">
                {tick}%
              </text>
            </g>
          );
        })}
        <path d={path} fill="none" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" />
        {plotted.map((point) => (
          <g key={`${point.x}-${point.label}`}>
            <circle cx={point.px} cy={point.py} r="5" fill="#0f766e" />
            <text x={point.px} y={height - 8} textAnchor="middle" fontSize="10" fill="#64748b">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

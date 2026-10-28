export default function Progress({ value = 0, className = "" }) {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div className={`h-2 overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <div
        className="h-full rounded-full bg-blue-600 transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

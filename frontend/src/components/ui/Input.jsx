export default function Input({
  label,
  error,
  className = "",
  ...props
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {label}
        </span>
      )}

      <input
        className={`h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${className}`}
        {...props}
      />

      {error && (
        <span className="mt-1.5 block text-xs text-red-500">
          {error}
        </span>
      )}
    </label>
  );
}

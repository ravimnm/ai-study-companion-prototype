import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Brain, LoaderCircle } from "lucide-react";
import useAuth from "../../hooks/useAuth";

export default function Login() {
  const { signIn, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ProtectedRoute passes the previous path as a plain string.
  const from =
    (typeof location.state?.from === "string"
      ? location.state.from
      : location.state?.from?.pathname) || "/dashboard";

  // Already signed in (e.g. opened /login in a second tab).
  if (!authLoading && isAuthenticated && !loading) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Continue your learning journey."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
        />

        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
        />

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

function Field({ label, type, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

export function AuthLayout({ title, description, children, footer }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden flex-1 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-600 to-orange-500 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 font-bold">
            AI
          </div>
          <span className="font-bold">Study Companion</span>
        </div>

        <div className="max-w-lg text-white">
          <Brain size={42} strokeWidth={1.5} />
          <h2 className="mt-6 text-4xl font-bold leading-tight">
            Your knowledge.
            <br />
            One intelligent workspace.
          </h2>
          <p className="mt-5 text-blue-50 leading-7">
            Learn from your materials, ask questions, test your understanding,
            and track your growth.
          </p>
        </div>

        <p className="text-sm text-blue-100">
          Learn smarter. Keep growing.
        </p>
      </div>

      <div className="flex w-full items-center justify-center px-5 py-10 lg:w-[520px] lg:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
                AI
              </div>
              <span className="font-bold text-slate-900">
                Study Companion
              </span>
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{description}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-7 text-center text-sm text-slate-500">{footer}</p>
        </div>
      </div>
    </div>
  );
}

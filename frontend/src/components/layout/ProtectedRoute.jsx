import { Navigate, useLocation } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import Spinner from "../ui/Spinner";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated, loading, authError, retryAuth } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner size={28} />
      </div>
    );
  }

  // The token is still stored but the server could not be reached (for
  // example a free host waking up). Offer a retry instead of silently
  // sending the user to the login page.
  if (!isAuthenticated && authError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold text-slate-900">
            Can't reach the server
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            It may be waking up. You are still signed in — try again in a
            few seconds.
          </p>
          <button
            onClick={retryAuth}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

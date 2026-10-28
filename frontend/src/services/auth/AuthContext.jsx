import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getCurrentUser,
  login,
  refreshToken,
  register,
} from "../api/auth";
import {
  AUTH_EXPIRED_EVENT,
  TOKEN_STORAGE_KEY,
  getCachedUser,
  getToken,
  getTokenExpiryMs,
  removeToken,
  setCachedUser,
  setToken,
} from "./authStorage";

export const AuthContext = createContext(null);

// Refresh this long before expiry (or at 25% of lifetime for short tokens).
const REFRESH_MARGIN_MS = 5 * 60 * 1000;
const MIN_REFRESH_DELAY_MS = 10 * 1000;
const RETRY_DELAY_MS = 30 * 1000;

function tokenOf(result) {
  return result?.access_token || result?.token || null;
}

export function AuthProvider({ children }) {
  // A cached user keeps the UI signed in while a sleeping backend wakes
  // up. The token still decides what the server will actually allow.
  const [user, setUser] = useState(() =>
    getToken() ? getCachedUser() : null
  );
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [sessionVersion, setSessionVersion] = useState(0);

  const refreshing = useRef(null);

  const clearSession = useCallback(() => {
    removeToken();
    setUser(null);
    setAuthError(false);
  }, []);

  const applySession = useCallback((result) => {
    const token = tokenOf(result);

    if (!token) return false;

    setToken(token);

    if (result?.user) {
      setUser(result.user);
      setCachedUser(result.user);
    }

    // Re-arm the refresh timer for the new token.
    setSessionVersion((version) => version + 1);

    return true;
  }, []);

  // Exchange the current (still valid) token for a fresh one.
  const refreshSession = useCallback(async () => {
    if (!getToken()) return false;

    // Share one in-flight refresh between timer / focus / online events.
    if (refreshing.current) return refreshing.current;

    refreshing.current = (async () => {
      try {
        const result = await refreshToken();
        return applySession(result);
      } catch (error) {
        if (error?.status === 401) {
          clearSession();
        }
        // Network/server errors: keep the session, try again later.
        return false;
      } finally {
        refreshing.current = null;
      }
    })();

    return refreshing.current;
  }, [applySession, clearSession]);

  // ---- Initial check -------------------------------------------------
  const initialize = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const expiresAt = getTokenExpiryMs(token);

    if (expiresAt && expiresAt <= Date.now()) {
      clearSession();
      setLoading(false);
      return;
    }

    try {
      const currentUser = await getCurrentUser();

      setUser(currentUser);
      setCachedUser(currentUser);
      setAuthError(false);
    } catch (error) {
      if (error?.status === 401) {
        // Only an explicit "invalid/expired token" ends the session.
        clearSession();
      } else {
        // Backend asleep / unreachable: stay signed in with the cached
        // user if there is one, otherwise let the UI offer a retry.
        setAuthError(true);
      }
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // ---- Proactive refresh (sliding session) ---------------------------
  useEffect(() => {
    if (!user) return undefined;

    const token = getToken();
    const expiresAt = getTokenExpiryMs(token);

    if (!expiresAt) return undefined;

    const lifetimeLeft = expiresAt - Date.now();
    const margin = Math.min(REFRESH_MARGIN_MS, lifetimeLeft * 0.25);
    const delay = Math.max(MIN_REFRESH_DELAY_MS, lifetimeLeft - margin);

    let timer;

    const run = async () => {
      const ok = await refreshSession();

      // A failed refresh is retried until the token really expires.
      if (!ok && getToken() && (getTokenExpiryMs() ?? 0) > Date.now()) {
        timer = setTimeout(run, RETRY_DELAY_MS);
      }
    };

    timer = setTimeout(run, delay);

    return () => clearTimeout(timer);
  }, [user, sessionVersion, refreshSession]);

  // ---- Wake-ups: tab regains focus / network returns ------------------
  useEffect(() => {
    if (!user) return undefined;

    const maybeRefresh = () => {
      if (document.visibilityState === "hidden") return;

      const expiresAt = getTokenExpiryMs();

      if (!expiresAt) return;

      const left = expiresAt - Date.now();

      // Laptop slept past the timer, or the token is in its last stretch.
      if (left < REFRESH_MARGIN_MS && left > 0) refreshSession();
      if (left <= 0) clearSession();
    };

    document.addEventListener("visibilitychange", maybeRefresh);
    window.addEventListener("online", maybeRefresh);

    return () => {
      document.removeEventListener("visibilitychange", maybeRefresh);
      window.removeEventListener("online", maybeRefresh);
    };
  }, [user, refreshSession, clearSession]);

  // ---- API said 401 for the current token -----------------------------
  useEffect(() => {
    const onExpired = () => clearSession();

    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);

    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [clearSession]);

  // ---- Other tabs sign in / out ---------------------------------------
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== TOKEN_STORAGE_KEY) return;

      if (!event.newValue) {
        setUser(null);
      } else {
        setSessionVersion((version) => version + 1);
        setUser((current) => current || getCachedUser());
      }
    };

    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, []);

  async function signIn(credentials) {
    const result = await login(credentials);

    if (!applySession(result)) {
      throw new Error(
        "Login succeeded but no access token was returned."
      );
    }

    try {
      const currentUser = result?.user || (await getCurrentUser());

      setUser(currentUser);
      setCachedUser(currentUser);
      setAuthError(false);

      return currentUser;
    } catch (error) {
      // Do not leave a partially established login behind.
      clearSession();
      throw error;
    }
  }

  async function signUp(data) {
    const result = await register(data);

    if (applySession(result) && result?.user) {
      setAuthError(false);
      return result.user;
    }

    return signIn({
      email: data.email,
      password: data.password,
    });
  }

  function signOut() {
    clearSession();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        retryAuth: () => {
          setLoading(true);
          return initialize();
        },
        signIn,
        signUp,
        signOut,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

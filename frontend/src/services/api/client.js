import { AUTH_EXPIRED_EVENT, getToken } from "../auth/authStorage";

const RAW_API_URL = import.meta.env.VITE_API_URL;

// A production build without VITE_API_URL would silently call
// http://127.0.0.1:8000 from every visitor's browser.
const API_URL = (RAW_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

const API_URL_MISSING = import.meta.env.PROD && !RAW_API_URL;

if (API_URL_MISSING) {
  console.error(
    "VITE_API_URL is not set. Add it in your Vercel project settings " +
      "(Environment Variables) and redeploy."
  );
}

const DEFAULT_TIMEOUT_MS = 30000;
const RETRYABLE_STATUS = new Set([502, 503, 504]);
const AUTH_PATHS = ["/api/auth/login", "/api/auth/register"];

function getErrorMessage(data, statusCode) {
  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => item?.msg || "Validation error")
      .join(", ");
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (statusCode === 413) return "The request or uploaded file is too large.";
  if (statusCode === 401) return "Authentication required. Please sign in again.";
  if (statusCode === 403) return "You are not authorized to perform this action.";
  if (statusCode === 404) return "The requested resource was not found.";
  if (statusCode === 400) return "The request was invalid.";
  if (statusCode === 502 || statusCode === 503 || statusCode === 504) {
    return "The server is starting up or temporarily unavailable. Please try again in a moment.";
  }
  if (statusCode >= 500) return "The server could not complete the request.";
  return "Something went wrong.";
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function makeError(message, status, details) {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  return error;
}

async function attempt(path, options, timeoutMs) {
  const token = getToken();

  const headers = {
    // ngrok's free tier returns an HTML interstitial for browser GETs
    // without this header (only needed when tunnelling through ngrok).
    ...(API_URL.includes("ngrok")
      ? { "ngrok-skip-browser-warning": "true" }
      : {}),
    ...(options.body instanceof FormData || options.body === undefined
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (cause) {
    const timedOut = cause?.name === "AbortError";

    throw makeError(
      timedOut
        ? "The server took too long to respond. It may be waking up — please try again."
        : "Cannot reach the server. Check your connection, or try again in a moment.",
      0,
      null
    );
  } finally {
    clearTimeout(timer);
  }

  let data = null;

  if (response.status !== 204) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const error = makeError(
      getErrorMessage(data, response.status),
      response.status,
      data
    );

    // The token that was actually sent, so a late response for an old
    // token cannot sign out a session that has since been refreshed.
    error.sentToken = token;

    throw error;
  }

  return data;
}

async function request(path, options = {}) {
  if (API_URL_MISSING) {
    throw makeError(
      "The app is not configured: VITE_API_URL is missing from this deployment.",
      0,
      null
    );
  }

  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = (options.method || "GET") === "GET" ? 2 : 0,
    ...fetchOptions
  } = options;

  let lastError;

  for (let tryNumber = 0; tryNumber <= retries; tryNumber += 1) {
    try {
      return await attempt(path, fetchOptions, timeoutMs);
    } catch (error) {
      lastError = error;

      const transient = error.status === 0 || RETRYABLE_STATUS.has(error.status);

      if (!transient || tryNumber === retries) break;

      // Free hosts sleep when idle; give a cold start time to finish.
      await sleep(1500 * (tryNumber + 1));
    }
  }

  if (
    lastError?.status === 401 &&
    !AUTH_PATHS.includes(path) &&
    lastError.sentToken &&
    lastError.sentToken === getToken()
  ) {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }

  throw lastError;
}

export const api = {
  get: (path, options) => request(path, options),

  post: (path, body, options) =>
    request(path, {
      ...options,
      method: "POST",
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    }),

  put: (path, body, options) =>
    request(path, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (path, options) =>
    request(path, {
      ...options,
      method: "DELETE",
    }),
};

// Calls that wait on an LLM can legitimately take much longer.
export const SLOW_REQUEST = { timeoutMs: 120000 };

export default api;

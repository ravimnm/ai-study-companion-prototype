const TOKEN_KEY = "study_token";
const USER_KEY = "study_user";

// Storage can throw (private mode, blocked site data, quota), so every
// access is guarded. The app then simply behaves as "signed out".
function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const TOKEN_STORAGE_KEY = TOKEN_KEY;

export function getToken() {
  return read(TOKEN_KEY);
}

export function setToken(token) {
  write(TOKEN_KEY, token);
}

export function removeToken() {
  remove(TOKEN_KEY);
  remove(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

// The last known user is cached so a slow or sleeping backend never makes
// the app look signed out; the token (not this cache) is what authorizes.
export function getCachedUser() {
  const raw = read(USER_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCachedUser(user) {
  if (user) write(USER_KEY, JSON.stringify(user));
}

// JWT payload is base64url JSON. Only used to read "exp" for scheduling
// a refresh; the server remains the authority on validity.
export function getTokenExpiryMs(token = getToken()) {
  if (!token) return null;

  try {
    const part = token.split(".")[1];
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));

    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export const AUTH_EXPIRED_EVENT = "auth:expired";

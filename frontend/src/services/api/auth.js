import api from "./client";

export function register(data) {
  return api.post("/api/auth/register", data);
}

export function login(data) {
  return api.post("/api/auth/login", data);
}

export function getCurrentUser() {
  return api.get("/api/auth/me");
}

export function refreshToken() {
  return api.post("/api/auth/refresh", undefined, { retries: 1 });
}

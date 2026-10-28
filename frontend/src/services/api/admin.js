import api from "./client";

export function getAdminOverview() {
  return api.get("/api/admin/overview");
}

export function getAdminUsers() {
  return api.get("/api/admin/users");
}

export function getAIUsage() {
  return api.get("/api/admin/ai-usage");
}

export function getAdminSystem() {
  return api.get("/api/admin/system");
}

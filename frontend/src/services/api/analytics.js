import api from "./client";

export function getActivity(projectId) {
  return api.get(`/api/analytics/activity/project/${projectId}`);
}

export function getAnalytics(projectId) {
  return api.get(`/api/analytics/project/${projectId}`);
}

export function getGlobalAnalytics() {
  return api.get("/api/analytics/global");
}

export function getAllActivity() {
  return api.get("/api/analytics/activity");
}

import api, { SLOW_REQUEST } from "./client";

export function getRecommendations() {
  return api.get("/api/recommendations");
}

export function generateRecommendations(projectId) {
  return api.post(
    `/api/recommendations/generate/${encodeURIComponent(projectId)}`,
    undefined,
    SLOW_REQUEST
  );
}

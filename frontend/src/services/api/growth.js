import api from "./client";

export function getGrowth(projectId) {
  return api.get(`/api/growth/project/${projectId}`);
}

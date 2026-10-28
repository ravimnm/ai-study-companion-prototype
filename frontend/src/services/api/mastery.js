import api from "./client";

export function getMastery(projectId) {
  return api.get(`/api/mastery/project/${projectId}`);
}

export function getConceptMastery(projectId, conceptId) {
  return api.get(
    `/api/mastery/project/${projectId}/concept/${conceptId}`
  );
}

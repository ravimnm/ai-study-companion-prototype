import api from "./client";

export function getProjects() {
  return api.get("/api/projects");
}

export function getProject(id) {
  return api.get(`/api/projects/${id}`);
}

export function createProject(data) {
  return api.post("/api/projects", data);
}

export function updateProject(id, data) {
  return api.put(`/api/projects/${id}`, data);
}

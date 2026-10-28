import api from "./client";

export function getSpaces() {
  return api.get("/api/spaces");
}

export function getSpace(id) {
  return api.get(`/api/spaces/${id}`);
}

export function createSpace(data) {
  return api.post("/api/spaces", data);
}

export function updateSpace(id, data) {
  return api.put(`/api/spaces/${id}`, data);
}

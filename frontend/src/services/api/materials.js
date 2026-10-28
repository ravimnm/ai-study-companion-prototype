import api from "./client";

export function getMaterials(projectId) {
  return api.get(`/api/materials/project/${projectId}`);
}

export function uploadMaterial(projectId, file) {
  const formData = new FormData();
  formData.append("file", file);

  return api.post(
    `/api/materials/upload?project_id=${encodeURIComponent(projectId)}`,
    formData,
    { timeoutMs: 120000 }
  );
}

export function retryMaterial(materialId) {
  return api.post(
    `/api/materials/${encodeURIComponent(materialId)}/retry`
  );
}

export function deleteMaterial(materialId) {
  return api.delete(`/api/materials/${encodeURIComponent(materialId)}`);
}

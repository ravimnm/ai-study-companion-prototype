import { useEffect, useRef, useState } from "react";
import { FileText, Upload, RefreshCw, CheckCircle2, Clock3, XCircle, RotateCcw, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  deleteMaterial,
  getMaterials,
  retryMaterial,
  uploadMaterial,
} from "../../services/api/materials";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Spinner from "../../components/ui/Spinner";

function Status({ status }) {
  const value = String(status || "processing").toLowerCase();

  if (value === "completed" || value === "processed" || value === "ready") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <CheckCircle2 size={13} />
        Ready
      </span>
    );
  }

  if (value === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
        <XCircle size={13} />
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
      <Clock3 size={13} />
      Processing
    </span>
  );
}

function errorText(error) {
  if (!error) return "";
  if (typeof error === "string") return error;

  return (
    error.message ||
    error.detail ||
    error.processing_error ||
    JSON.stringify(error)
  );
}

const POLL_INTERVAL_MS = 4000;
// Stop polling after this long; the server marks stuck jobs as failed
// after its own timeout, so the page never spins forever.
const POLL_LIMIT_MS = 6 * 60 * 1000;

function isProcessing(material) {
  return ["processing", "pending", "queued"].includes(
    String(material.status || material.processing_status || "").toLowerCase()
  );
}

export default function Materials() {
  const { projectId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [pollExpired, setPollExpired] = useState(false);
  const inputRef = useRef(null);
  const pollStartedAt = useRef(null);

  async function loadMaterials() {
    try {
      const response = await getMaterials(projectId);
      const items = Array.isArray(response)
        ? response
        : response?.materials || response?.items || [];
      setMaterials(items);
      setError("");
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMaterials();
  }, [projectId]);

  const anyProcessing = materials.some(isProcessing);

  useEffect(() => {
    if (!anyProcessing) {
      pollStartedAt.current = null;
      setPollExpired(false);
      return undefined;
    }

    if (pollExpired) return undefined;

    if (pollStartedAt.current === null) {
      pollStartedAt.current = Date.now();
    }

    const timer = setInterval(() => {
      if (Date.now() - pollStartedAt.current > POLL_LIMIT_MS) {
        clearInterval(timer);
        setPollExpired(true);
        return;
      }

      loadMaterials();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [anyProcessing, pollExpired, projectId]);

  async function handleRetry(materialId) {
    setError("");

    try {
      await retryMaterial(materialId);
      pollStartedAt.current = null;
      setPollExpired(false);
      await loadMaterials();
    } catch (err) {
      setError(errorText(err));
    }
  }

  async function handleDelete(materialId) {
    if (!window.confirm("Delete this material?")) return;

    setError("");

    try {
      await deleteMaterial(materialId);
      await loadMaterials();
    } catch (err) {
      setError(errorText(err));
    }
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const looksLikePdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!looksLikePdf) {
      setError("Only PDF files are supported.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setError("");

    try {
      await uploadMaterial(projectId, file);
      await loadMaterials();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Materials</h2>
          <p className="mt-1 text-sm text-slate-500">
            Upload PDFs that the AI Tutor can use as project context.
          </p>
        </div>

        <div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleUpload}
          />

          <Button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Spinner size={16} /> : <Upload size={17} />}
            {uploading ? "Uploading..." : "Upload PDF"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner size={28} />
        </div>
      )}

      {!loading && materials.length === 0 && (
        <EmptyState
          title="No materials yet"
          description="Upload a PDF to build the knowledge base for this project."
          action={
            <Button onClick={() => inputRef.current?.click()}>
              <Upload size={17} />
              Upload your first PDF
            </Button>
          }
        />
      )}

      {!loading && materials.length > 0 && (
        <div className="space-y-3">
          {materials.map((material) => {
            const status =
              material.status ||
              material.processing_status ||
              "processing";

            return (
              <Card
                key={material.id || material.material_id}
                className="p-4 sm:p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-slate-900">
                      {material.file_name || material.name || "PDF document"}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      {material.page_count
                        ? `${material.page_count} pages`
                        : "PDF document"}
                    </p>

                    {String(status).toLowerCase() === "failed" &&
                      (material.processing_error || material.error) && (
                        <p className="mt-2 text-xs text-red-500">
                          {errorText(
                            material.processing_error || material.error
                          )}
                        </p>
                      )}
                  </div>

                  <Status status={status} />

                  {String(status).toLowerCase() === "failed" && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        title="Retry processing"
                        onClick={() => handleRetry(material.id)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <RotateCcw size={16} />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => handleDelete(material.id)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {anyProcessing && !pollExpired && (
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <RefreshCw size={13} className="animate-spin" />
          Processing your material...
        </div>
      )}

      {anyProcessing && pollExpired && (
        <div className="flex items-center justify-center gap-3 text-xs text-slate-500">
          Still processing — this is taking longer than usual.
          <button
            type="button"
            onClick={() => {
              pollStartedAt.current = null;
              setPollExpired(false);
              loadMaterials();
            }}
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Check again
          </button>
        </div>
      )}
    </div>
  );
}

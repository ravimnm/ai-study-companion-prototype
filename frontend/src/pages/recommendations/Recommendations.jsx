import { useEffect, useState } from "react";
import { ArrowRight, Lightbulb, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getRecommendations,
  generateRecommendations,
} from "../../services/api/recommendations";
import { getProjects } from "../../services/api/projects";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRecommendations() {
    try {
      setLoading(true);
      setError("");

      const data = await getRecommendations();

      setRecommendations(
        Array.isArray(data)
          ? data
          : data?.recommendations || data?.items || []
      );
    } catch (err) {
      setError(err.message || "Failed to load recommendations.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    if (!projectId) return;

    try {
      setGenerating(true);
      setError("");

      await generateRecommendations(projectId);
    } catch (err) {
      // The backend may save recommendations successfully before
      // returning an error response. Reload below so the saved
      // recommendations are fetched again.
    } finally {
      window.location.reload();
    }
  }

  useEffect(() => {
    loadRecommendations();

    getProjects()
      .then((data) => {
        setProjects(Array.isArray(data) ? data : data?.items || data?.projects || []);
      })
      .catch(() => setProjects([]));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Spinner size={30} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Recommendations
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Learning actions generated from your project progress and activity.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <select
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select a project</option>

            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <Button onClick={handleGenerate} disabled={!projectId || generating}>
            {generating ? "Generating..." : "Generate"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {recommendations.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            <Lightbulb size={23} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No recommendations yet
          </h2>

          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
            Recommendations will appear here as your projects build up
            learning activity, assessments, and mastery evidence.
          </p>
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {recommendations.map((recommendation) => (
            <Card key={recommendation.id} className="p-0">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                      <Lightbulb size={19} />
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-900">
                        {recommendation.title}
                      </h2>

                      {recommendation.project_name && (
                        <p className="mt-1 text-xs text-blue-600">
                          {recommendation.project_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {recommendation.priority && (
                    <Badge>{recommendation.priority}</Badge>
                  )}
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Why
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {recommendation.reason}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Suggested action
                    </p>
                    <p className="mt-1 text-sm font-medium leading-6 text-slate-800">
                      {recommendation.action}
                    </p>
                  </div>
                </div>
              </div>

              {recommendation.project_id && (
                <div className="border-t border-slate-100 px-6 py-4">
                  <Link
                    to={`/projects/${recommendation.project_id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Open project
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <button
        onClick={loadRecommendations}
        className="mx-auto mt-6 flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-600"
      >
        <RefreshCw size={14} />
        Refresh
      </button>
    </div>
  );
}

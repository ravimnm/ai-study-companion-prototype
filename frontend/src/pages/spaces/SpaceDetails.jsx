import { useEffect, useState } from "react";
import { ArrowLeft, FolderKanban, Plus } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getSpace } from "../../services/api/spaces";
import { getProjects } from "../../services/api/projects";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";

export default function SpaceDetails() {
  const { spaceId } = useParams();
  const navigate = useNavigate();

  const [space, setSpace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [spaceData, projectData] = await Promise.all([
          getSpace(spaceId),
          getProjects(),
        ]);

        setSpace(spaceData);

        const allProjects = Array.isArray(projectData)
          ? projectData
          : projectData?.items || projectData?.projects || [];

        setProjects(
          allProjects.filter(
            (project) => String(project.space_id) === String(spaceId)
          )
        );
      } catch (err) {
        setError(err.message || "Failed to load space.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [spaceId]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Spinner size={30} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl">
        <Link
          to="/spaces"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to spaces
        </Link>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <Link
        to="/spaces"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to spaces
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {space?.name || "Learning Space"}
          </h1>

          {space?.description && (
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              {space.description}
            </p>
          )}
        </div>

        <Button onClick={() => navigate(`/projects?space=${spaceId}`)}>
          <Plus size={17} />
          New project
        </Button>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Projects</h2>
            <p className="mt-1 text-sm text-slate-500">
              Projects assigned to this learning space.
            </p>
          </div>

          <span className="text-xs font-medium text-slate-400">
            {projects.length}{" "}
            {projects.length === 1 ? "project" : "projects"}
          </span>
        </div>

        {projects.length === 0 ? (
          <Card className="py-14 text-center">
            <FolderKanban className="mx-auto text-blue-500" size={28} />

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              No projects yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create a project and assign it to this space.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group"
              >
                <Card className="h-full transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FolderKanban size={19} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">
                        {project.name}
                      </h3>

                      {project.description && (
                        <p className="mt-1 line-clamp-3 text-sm leading-5 text-slate-500">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {project.goal && (
                    <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-600">
                        Goal:
                      </span>{" "}
                      {project.goal}
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

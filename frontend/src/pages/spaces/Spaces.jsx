import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, FolderKanban, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { getSpaces, createSpace } from "../../services/api/spaces";
import { getProjects } from "../../services/api/projects";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";

export default function Spaces() {
  const [spaces, setSpaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const space = await createSpace({ name, description });

      setSpaces((current) => [...current, space]);
      setName("");
      setDescription("");
      setOpen(false);
    } catch (err) {
      setError(err.message || "Failed to create space.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [spaceData, projectData] = await Promise.all([
          getSpaces(),
          getProjects(),
        ]);

        setSpaces(Array.isArray(spaceData) ? spaceData : spaceData?.items || spaceData?.spaces || []);
        setProjects(Array.isArray(projectData) ? projectData : projectData?.items || projectData?.projects || []);
      } catch (err) {
        setError(err.message || "Failed to load spaces.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const projectsBySpace = useMemo(() => {
    const grouped = {};

    for (const project of projects) {
      if (!grouped[project.space_id]) {
        grouped[project.space_id] = [];
      }

      grouped[project.space_id].push(project);
    }

    return grouped;
  }, [projects]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Spinner size={30} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Spaces</h1>
          <p className="mt-1 text-sm text-slate-500">
            Organize your learning into focused areas.
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>
          <Plus size={17} />
          New space
        </Button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {spaces.length === 0 ? (
        <Card className="py-16 text-center">
          <BookOpen className="mx-auto text-blue-500" size={28} />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No spaces yet
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Create a space to organize your projects.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {spaces.map((space) => {
            const spaceProjects = projectsBySpace[space.id] || [];

            return (
              <Card key={space.id} className="overflow-hidden p-0">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                  <div>
                    <Link
                      to={`/spaces/${space.id}`}
                      className="text-lg font-bold text-slate-900 hover:text-blue-600"
                    >
                      {space.name}
                    </Link>

                    {space.description && (
                      <p className="mt-1 text-sm text-slate-500">
                        {space.description}
                      </p>
                    )}
                  </div>

                  <span className="text-xs font-medium text-slate-400">
                    {spaceProjects.length}{" "}
                    {spaceProjects.length === 1 ? "project" : "projects"}
                  </span>
                </div>

                {spaceProjects.length === 0 ? (
                  <div className="px-6 py-8 text-sm text-slate-500">
                    No projects assigned to this space yet.
                  </div>
                ) : (
                  <div className="grid gap-3 p-5 md:grid-cols-2">
                    {spaceProjects.map((project) => (
                      <Link
                        key={project.id}
                        to={`/projects/${project.id}`}
                        className="group rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/40"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              <FolderKanban size={18} />
                            </div>

                            <div>
                              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">
                                {project.name}
                              </h3>

                              {project.description && (
                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                  {project.description}
                                </p>
                              )}

                              {project.goal && (
                                <p className="mt-2 text-xs text-slate-400">
                                  Goal: {project.goal}
                                </p>
                              )}
                            </div>
                          </div>

                          <ArrowRight
                            size={17}
                            className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500"
                          />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        title="Create a space"
        onClose={() => setOpen(false)}
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <Input
            label="Space name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Machine Learning"
            required
          />

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What does this learning area cover?"
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create space"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

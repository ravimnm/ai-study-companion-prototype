import { useEffect, useMemo, useState } from "react";
import { Plus, FolderKanban, ArrowRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProjects, createProject } from "../../services/api/projects";
import { getSpaces } from "../../services/api/spaces";
import useApi from "../../hooks/useApi";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import Spinner from "../../components/ui/Spinner";

export default function Projects() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data, loading, error } = useApi(getProjects);
  const { data: spaceData } = useApi(getSpaces);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [spaceId, setSpaceId] = useState("");
  const [saving, setSaving] = useState(false);

  const projects = Array.isArray(data) ? data : data?.items || data?.projects || [];

  const spaces = useMemo(
    () => (Array.isArray(spaceData) ? spaceData : spaceData?.items || spaceData?.spaces || []),
    [spaceData]
  );

  const spaceNames = useMemo(() => {
    const map = {};
    for (const space of spaces) map[space.id] = space.name;
    return map;
  }, [spaces]);

  // Opened from a Space page: preselect that space and start creating.
  useEffect(() => {
    const requestedSpace = searchParams.get("space");

    if (requestedSpace) {
      setSpaceId(requestedSpace);
      setOpen(true);
    }
  }, [searchParams]);

  async function handleCreate(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const project = await createProject({
        name,
        description,
        goal,
        space_id: spaceId,
      });

      setName("");
      setDescription("");
      setGoal("");
      setSpaceId("");
      setOpen(false);

      navigate(`/projects/${project.id}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">
            Turn your learning goals into focused projects.
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>
          <Plus size={17} />
          New project
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner size={28} />
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <EmptyState
          title="No projects yet"
          description="Create a project to start adding materials and learning with your AI tutor."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus size={17} />
              Create project
            </Button>
          }
        />
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="group cursor-pointer p-6 transition hover:-translate-y-0.5 hover:border-blue-200"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <FolderKanban size={21} />
              </div>

              <ArrowRight
                size={18}
                className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
              />
            </div>

            <h2 className="mt-5 font-bold text-slate-900">
              {project.name}
            </h2>

            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
              {project.description || "Learning project"}
            </p>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
              <span>{spaceNames[project.space_id] || "Project"}</span>
              <span>Open →</span>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={open}
        title="Create a project"
        onClose={() => setOpen(false)}
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <Input
            label="Project name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Deep Learning Fundamentals"
            required
          />

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What are you trying to learn?"
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <Input
            label="Learning goal"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            placeholder="e.g. Be able to explain backpropagation"
          />

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Space
            </span>
            <select
              value={spaceId}
              onChange={(event) => setSpaceId(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select a space</option>

              {spaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name}
                </option>
              ))}
            </select>

            {spaces.length === 0 && (
              <span className="mt-2 block text-xs text-slate-500">
                Create a space first — every project belongs to one.
              </span>
            )}
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
              {saving ? "Creating..." : "Create project"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

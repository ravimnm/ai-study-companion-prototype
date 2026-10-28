import { useParams, NavLink, Outlet } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  FileText,
  GraduationCap,
  TrendingUp,
  Activity,
  BarChart3,
} from "lucide-react";
import { getProject } from "../../services/api/projects";
import useApi from "../../hooks/useApi";
import Spinner from "../../components/ui/Spinner";

const tabs = [
  { path: "", label: "Overview", icon: BookOpen, end: true },
  { path: "materials", label: "Materials", icon: FileText },
  { path: "tutor", label: "AI Tutor", icon: Brain },
  { path: "quiz", label: "Quiz", icon: GraduationCap },
  { path: "mastery", label: "Mastery", icon: TrendingUp },
  { path: "growth", label: "Growth", icon: TrendingUp },
  { path: "activity", label: "Activity", icon: Activity },
  { path: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function ProjectDetails() {
  const { projectId } = useParams();
  const { data: project, loading, error } = useApi(
    () => getProject(projectId),
    [projectId]
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={28} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="mx-auto max-w-7xl">
      <NavLink
        to="/projects"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} />
        Projects
      </NavLink>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          {project.name}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {project.description || "Your learning project"}
        </p>

        <div className="mt-6 flex gap-1 overflow-x-auto border-t border-slate-100 pt-4">
          {tabs.map(({ path, label, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={`/projects/${projectId}/${path}`}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}

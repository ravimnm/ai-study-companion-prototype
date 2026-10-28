import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Brain,
  Clock3,
  FolderKanban,
  Target,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getProjects } from "../../services/api/projects";
import { getAllActivity } from "../../services/api/analytics";
import { getRecommendations } from "../../services/api/recommendations";
import api from "../../services/api/client";

import Spinner from "../../components/ui/Spinner";

function list(value) {
  if (Array.isArray(value)) return value;

  return (
    value?.items ||
    value?.projects ||
    value?.mastery ||
    value?.recommendations ||
    []
  );
}

function projectId(project) {
  return project?.id || project?._id || project?.project_id;
}

function progressFromMastery(data) {
  const items = list(data);

  if (!items.length) return 0;

  const total = items.reduce(
    (sum, item) => sum + Number(item.score ?? item.mastery ?? 0),
    0
  );

  const average = total / items.length;

  return Math.round(average <= 1 ? average * 100 : average);
}

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [activity, setActivity] = useState([]);
  const [progress, setProgress] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [
          projectResponse,
          activityResponse,
          recommendationResponse,
        ] = await Promise.all([
          getProjects(),
          getAllActivity(),
          getRecommendations(),
        ]);

        const projectItems = list(projectResponse);
        const activityItems = list(activityResponse);
        const recommendationItems = list(recommendationResponse);

        setProjects(projectItems);
        setActivity(activityItems);
        setRecommendations(recommendationItems);

        const masteryResults = await Promise.all(
          projectItems.slice(0, 8).map(async (project) => {
            const id = projectId(project);

            if (!id) return [null, 0];

            try {
              const data = await api.get(`/api/mastery/project/${id}`);

              return [id, progressFromMastery(data)];
            } catch {
              return [id, 0];
            }
          })
        );

        setProgress(
          Object.fromEntries(
            masteryResults.filter(([id]) => id)
          )
        );
      } catch {
        setProjects([]);
        setActivity([]);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  const averageProgress = projects.length
    ? Math.round(
        projects.reduce(
          (sum, project) =>
            sum + (progress[projectId(project)] || 0),
          0
        ) / projects.length
      )
    : 0;

  const recentProjects = projects.slice(0, 3);
  const recentActivity = activity.slice(0, 3);

  /*
   * Pick the first pending/shown recommendation.
   * If there is no recommendation, the dashboard still works normally.
   */
  const nextRecommendation =
    recommendations.find(
      (item) =>
        item?.status === "pending" ||
        item?.status === "shown"
    ) || recommendations[0];

  /*
   * Find the project associated with the recommendation.
   */
  const recommendationProject = nextRecommendation
    ? projects.find(
        (project) =>
          projectId(project) ===
          (
            nextRecommendation.project_id ||
            nextRecommendation.projectId
          )
      )
    : null;

  /*
   * If the recommendation has no project reference,
   * fall back to the first project.
   */
  const targetProject =
    recommendationProject || recentProjects[0];

  const targetProjectId = targetProject
    ? projectId(targetProject)
    : null;

  return (
    <div className="mx-auto max-w-7xl space-y-8">

      {/* ===================================================== */}
      {/* HERO */}
      {/* ===================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-600 to-orange-500 px-7 py-8 text-white shadow-lg shadow-blue-600/10 sm:px-10 sm:py-10">

        <div className="relative z-10 max-w-2xl">

          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-100">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/15">
              ✦
            </span>

            Your learning workspace
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Keep building your knowledge.
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50 sm:text-base">
            Continue where you left off, review weak concepts,
            or ask your tutor about something you're learning.
          </p>

          {recentProjects[0] && (
            <Link
              to={`/projects/${projectId(recentProjects[0])}/tutor`}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50"
            >
              Continue learning

              <ArrowUpRight size={17} />
            </Link>
          )}
        </div>

        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />

        <div className="absolute -bottom-28 right-20 h-72 w-72 rounded-full bg-orange-300/20" />
      </section>


      {/* ===================================================== */}
      {/* SUMMARY CARDS */}
      {/* ===================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {[
          ["Projects", projects.length, FolderKanban],
          ["Average mastery", `${averageProgress}%`, Brain],
          ["Activities", activity.length, Clock3],
          [
            "Learning state",
            averageProgress >= 70 ? "On track" : "Building",
            Target,
          ],
        ].map(([label, value, Icon]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Icon size={19} />
            </div>

            <div className="mt-5 text-2xl font-bold text-slate-900">
              {value}
            </div>

            <div className="mt-1 text-sm text-slate-500">
              {label}
            </div>
          </div>
        ))}

      </section>


      {/* ===================================================== */}
      {/* CONTINUE LEARNING */}
      {/* ===================================================== */}

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-bold text-slate-900">
                Continue learning
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your current learning projects
              </p>
            </div>

            <Link
              to="/projects"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>

          </div>


          <div className="mt-6 space-y-3">

            {recentProjects.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">

                <BookOpen
                  className="mx-auto text-slate-300"
                  size={24}
                />

                <p className="mt-3 text-sm text-slate-500">
                  Create your first project to start learning.
                </p>

              </div>
            )}


            {recentProjects.map((project) => {

              const id = projectId(project);

              const value = progress[id] || 0;

              return (
                <Link
                  key={id}
                  to={`/projects/${id}`}
                  className="block rounded-xl border border-slate-100 p-4 hover:border-blue-100 hover:bg-blue-50/30"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <div className="font-semibold text-slate-800">
                        {project.name || "Untitled project"}
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        {project.description ||
                          project.learning_goal ||
                          "Learning project"}
                      </div>

                    </div>

                    <span className="text-sm font-semibold text-slate-700">
                      {value}%
                    </span>

                  </div>


                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${Math.min(value, 100)}%`,
                      }}
                    />

                  </div>

                </Link>
              );
            })}

          </div>

        </div>


        {/* ================================================= */}
        {/* RECOMMENDED NEXT ACTION */}
        {/* ================================================= */}

        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-orange-50 p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Sparkles size={19} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Recommended next action
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Based on your current learning state
              </p>
            </div>

          </div>


          {nextRecommendation ? (

            <div className="mt-6">

              <h3 className="text-lg font-bold text-slate-900">
                {nextRecommendation.title ||
                  nextRecommendation.name ||
                  "Continue learning"}
              </h3>


              {(nextRecommendation.reason ||
                nextRecommendation.description) && (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {nextRecommendation.reason ||
                    nextRecommendation.description}
                </p>
              )}


              {nextRecommendation.action && (
                <div className="mt-4 rounded-xl bg-white/80 p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Suggested action
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {nextRecommendation.action}
                  </p>

                </div>
              )}


              {targetProjectId && (
                <Link
                  to={`/projects/${targetProjectId}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  Open project

                  <ArrowRight size={16} />
                </Link>
              )}

            </div>

          ) : (

            <div className="mt-6">

              <h3 className="text-lg font-bold text-slate-900">
                Keep building your learning momentum
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Complete a quiz or interact with your tutor to
                generate personalized learning recommendations.
              </p>

              {targetProjectId && (
                <Link
                  to={`/projects/${targetProjectId}/tutor`}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  Continue learning

                  <ArrowRight size={16} />
                </Link>
              )}

            </div>

          )}

        </div>

      </section>


      

    </div>
  );
}
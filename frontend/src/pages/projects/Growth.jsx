import { useEffect, useState } from "react";
import {
  TrendingUp,
  Lightbulb,
  ArrowRight,
  Target,
  AlertCircle,
  BookOpen,
  ClipboardCheck,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { getGrowth } from "../../services/api/growth";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";

export default function Growth() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getGrowth(projectId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [projectId]);

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

  const growth = data?.growth || data || {};

  const mastery = growth.mastery || {};
  const assessments = growth.assessments || {};
  const activity = growth.activity || {};
  const recommendationSummary = growth.recommendations || {};

  const averageMastery = Number(mastery.average_score || 0);
  const progress = Math.round(averageMastery * 100);

  const conceptCount = Number(mastery.concept_count || 0);

  const trendCounts = mastery.trend_counts || {};
  const improvingCount = Number(trendCounts.improving || 0);
  const needsAttentionCount = Number(trendCounts.needs_attention || 0);

  const completedAssessments = Number(assessments.completed || 0);
  const totalAssessments = Number(assessments.total || 0);
  const assessmentAverage = Number(assessments.average_score || 0);

  const activityCount = Number(activity.event_count || 0);
  const recommendationCount = Number(recommendationSummary.count || 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Growth
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Understand your progress and what to focus on next.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <TrendingUp size={19} />
          </div>

          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
            Average mastery
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {progress}%
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Target size={19} />
          </div>

          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
            Concepts
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {conceptCount}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp size={19} />
          </div>

          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
            Improving
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {improvingCount}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            <AlertCircle size={19} />
          </div>

          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
            Needs attention
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {needsAttentionCount}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={18} className="text-blue-600" />
            <p className="text-sm font-semibold text-slate-800">
              Assessments
            </p>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {completedAssessments}
            <span className="text-base font-medium text-slate-400">
              {" "}
              / {totalAssessments}
            </span>
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Completed assessments
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-emerald-600" />
            <p className="text-sm font-semibold text-slate-800">
              Assessment average
            </p>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {Math.round(assessmentAverage * 100)}%
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-blue-600" />
            <p className="text-sm font-semibold text-slate-800">
              Activity
            </p>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {activityCount}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Recorded learning events
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Lightbulb size={18} className="text-orange-500" />
            <p className="text-sm font-semibold text-slate-800">
              Recommendations
            </p>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {recommendationCount}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Available recommendations
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2">
          <TrendingUp size={19} className="text-blue-600" />

          <h3 className="font-semibold text-slate-900">
            Mastery overview
          </h3>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Average concept mastery
            </span>

            <span className="font-semibold text-slate-800">
              {progress}%
            </span>
          </div>

          <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
              Improving
            </p>
            <p className="mt-1 text-xl font-bold text-emerald-800">
              {improvingCount}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Stable
            </p>
            <p className="mt-1 text-xl font-bold text-slate-800">
              {Number(trendCounts.stable || 0)}
            </p>
          </div>

          <div className="rounded-xl bg-orange-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
              Needs attention
            </p>
            <p className="mt-1 text-xl font-bold text-orange-800">
              {needsAttentionCount}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Lightbulb size={19} className="text-orange-500" />

          <h3 className="font-semibold text-slate-900">
            Recommended next steps
          </h3>
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-5">
          <p className="text-sm leading-6 text-slate-500">
            {recommendationCount > 0
              ? `You currently have ${recommendationCount} recommendation${
                  recommendationCount === 1 ? "" : "s"
                } available in your learning workspace.`
              : "Complete more learning activities and assessments to generate useful next-step guidance."}
          </p>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="secondary"
          onClick={() => navigate(`/projects/${projectId}/quiz`)}
        >
          Practice with a quiz
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
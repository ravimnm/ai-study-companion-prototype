import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, Brain } from "lucide-react";
import { useParams } from "react-router-dom";
import { getMastery } from "../../services/api/mastery";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";

function Trend({ value }) {
  if (value === "improving") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
        <TrendingUp size={14} />
        Improving
      </span>
    );
  }

  if (value === "needs_attention") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-orange-600">
        <TrendingDown size={14} />
        Needs attention
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
      <Minus size={14} />
      Stable
    </span>
  );
}

function scorePercent(score) {
  const value = Number(score || 0);
  return Math.round(value <= 1 ? value * 100 : value);
}

export default function Mastery() {
  const { projectId } = useParams();

  const [mastery, setMastery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getMastery(projectId)
      .then((data) => {
        if (!active) return;
        setMastery(
          Array.isArray(data) ? data : data?.mastery || data?.items || []
        );
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
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

  const average = mastery.length
    ? Math.round(
        mastery.reduce(
          (total, item) => total + scorePercent(item.score),
          0
        ) / mastery.length
      )
    : 0;

  const attention = mastery.filter(
    (item) => item.trend === "needs_attention"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Mastery</h2>
        <p className="mt-1 text-sm text-slate-500">
          Track your understanding across project concepts.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Overall mastery
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {average}%
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Concepts tracked
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {mastery.length}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Need attention
          </p>
          <p className="mt-2 text-3xl font-bold text-orange-500">
            {attention}
          </p>
        </Card>
      </div>

      {mastery.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Brain size={22} />
          </div>

          <h3 className="mt-4 font-semibold text-slate-900">
            No mastery data yet
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Complete an assessment to start building your concept mastery.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="font-semibold text-slate-900">
              Concept mastery
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {mastery.map((item) => {
              const score = scorePercent(item.score);

              return (
                <div key={item.id || item.concept_id} className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-semibold text-slate-800">
                        {item.concept_name ||
                          item.concept_id ||
                          "Concept"}
                      </h4>

                      <div className="mt-1">
                        <Trend value={item.trend} />
                      </div>
                    </div>

                    <span className="text-lg font-bold text-slate-900">
                      {score}%
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{ width: `${Math.min(score, 100)}%` }}
                    />
                  </div>

                  <div className="mt-3 flex justify-between text-xs text-slate-400">
                    <span>
                      Confidence: {scorePercent(item.confidence)}%
                    </span>
                    <span>
                      Assessments: {item.assessment_count || 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

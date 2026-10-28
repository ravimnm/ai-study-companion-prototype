import { useEffect, useState } from "react";
import {
  Activity,
  BookOpen,
  Brain,
  ClipboardCheck,
  FolderKanban,
  Layers3,
  Sparkles,
} from "lucide-react";
import { getAllActivity, getGlobalAnalytics } from "../../services/api/analytics";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";

function normalizeActivities(data) {
  if (Array.isArray(data)) return data;
  return data?.activities || data?.items || [];
}

function formatEvent(event) {
  if (event?.description) return event.description;
  return String(event?.event_type || "Learning activity")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getGlobalAnalytics(), getAllActivity()])
      .then(([analytics, activity]) => {
        setSummary(analytics || {});
        setItems(normalizeActivities(activity));
      })
      .catch((err) => setError(err.message || "Failed to load analytics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size={28} /></div>;
  }

  if (error) {
    return <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div>;
  }

  const activity = summary?.activity || {};
  const assessments = summary?.assessments || {};
  const mastery = summary?.mastery || {};
  const ai = summary?.ai || {};
  const trends = mastery.trend_counts || {};
  const eventCounts = activity.event_counts || {};

  const cards = [
    ["Projects", summary?.project_count || 0, FolderKanban, "blue"],
    ["Activities", activity.event_count || 0, Activity, "blue"],
    ["Materials", summary?.material_count || 0, BookOpen, "emerald"],
    ["Conversations", summary?.conversation_count || 0, Brain, "violet"],
    ["Assessments", assessments.completed || 0, ClipboardCheck, "amber"],
    ["Average mastery", `${Math.round(Number(mastery.average_score || 0) * 100)}%`, Sparkles, "blue"],
    ["AI requests", ai.request_count || 0, Brain, "violet"],
    ["Questions answered", assessments.questions_answered || 0, Layers3, "emerald"],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Analytics</h2>
        <p className="mt-1 text-sm text-slate-500">Global learning analytics across your Spaces and Projects.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon, tone]) => (
          <Card key={label} className="p-5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${tone}-50 text-${tone}-600`}>
              <Icon size={19} />
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900">Learning performance</h3>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs text-emerald-600">Improving</p><p className="mt-1 text-xl font-bold text-emerald-800">{trends.improving || 0}</p></div>
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Stable</p><p className="mt-1 text-xl font-bold text-slate-800">{trends.stable || 0}</p></div>
            <div className="rounded-xl bg-orange-50 p-4"><p className="text-xs text-orange-600">Attention</p><p className="mt-1 text-xl font-bold text-orange-800">{trends.needs_attention || 0}</p></div>
          </div>
          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="text-slate-500">Assessment average</span>
            <span className="font-semibold text-slate-800">{Math.round(Number(assessments.average_score || 0) * 100)}%</span>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-slate-900">AI activity</h3>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Successful requests</span><span className="font-semibold">{ai.successful_requests || 0}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Failed requests</span><span className="font-semibold">{ai.failed_requests || 0}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Total tokens</span><span className="font-semibold">{ai.total_tokens || 0}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Average latency</span><span className="font-semibold">{Math.round(Number(ai.average_latency_ms || 0))} ms</span></div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-900">Activity breakdown</h3>
        {Object.keys(eventCounts).length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No learning activity has been recorded yet.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(eventCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type} className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{type.replaceAll("_", " ")}</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{count}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 p-6"><h3 className="font-semibold text-slate-900">Recent activity</h3></div>
        {items.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">No activity recorded yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.slice(0, 10).map((item, index) => (
              <div key={item?.id || index} className="p-5">
                <p className="text-sm font-medium text-slate-800">{formatEvent(item)}</p>
                <p className="mt-1 text-xs text-slate-400">{formatDate(item?.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

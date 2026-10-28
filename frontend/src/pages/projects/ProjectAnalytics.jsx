import { useEffect, useState } from "react";
import { Activity, Brain, BookOpen, ClipboardCheck, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import { getAnalytics, getActivity } from "../../services/api/analytics";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";

function normalize(data) {
  if (Array.isArray(data)) return data;
  return data?.activities || data?.items || [];
}

function label(event) {
  return event?.description || String(event?.event_type || "Learning activity").replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProjectAnalytics() {
  const { projectId } = useParams();
  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getAnalytics(projectId), getActivity(projectId)])
      .then(([analytics, activity]) => { setSummary(analytics); setItems(normalize(activity)); })
      .catch((err) => setError(err.message || "Failed to load project analytics."))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} /></div>;
  if (error) return <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div>;

  const mastery = summary?.mastery || {};
  const assessments = summary?.assessments || {};
  const activity = summary?.activity || {};
  const ai = summary?.ai || {};
  const trends = mastery.trend_counts || {};

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-slate-900">Project Analytics</h2><p className="mt-1 text-sm text-slate-500">Learning activity, assessment performance, mastery, trends, and AI usage for this project.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Activities", activity.event_count || 0, Activity],
          ["Materials", summary?.material_count || 0, BookOpen],
          ["Assessments", assessments.completed || 0, ClipboardCheck],
          ["Average mastery", `${Math.round(Number(mastery.average_score || 0) * 100)}%`, Sparkles],
        ].map(([name, value, Icon]) => (
          <Card key={name} className="p-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon size={19} /></div><p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">{name}</p><p className="mt-1 text-2xl font-bold text-slate-900">{value}</p></Card>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-6"><h3 className="font-semibold text-slate-900">Assessment performance</h3><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span className="text-slate-500">Total assessments</span><span className="font-semibold">{assessments.total || 0}</span></div><div className="flex justify-between"><span className="text-slate-500">Completed</span><span className="font-semibold">{assessments.completed || 0}</span></div><div className="flex justify-between"><span className="text-slate-500">Questions answered</span><span className="font-semibold">{assessments.questions_answered || 0}</span></div><div className="flex justify-between"><span className="text-slate-500">Average score</span><span className="font-semibold">{Math.round(Number(assessments.average_score || 0) * 100)}%</span></div></div></Card>
        <Card className="p-6"><h3 className="font-semibold text-slate-900">Concept trends</h3><div className="mt-5 grid grid-cols-3 gap-3"><div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs text-emerald-600">Improving</p><p className="mt-1 text-xl font-bold text-emerald-800">{trends.improving || 0}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Stable</p><p className="mt-1 text-xl font-bold text-slate-800">{trends.stable || 0}</p></div><div className="rounded-xl bg-orange-50 p-4"><p className="text-xs text-orange-600">Attention</p><p className="mt-1 text-xl font-bold text-orange-800">{trends.needs_attention || 0}</p></div></div></Card>
      </div>
      <Card className="p-6"><div className="flex items-center gap-2"><Brain size={19} className="text-violet-600"/><h3 className="font-semibold text-slate-900">AI activity</h3></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Requests</p><p className="mt-1 text-xl font-bold">{ai.request_count || 0}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Successful</p><p className="mt-1 text-xl font-bold">{ai.successful_requests || 0}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Tokens</p><p className="mt-1 text-xl font-bold">{ai.total_tokens || 0}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Avg latency</p><p className="mt-1 text-xl font-bold">{Math.round(Number(ai.average_latency_ms || 0))} ms</p></div></div></Card>
      <Card className="overflow-hidden"><div className="border-b border-slate-100 p-6"><h3 className="font-semibold text-slate-900">Project activity</h3></div>{items.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">No activity recorded yet.</div> : <div className="divide-y divide-slate-100">{items.slice(0, 20).map((item, index) => <div key={item?.id || index} className="p-5"><p className="text-sm font-medium text-slate-800">{label(item)}</p><p className="mt-1 text-xs text-slate-400">{item?.created_at ? new Date(item.created_at).toLocaleString() : ""}</p></div>)}</div>}</Card>
    </div>
  );
}

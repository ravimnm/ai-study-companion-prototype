import { useEffect, useState } from "react";
import {
  Users,
  FolderKanban,
  FileText,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { getAdminOverview } from "../../services/api/admin";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";

function Stat({ icon: Icon, label, value }) {
  return (
    <Card className="p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={19} />
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value ?? 0}
      </p>
    </Card>
  );
}

export default function Admin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminOverview()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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

  const stats = data?.analytics || data || {};

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <ShieldCheck size={20} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Admin Dashboard
          </h1>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Monitor platform usage and system activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={Users}
          label="Users"
          value={stats.users ?? stats.user_count}
        />
        <Stat
          icon={FolderKanban}
          label="Projects"
          value={stats.projects ?? stats.project_count}
        />
        <Stat
          icon={FileText}
          label="Materials"
          value={stats.materials ?? stats.material_count}
        />
        <Stat
          icon={Activity}
          label="Activities"
          value={stats.activities ?? stats.activity_count}
        />
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-slate-900">
          AI usage
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">AI requests</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {stats.ai_request_count ?? stats.total_requests ?? 0}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">Successful requests</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {stats.ai_success_count ?? stats.successful_requests ?? 0}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">Failed requests</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {stats.ai_failure_count ?? stats.failed_requests ?? 0}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Activity as ActivityIcon, Clock3 } from "lucide-react";
import { useParams } from "react-router-dom";
import { getActivity } from "../../services/api/analytics";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";

function formatEvent(event) {
  if (event?.description) {
    return event.description;
  }

  if (event?.event_type) {
    return event.event_type
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return "Learning activity";
}

function formatDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString();
}

function normalizeActivities(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.activities)) {
    return data.activities;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.activity)) {
    return data.activity;
  }

  return [];
}

export default function Activity() {
  const { projectId } = useParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;

    setLoading(true);
    setError("");

    getActivity(projectId)
      .then((data) => {
        setItems(normalizeActivities(data));
      })
      .catch((err) => {
        setError(err.message || "Failed to load activity.");
      })
      .finally(() => {
        setLoading(false);
      });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Activity
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Your recent learning activity in this project.
        </p>
      </div>

      {/* Activity List */}
      <Card className="overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center">
            <ActivityIcon
              size={25}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm text-slate-500">
              No activity recorded yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item, index) => {
              const date = formatDate(item?.created_at);

              return (
                <div
                  key={item?.id || item?._id || index}
                  className="flex gap-4 p-5"
                >
                  {/* Icon */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <ActivityIcon size={17} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      {formatEvent(item)}
                    </p>

                    {item?.entity_type && (
                      <p className="mt-1 text-xs capitalize text-slate-400">
                        {String(item.entity_type).replaceAll(
                          "_",
                          " "
                        )}
                      </p>
                    )}

                    {date && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                        <Clock3 size={12} />
                        {date}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
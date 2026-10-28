import { useParams } from "react-router-dom";
import Card from "../../components/ui/Card";

export default function ProjectOverview() {
  const { projectId } = useParams();

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold text-slate-900">
        Project overview
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Your project activity, learning progress, and recent work will appear here.
      </p>
      <p className="mt-4 text-xs text-slate-400">
        Project: {projectId}
      </p>
    </Card>
  );
}

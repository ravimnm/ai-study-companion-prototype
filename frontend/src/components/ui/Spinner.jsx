import { LoaderCircle } from "lucide-react";

export default function Spinner({ size = 20 }) {
  return (
    <LoaderCircle
      size={size}
      className="animate-spin text-blue-600"
    />
  );
}

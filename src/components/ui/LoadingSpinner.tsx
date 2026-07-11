import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  label?: string;
}

export default function LoadingSpinner({ label = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <Loader2 size={16} strokeWidth={2.25} className="animate-spin text-brand-600" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

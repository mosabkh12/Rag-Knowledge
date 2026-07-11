import { ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

interface AlertProps {
  variant: "success" | "error" | "info";
  children: ReactNode;
}

const CONFIG: Record<
  AlertProps["variant"],
  { classes: string; icon: typeof CheckCircle2 }
> = {
  success: {
    classes: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  error: {
    classes: "border-red-200 bg-red-50 text-red-800",
    icon: AlertCircle,
  },
  info: {
    classes: "border-blue-200 bg-blue-50 text-blue-800",
    icon: Info,
  },
};

export default function Alert({ variant, children }: AlertProps) {
  const { classes, icon: Icon } = CONFIG[variant];

  return (
    <div
      role="status"
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm leading-relaxed animate-fade-in ${classes}`}
    >
      <Icon size={17} strokeWidth={2} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

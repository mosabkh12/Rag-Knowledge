import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function PageHeader({ icon: Icon, title, description }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon size={20} strokeWidth={2.25} />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      <p className="max-w-lg text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

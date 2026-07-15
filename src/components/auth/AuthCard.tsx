import { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-16">
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        {children}
      </div>

      <p className="text-center text-sm text-slate-500">{footer}</p>
    </div>
  );
}

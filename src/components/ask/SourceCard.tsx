import type { RetrievedChunk } from "@/types/rag";

interface SourceCardProps {
  source: RetrievedChunk;
  index: number;
}

export default function SourceCard({ source, index }: SourceCardProps) {
  const similarityPercent = Math.round(source.similarity * 100);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500">
            {index + 1}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Source
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${similarityPercent}%` }}
            />
          </div>
          <span className="text-xs font-medium tabular-nums text-slate-500">
            {similarityPercent}%
          </span>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">{source.content}</p>
    </div>
  );
}

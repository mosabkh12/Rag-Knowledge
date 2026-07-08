import type { RetrievedChunk } from "@/types/rag";

interface SourceCardProps {
  source: RetrievedChunk;
  index: number;
}

export default function SourceCard({ source, index }: SourceCardProps) {
  const similarityPercent = Math.round(source.similarity * 100);

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Source {index + 1}
        </span>
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
          {similarityPercent}% match
        </span>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">{source.content}</p>
    </div>
  );
}

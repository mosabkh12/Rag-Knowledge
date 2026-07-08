import SourceCard from "./SourceCard";
import type { AskResponse } from "@/types/api";

interface AnswerPanelProps {
  result: AskResponse;
}

export default function AnswerPanel({ result }: AnswerPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-md border border-slate-200 bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Answer
        </h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
          {result.answer}
        </p>
      </div>

      {result.sources.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Sources
          </h2>
          {result.sources.map((source, index) => (
            <SourceCard key={source.id} source={source} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

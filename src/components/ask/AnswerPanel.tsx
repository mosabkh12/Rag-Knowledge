"use client";

import { motion } from "framer-motion";
import { Sparkles, FileStack } from "lucide-react";
import SourceCard from "./SourceCard";
import type { AskResponse } from "@/types/api";

interface AnswerPanelProps {
  result: AskResponse;
}

export default function AnswerPanel({ result }: AnswerPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-brand-100 bg-gradient-to-b from-brand-50/60 to-white p-6 shadow-soft sm:p-7"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Sparkles size={14} strokeWidth={2.25} />
          </div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Answer
          </h2>
        </div>
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-800">
          {result.answer}
        </p>
      </motion.div>

      {result.sources.length > 0 && (
        <div className="flex flex-col gap-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="flex items-center gap-2"
          >
            <FileStack size={15} strokeWidth={2.25} className="text-slate-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Sources
            </h2>
          </motion.div>
          {result.sources.map((source, index) => (
            <SourceCard key={source.id} source={source} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

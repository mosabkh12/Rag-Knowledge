"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import {
  Sparkles,
  FileUp,
  MessageCircleQuestion,
  Scissors,
  Cpu,
  Database,
  Search,
  MessageSquareText,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

interface PipelineStep {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    step: "01",
    title: "Ingest",
    description: "Paste text or upload a .txt, .md, .pdf, or .docx file — saved straight to Supabase.",
    icon: FileUp,
  },
  {
    step: "02",
    title: "Chunk",
    description: "Text is split into overlapping 800–1000 character chunks to preserve context across boundaries.",
    icon: Scissors,
  },
  {
    step: "03",
    title: "Embed",
    description: "Each chunk becomes a 1536-dimension vector via OpenAI's text-embedding-3-small model.",
    icon: Cpu,
  },
  {
    step: "04",
    title: "Store",
    description: "Chunks and embeddings are persisted in Postgres using the pgvector extension.",
    icon: Database,
  },
  {
    step: "05",
    title: "Retrieve",
    description: "Your question is embedded and matched against stored chunks via cosine similarity search.",
    icon: Search,
  },
  {
    step: "06",
    title: "Generate",
    description: "The most relevant chunks ground an OpenAI chat completion — or it tells you it doesn't know.",
    icon: MessageSquareText,
  },
];

const TECH_STACK = [
  "Next.js 15",
  "TypeScript",
  "Tailwind CSS",
  "Supabase Postgres",
  "pgvector",
  "OpenAI API",
  "Vercel",
];

const heroContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function HomePage() {
  return (
    <Container size="wide">
      <div className="flex flex-col gap-24">
        <motion.section
          variants={heroContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col items-start gap-6 pt-6 sm:pt-10"
        >
          <motion.span
            variants={heroItem}
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
          >
            <Sparkles size={13} strokeWidth={2.25} />
            Retrieval-Augmented Generation
          </motion.span>

          <motion.h1
            variants={heroItem}
            className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl"
          >
            Ask your documents anything.{" "}
            <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
              Get answers you can trust.
            </span>
          </motion.h1>

          <motion.p variants={heroItem} className="max-w-xl text-base leading-relaxed text-slate-600">
            Upload your documents, then ask natural-language questions and get
            answers grounded strictly in your own knowledge base — never
            hallucinated, always cited.
          </motion.p>

          <motion.div variants={heroItem} className="mt-2 flex flex-wrap gap-3">
            <Link href="/ingest">
              <Button className="group">
                <FileUp size={16} strokeWidth={2.25} />
                Add a Document
                <ArrowRight
                  size={15}
                  strokeWidth={2.5}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Button>
            </Link>
            <Link href="/ask">
              <Button variant="secondary">
                <MessageCircleQuestion size={16} strokeWidth={2.25} />
                Ask a Question
              </Button>
            </Link>
          </motion.div>
        </motion.section>

        <section className="flex flex-col gap-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              How the RAG pipeline works
            </h2>
            <span className="text-sm text-slate-400">six steps, end to end</span>
          </div>

          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            style={{ perspective: 1200 }}
          >
            {PIPELINE_STEPS.map((item, index) => (
              <PipelineCard key={item.step} item={item} index={index} />
            ))}
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6 pb-10"
        >
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Built with
          </h2>
          <div className="flex flex-wrap gap-2">
            {TECH_STACK.map((tech, index) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.section>
      </div>
    </Container>
  );
}

function PipelineCard({ item, index }: { item: PipelineStep; index: number }) {
  const { step, title, description, icon: Icon } = item;
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [9, -9]), {
    stiffness: 300,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-9, 9]), {
    stiffness: 300,
    damping: 25,
  });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    mouseX.set((event.clientX - bounds.left) / bounds.width);
    mouseY.set((event.clientY - bounds.top) / bounds.height);
  }

  function handleMouseLeave() {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateX: -25 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.65, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition-shadow hover:shadow-card"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
          <Icon size={17} strokeWidth={2.25} />
        </div>
        <span className="font-mono text-xs font-medium text-slate-300">{step}</span>
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
    </motion.div>
  );
}

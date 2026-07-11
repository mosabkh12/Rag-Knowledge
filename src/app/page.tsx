import Link from "next/link";
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
} from "lucide-react";

const PIPELINE_STEPS = [
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

export default function HomePage() {
  return (
    <Container size="wide">
      <div className="flex flex-col gap-24">
        <section className="flex flex-col items-start gap-6 pt-6 sm:pt-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            <Sparkles size={13} strokeWidth={2.25} />
            Retrieval-Augmented Generation
          </span>

          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Ask your documents anything.{" "}
            <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
              Get answers you can trust.
            </span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-slate-600">
            Upload your documents, then ask natural-language questions and get
            answers grounded strictly in your own knowledge base — never
            hallucinated, always cited.
          </p>

          <div className="mt-2 flex flex-wrap gap-3">
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
          </div>
        </section>

        <section className="flex flex-col gap-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              How the RAG pipeline works
            </h2>
            <span className="text-sm text-slate-400">six steps, end to end</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PIPELINE_STEPS.map(({ step, title, description, icon: Icon }) => (
              <div
                key={step}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <Icon size={17} strokeWidth={2.25} />
                  </div>
                  <span className="font-mono text-xs font-medium text-slate-300">
                    {step}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6 pb-10">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Built with
          </h2>
          <div className="flex flex-wrap gap-2">
            {TECH_STACK.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>
      </div>
    </Container>
  );
}

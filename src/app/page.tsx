import Link from "next/link";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";

export default function HomePage() {
  return (
    <Container>
      <div className="flex flex-col gap-10">
        <section>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            RAG Knowledge Base Assistant
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Upload your documents, then ask natural-language questions and
            get answers that are grounded strictly in your own knowledge
            base &mdash; powered by Retrieval-Augmented Generation (RAG).
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/ingest">
              <Button>Add a Document</Button>
            </Link>
            <Link href="/ask">
              <Button variant="secondary">Ask a Question</Button>
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            How the RAG pipeline works
          </h2>
          <ol className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-slate-600">
            <li>
              <span className="font-medium text-slate-800">1. Ingest.</span>{" "}
              Your document title and content are saved to Supabase.
            </li>
            <li>
              <span className="font-medium text-slate-800">2. Chunk.</span>{" "}
              The text is split into overlapping 800&ndash;1000 character
              chunks to preserve context across boundaries.
            </li>
            <li>
              <span className="font-medium text-slate-800">3. Embed.</span>{" "}
              Each chunk is converted into a 1536-dimension vector using
              OpenAI&apos;s <code>text-embedding-3-small</code> model.
            </li>
            <li>
              <span className="font-medium text-slate-800">4. Store.</span>{" "}
              Chunks and embeddings are stored in Postgres using the
              pgvector extension.
            </li>
            <li>
              <span className="font-medium text-slate-800">5. Retrieve.</span>{" "}
              When you ask a question, it&apos;s embedded and matched
              against stored chunks using cosine similarity search.
            </li>
            <li>
              <span className="font-medium text-slate-800">6. Generate.</span>{" "}
              The most relevant chunks are passed to an OpenAI chat model,
              which answers strictly from that context &mdash; or tells you
              it doesn&apos;t know.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Technologies used
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600 sm:grid-cols-3">
            <li>Next.js 15 (App Router)</li>
            <li>TypeScript</li>
            <li>Tailwind CSS</li>
            <li>Supabase PostgreSQL</li>
            <li>pgvector</li>
            <li>OpenAI API</li>
            <li>Vercel</li>
          </ul>
        </section>
      </div>
    </Container>
  );
}

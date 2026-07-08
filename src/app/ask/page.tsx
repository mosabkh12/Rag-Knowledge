import Container from "@/components/layout/Container";
import AskForm from "@/components/ask/AskForm";

export default function AskPage() {
  return (
    <Container>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Ask a Question
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Ask anything about the documents you&apos;ve added. Answers are
            generated strictly from retrieved context, with sources shown
            below.
          </p>
        </div>
        <AskForm />
      </div>
    </Container>
  );
}

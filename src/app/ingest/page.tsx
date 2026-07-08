import Container from "@/components/layout/Container";
import DocumentForm from "@/components/documents/DocumentForm";

export default function IngestPage() {
  return (
    <Container>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Add Document
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Paste a document below. It will be chunked, embedded, and added
            to the knowledge base so it can be retrieved when answering
            questions.
          </p>
        </div>
        <DocumentForm />
      </div>
    </Container>
  );
}

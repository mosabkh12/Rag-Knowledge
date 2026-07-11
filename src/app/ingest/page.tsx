import { FileUp } from "lucide-react";
import Container from "@/components/layout/Container";
import PageHeader from "@/components/layout/PageHeader";
import DocumentForm from "@/components/documents/DocumentForm";

export default function IngestPage() {
  return (
    <Container>
      <div className="flex flex-col gap-8">
        <PageHeader
          icon={FileUp}
          title="Add Document"
          description="Paste text or upload a .txt, .md, .pdf, or .docx file. It will be chunked, embedded, and added to the knowledge base so it can be retrieved when answering questions."
        />
        <DocumentForm />
      </div>
    </Container>
  );
}

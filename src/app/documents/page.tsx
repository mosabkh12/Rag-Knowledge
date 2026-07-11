import { Library } from "lucide-react";
import Container from "@/components/layout/Container";
import PageHeader from "@/components/layout/PageHeader";
import DocumentList from "@/components/documents/DocumentList";

export default function DocumentsPage() {
  return (
    <Container>
      <div className="flex flex-col gap-8">
        <PageHeader
          icon={Library}
          title="Your Documents"
          description="Everything you've added to the knowledge base. Expand a document to read its full content, or remove it if it's no longer needed."
        />
        <DocumentList />
      </div>
    </Container>
  );
}

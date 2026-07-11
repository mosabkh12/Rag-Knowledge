import { MessageCircleQuestion } from "lucide-react";
import Container from "@/components/layout/Container";
import PageHeader from "@/components/layout/PageHeader";
import AskForm from "@/components/ask/AskForm";

export default function AskPage() {
  return (
    <Container>
      <div className="flex flex-col gap-8">
        <PageHeader
          icon={MessageCircleQuestion}
          title="Ask a Question"
          description="Ask anything about the documents you've added. Answers are generated strictly from retrieved context, with sources shown below."
        />
        <AskForm />
      </div>
    </Container>
  );
}

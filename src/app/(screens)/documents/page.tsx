import { Library } from "lucide-react";
import Container from "@/components/layout/Container";
import PageHeader from "@/components/layout/PageHeader";
import DocumentList from "@/components/documents/DocumentList";
import { getCurrentProfile } from "@/server/auth/session";

export default async function DocumentsPage() {
  const profile = await getCurrentProfile();

  return (
    <Container>
      <div className="flex flex-col gap-8">
        <PageHeader
          icon={Library}
          title="Your Documents"
          description="Everything added to the knowledge base. Expand a document to read its full content, or remove it if it's no longer needed."
        />
        <DocumentList
          currentUserId={profile?.id ?? null}
          isAdmin={profile?.role === "admin"}
        />
      </div>
    </Container>
  );
}

import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import Container from "@/components/layout/Container";
import PageHeader from "@/components/layout/PageHeader";
import UserTable from "@/components/admin/UserTable";
import { getCurrentProfile } from "@/server/auth/session";
import { listProfiles } from "@/server/db/profileRepository";

export default async function AdminPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/signin");
  }

  if (profile.role !== "admin") {
    redirect("/");
  }

  const users = await listProfiles();

  return (
    <Container>
      <div className="flex flex-col gap-8">
        <PageHeader
          icon={ShieldCheck}
          title="Admin"
          description="Manage who has access to the knowledge base and who can administer it."
        />
        <UserTable initialUsers={users} currentUserId={profile.id} />
      </div>
    </Container>
  );
}

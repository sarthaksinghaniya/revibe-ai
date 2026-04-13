import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import GitHubConnectCard from "@/components/profile/GitHubConnectCard";
import { ProfileDashboard } from "@/components/profile/ProfileDashboard";
import { ResumeProjectCard } from "@/components/shared/ResumeProjectCard";

export default function ProfilePage() {
  return (
    <PageShell>
      <PageHeader
        title="Profile Dashboard"
        description="Track projects, continue builds, and manage your Revibe AI journey in one place."
      />
      <div className="mt-8 grid gap-6">
        <ResumeProjectCard />
        <ProfileDashboard />
        <div className="max-w-3xl">
          <GitHubConnectCard />
        </div>
      </div>
    </PageShell>
  );
}

import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import GitHubConnectCard from "@/components/profile/GitHubConnectCard";

export default function ProfilePage() {
  return (
    <PageShell>
      <PageHeader
        title="Profile Settings"
        description="Set up your public developer identity details for your Revibe AI profile."
      />
      <div className="mt-8 max-w-3xl">
        <GitHubConnectCard />
      </div>
    </PageShell>
  );
}

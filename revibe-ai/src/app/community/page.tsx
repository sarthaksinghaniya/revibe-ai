import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PostCard } from "@/components/cards/PostCard";
import { mockPosts } from "@/data/mockCommunity";
import { Card } from "@/components/ui/Card";

export default function CommunityPage() {
  return (
    <PageShell>
      <PageHeader
        title="Community"
        description="A simple, Instagram-inspired feed for progress updates. Posts are mock data for now."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <div className="grid gap-4 lg:col-span-7">
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-20 grid gap-4">
            <Card className="p-6">
              <p className="text-sm font-semibold">Share your progress</p>
              <p className="mt-2 text-sm leading-6 text-foreground/70">
                This panel will become the “create post” flow later. For now, it
                stays as a clean placeholder.
              </p>
              <div className="mt-4 rounded-2xl bg-muted/60 p-4 ring-1 ring-border">
                <p className="text-xs text-foreground/60">Coming next</p>
                <p className="mt-1 text-sm font-medium">
                  Upload → Analysis → Start Project → Post update
                </p>
              </div>
            </Card>
            <Card className="p-6">
              <p className="text-sm font-semibold">Community guidelines</p>
              <ul className="mt-3 grid gap-2 text-sm text-foreground/70">
                <li>Keep it safe and beginner-friendly.</li>
                <li>Share what worked (and what didn’t).</li>
                <li>Reuse parts responsibly.</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

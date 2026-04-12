"use client";

import { useEffect, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PostCard } from "@/components/cards/PostCard";
import { Card } from "@/components/ui/Card";
import { getPosts, type CommunityPost } from "@/lib/api";

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await getPosts();
        setPosts(response.data);
      } catch (error) {
        console.error("[community] GET /api/posts failed:", error);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPosts();
  }, []);

  return (
    <PageShell>
      <PageHeader
        title="Community"
        description="A simple, Instagram-inspired feed for progress updates."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <div className="grid gap-4 lg:col-span-7">
          {isLoading ? (
            <Card className="p-6">
              <p className="text-sm text-foreground/70">Loading community posts...</p>
            </Card>
          ) : posts.length === 0 ? (
            <Card className="p-6">
              <p className="text-sm text-foreground/70">
                No community posts yet. Be the first to share a project update.
              </p>
            </Card>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
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

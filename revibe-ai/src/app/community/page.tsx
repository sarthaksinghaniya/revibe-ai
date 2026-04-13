"use client";

import { type FormEvent, useEffect, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PostCard } from "@/components/cards/PostCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StateCard } from "@/components/ui/StateCard";
import { createPost, getPosts, type CommunityPost } from "@/lib/api";

const DEFAULT_POST_IMAGE = "/mock/ewaste-1.svg";

function normalizePostImageSrc(src: string): string {
  if (!src) return DEFAULT_POST_IMAGE;
  if (src.startsWith("/")) return src;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return DEFAULT_POST_IMAGE;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [caption, setCaption] = useState("");
  const [progress, setProgress] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedCaption = caption.trim();
    const trimmedImageUrl = imageUrl.trim();
    const normalizedImageSrc = normalizePostImageSrc(trimmedImageUrl);
    const trimmedProgress = progress.trim();

    if (trimmedCaption.length < 2) {
      setSubmitError("Caption must be at least 2 characters.");
      return;
    }

    let progressPct: number | undefined;
    if (trimmedProgress) {
      const parsed = Number(trimmedProgress);
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
        setSubmitError("Progress must be a number between 0 and 100.");
        return;
      }
      progressPct = Math.round(parsed);
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const response = await createPost({
        userName: "Guest Builder",
        caption: trimmedCaption,
        imageSrc: normalizedImageSrc,
        progressPct,
      });

      setPosts((prev) => [response.data, ...prev]);
      setCaption("");
      setProgress("");
      setImageUrl("");
      setSubmitSuccess("Post shared successfully with the community.");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Could not create post right now. Please try again.",
      );
      console.error("[community] POST /api/posts failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="Community"
        description="A simple, Instagram-inspired feed for progress updates."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-12" aria-busy={isLoading || isSubmitting}>
        <div className="grid gap-4 lg:col-span-7">
          {isLoading ? (
            <StateCard
              title="Loading posts"
              description="Pulling latest community updates from the backend feed."
            />
          ) : posts.length === 0 ? (
            <StateCard
              title="No posts yet"
              description="Be the first to share a progress update with the community."
            />
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-20 grid gap-4">
            <Card className="p-6">
              <p className="text-sm font-semibold">Share your progress</p>
              <form className="mt-3 grid gap-3" onSubmit={onSubmit}>
                <label htmlFor="post-caption" className="text-xs font-medium text-foreground/70">
                  Caption
                </label>
                <textarea
                  id="post-caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a quick caption..."
                  className="min-h-24 rounded-2xl bg-muted/60 p-3 text-sm ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-describedby="post-caption-help"
                />
                <p id="post-caption-help" className="-mt-1 text-xs text-foreground/60">
                  Keep it practical and beginner-friendly.
                </p>
                <label htmlFor="post-progress" className="text-xs font-medium text-foreground/70">
                  Progress (optional)
                </label>
                <input
                  id="post-progress"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  placeholder="Progress % (optional)"
                  className="h-11 rounded-full bg-card px-4 text-sm ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  inputMode="numeric"
                />
                <label htmlFor="post-image-url" className="text-xs font-medium text-foreground/70">
                  Image URL (optional)
                </label>
                <input
                  id="post-image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Image URL (optional)"
                  className="h-11 rounded-full bg-card px-4 text-sm ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {submitError ? (
                  <p className="text-sm text-rose-700" role="alert">
                    {submitError}
                  </p>
                ) : null}
                {submitSuccess ? (
                  <p className="text-sm text-emerald-700" role="status">
                    {submitSuccess}
                  </p>
                ) : null}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Posting..." : "Create post"}
                </Button>
              </form>
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

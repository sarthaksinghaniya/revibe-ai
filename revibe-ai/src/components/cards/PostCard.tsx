import Image from "next/image";

import type { CommunityPost } from "@/data/mockCommunity";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function PostCard({ post }: { post: CommunityPost }) {
  return (
    <Card className="overflow-hidden hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
      <div className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 ring-1 ring-border grid place-items-center text-xs font-semibold text-primary">
              {post.avatarInitials}
            </div>
            <div>
              <p className="text-sm font-semibold leading-5">{post.userName}</p>
              <p className="text-xs text-foreground/60">{post.createdAt}</p>
            </div>
          </div>
          <div className="text-xs text-foreground/60">{post.progressPct}%</div>
        </div>

        <p className="mt-4 text-sm leading-6 text-foreground/80">{post.caption}</p>
        <div className="mt-4">
          <ProgressBar value={post.progressPct} />
        </div>
      </div>

      <div className="relative aspect-[3/2] w-full bg-muted">
        <Image
          src={post.imageSrc}
          alt={`${post.userName} project update`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 720px"
          priority={post.id === "p1"}
        />
      </div>

      <div className="flex items-center justify-between px-5 py-4 text-sm">
        <div className="flex items-center gap-4 text-foreground/80">
          <span>
            <span className="font-semibold">{post.likes}</span>{" "}
            <span className="text-foreground/60">likes</span>
          </span>
          <span>
            <span className="font-semibold">{post.comments}</span>{" "}
            <span className="text-foreground/60">comments</span>
          </span>
        </div>
        <span className="text-xs text-foreground/60">Mock data</span>
      </div>
    </Card>
  );
}

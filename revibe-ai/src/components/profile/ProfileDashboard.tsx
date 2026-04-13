"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { buttonStyles } from "@/components/ui/Button";
import { getPosts } from "@/lib/api";
import { useAppState, type SavedProjectState } from "@/lib/appState";

function formatDate(iso?: string): string {
  if (!iso) return "Recently";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ProfileDashboard() {
  const { hydrated, state, setState, setStateImmediate } = useAppState();
  const [communityError, setCommunityError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    void (async () => {
      try {
        const response = await getPosts();
        const count = response.data.filter((post) => post.userName === "Guest Builder").length;
        setState((prev) => ({
          ...prev,
          profileStats: { ...prev.profileStats, communityShared: count },
        }));
        setCommunityError(null);
      } catch {
        setCommunityError("Could not load shared post count right now.");
      }
    })();
  }, [hydrated, setState]);

  const grouped = useMemo(() => {
    const inProgress: SavedProjectState[] = [];
    const completed: SavedProjectState[] = [];

    for (const project of state.savedProjects) {
      const completedSteps = Number(project.progress?.completed ?? 0);
      const totalSteps = Number(project.progress?.total ?? 0);
      if (totalSteps > 0 && completedSteps >= totalSteps) {
        completed.push(project);
      } else {
        inProgress.push(project);
      }
    }

    return { inProgress, completed };
  }, [state.savedProjects]);

  const lastAnalysis = state.analysis.latest;

  const stats = useMemo(
    () => ({
      totalStarted: state.savedProjects.length,
      completedBuilds: grouped.completed.length,
      savedIdeas: state.analysis.latest?.result.ideas.length ?? state.profileStats.savedIdeas,
      communityShared: state.profileStats.communityShared,
    }),
    [
      grouped.completed.length,
      state.analysis.latest?.result.ideas.length,
      state.profileStats.communityShared,
      state.profileStats.savedIdeas,
      state.savedProjects.length,
    ],
  );

  if (!hydrated) {
    return (
      <Card className="p-6">
        <p className="text-sm text-foreground/70">Loading your dashboard...</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <p className="text-sm font-semibold">Quick stats</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-muted/60 p-4 ring-1 ring-border">
            <p className="text-xs text-foreground/65">Total projects started</p>
            <p className="mt-1 text-2xl font-semibold">{stats.totalStarted}</p>
          </div>
          <div className="rounded-xl bg-muted/60 p-4 ring-1 ring-border">
            <p className="text-xs text-foreground/65">Completed builds</p>
            <p className="mt-1 text-2xl font-semibold">{stats.completedBuilds}</p>
          </div>
          <div className="rounded-xl bg-muted/60 p-4 ring-1 ring-border">
            <p className="text-xs text-foreground/65">Saved ideas</p>
            <p className="mt-1 text-2xl font-semibold">{stats.savedIdeas}</p>
          </div>
          <div className="rounded-xl bg-muted/60 p-4 ring-1 ring-border">
            <p className="text-xs text-foreground/65">Community posts shared</p>
            <p className="mt-1 text-2xl font-semibold">{stats.communityShared}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">Saved Projects</p>
          <StatusBadge label={`${state.savedProjects.length} saved`} variant="neutral" />
        </div>
        {state.savedProjects.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/70">
            No projects saved yet. Analyze a material and tap “Save Project”.
          </p>
        ) : (
          <div className="mt-3 grid gap-3">
            {state.savedProjects.slice(0, 3).map((project, idx) => (
              <div key={`${project.title}-${idx}`} className="rounded-xl bg-muted/60 p-4 ring-1 ring-border">
                <p className="text-sm font-semibold">{project.title || "Saved project"}</p>
                <p className="mt-1 text-sm text-foreground/70">
                  Material: {project.material || "Unknown"}
                </p>
                <p className="mt-1 text-xs text-foreground/60">
                  Saved on {formatDate(project.savedAt)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/project-guide" className={buttonStyles({ size: "sm" })}>
                    Continue Project
                  </Link>
                  <Link
                    href="/results"
                    className={buttonStyles({ size: "sm", variant: "outline" })}
                  >
                    View Details
                  </Link>
                  <button
                    className={buttonStyles({ size: "sm", variant: "outline" })}
                    onClick={() => {
                      setStateImmediate((prev) => {
                        const nextSaved = prev.savedProjects.filter((_, i) => i !== idx);
                        return {
                          ...prev,
                          savedProjects: nextSaved,
                          profileStats: {
                            ...prev.profileStats,
                            totalStarted: nextSaved.length,
                            completedBuilds: nextSaved.filter((item) => {
                              const completed = Number(item.progress?.completed ?? 0);
                              const total = Number(item.progress?.total ?? 0);
                              return total > 0 && completed >= total;
                            }).length,
                          },
                        };
                      });
                    }}
                  >
                    Remove from saved
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">Last Analysis</p>
          <StatusBadge label={lastAnalysis ? "Available" : "Not available"} variant="neutral" />
        </div>
        {!lastAnalysis ? (
          <p className="mt-3 text-sm text-foreground/70">
            No analysis yet. Upload material to generate your first result.
          </p>
        ) : (
          <div className="mt-3 rounded-xl bg-muted/60 p-4 ring-1 ring-border">
            <p className="text-sm font-semibold">{lastAnalysis.itemName}</p>
            <p className="mt-1 text-sm text-foreground/70">
              Material: {lastAnalysis.result.material}
            </p>
            <p className="mt-1 text-xs text-foreground/60">
              Updated on {formatDate(lastAnalysis.createdAt)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/project-guide" className={buttonStyles({ size: "sm" })}>
                Continue
              </Link>
              <Link href="/results" className={buttonStyles({ size: "sm", variant: "outline" })}>
                View Details
              </Link>
            </div>
          </div>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">In Progress</p>
            <StatusBadge label={`${grouped.inProgress.length}`} variant="medium" />
          </div>
          {grouped.inProgress.length === 0 ? (
            <p className="mt-3 text-sm text-foreground/70">
              Start a project to see progress tracking here.
            </p>
          ) : (
            <div className="mt-3 grid gap-3">
              {grouped.inProgress.slice(0, 4).map((item, idx) => (
                <div key={`${item.title}-${idx}`} className="rounded-xl bg-muted/60 p-3 ring-1 ring-border">
                  <p className="text-sm font-semibold">{item.title || "Untitled project"}</p>
                  <p className="mt-1 text-xs text-foreground/65">
                    {Number(item.progress?.completed ?? 0)} of {Number(item.progress?.total ?? 0)} completed
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link href="/project-guide" className={buttonStyles({ size: "sm" })}>
                      Continue
                    </Link>
                    <Link href="/results" className={buttonStyles({ size: "sm", variant: "outline" })}>
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Completed Projects</p>
            <StatusBadge label={`${grouped.completed.length}`} variant="low" />
          </div>
          {grouped.completed.length === 0 ? (
            <p className="mt-3 text-sm text-foreground/70">
              Mark all steps complete in Project Guide to finish a build.
            </p>
          ) : (
            <div className="mt-3 grid gap-3">
              {grouped.completed.slice(0, 4).map((item, idx) => (
                <div key={`${item.title}-${idx}`} className="rounded-xl bg-muted/60 p-3 ring-1 ring-border">
                  <p className="text-sm font-semibold">{item.title || "Untitled project"}</p>
                  <p className="mt-1 text-xs text-foreground/65">
                    Completed on {formatDate(item.savedAt)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link href="/project-guide" className={buttonStyles({ size: "sm" })}>
                      Continue
                    </Link>
                    <Link href="/results" className={buttonStyles({ size: "sm", variant: "outline" })}>
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Shared to Community</p>
            <StatusBadge label={`${stats.communityShared}`} variant="neutral" />
          </div>
          <p className="mt-3 text-sm text-foreground/70">
            Track how many progress posts you shared from your builder account.
          </p>
          {communityError ? (
            <p className="mt-2 text-xs text-foreground/60">{communityError}</p>
          ) : null}
          <div className="mt-4">
            <Link href="/community" className={buttonStyles({ size: "sm", variant: "outline" })}>
              Open Community
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

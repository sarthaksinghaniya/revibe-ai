"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button, buttonStyles } from "@/components/ui/Button";
import { RiskBadge, StatusBadge } from "@/components/ui/StatusBadge";
import { Icon } from "@/components/ui/Icon";
import { IdeaCard } from "@/components/cards/IdeaCard";
import type { ReuseIdea, RiskLevel } from "@/data/mockAnalysis";
import { readLatestAnalysis, type StoredAnalysis } from "@/lib/analysisSession";

function normalizeRisk(risk: string): RiskLevel {
  const normalized = risk.toLowerCase();
  if (normalized === "low") return "Low";
  if (normalized === "high") return "High";
  return "Medium";
}

function normalizeDifficulty(difficulty: string): ReuseIdea["difficulty"] {
  const normalized = difficulty.toLowerCase();
  if (normalized === "easy") return "Easy";
  if (normalized === "hard") return "Hard";
  return "Medium";
}

export default function ResultsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<StoredAnalysis | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const latest = readLatestAnalysis();
      setAnalysis(latest);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Could not load latest analysis result.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const ideas: ReuseIdea[] = useMemo(() => {
    if (!analysis) return [];
    return analysis.result.ideas.map((idea) => ({
      title: idea.title,
      difficulty: normalizeDifficulty(idea.difficulty),
      time: `Cost: ${idea.estimatedCost || "N/A"}`,
      summary: idea.description,
    }));
  }, [analysis]);

  if (isLoading) {
    return (
      <PageShell>
        <PageHeader
          title="Analysis result"
          description="Loading latest analysis result..."
        />
      </PageShell>
    );
  }

  if (loadError) {
    return (
      <PageShell>
        <PageHeader
          title="Analysis result"
          description="Could not load the analysis result."
          action={
            <Link href="/upload" className={buttonStyles({ variant: "outline" })}>
              Back to upload
            </Link>
          }
        />
        <Card className="mt-8 p-6">
          <p className="text-sm text-rose-700">{loadError}</p>
        </Card>
      </PageShell>
    );
  }

  if (!analysis) {
    return (
      <PageShell>
        <PageHeader
          title="Analysis result"
          description="No analysis found yet. Upload a file and run Analyze first."
          action={
            <Link href="/upload" className={buttonStyles({ variant: "outline" })}>
              Go to upload
            </Link>
          }
        />
      </PageShell>
    );
  }

  const risk = normalizeRisk(analysis.result.risk);
  const safetyNote =
    analysis.result.steps[0] ??
    "Handle components carefully and follow basic e-waste safety precautions.";

  return (
    <PageShell>
      <PageHeader
        title="Analysis result"
        description="Showing backend analysis response for material, confidence, risk, and reuse ideas."
        action={
          <Link href="/upload" className={buttonStyles({ variant: "outline" })}>
            Upload another
          </Link>
        }
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-12">
        <Card className="p-6 lg:col-span-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">{analysis.itemName}</p>
              <p className="mt-2 text-sm leading-6 text-foreground/70">
                <span className="font-medium text-foreground">Detected:</span>{" "}
                {analysis.result.material}
              </p>
            </div>
            <div className="h-10 w-10 shrink-0 rounded-2xl bg-primary/10 ring-1 ring-border grid place-items-center text-primary">
              <Icon name="shield" />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <StatusBadge label={`Confidence: ${analysis.result.confidence}%`} />
            <RiskBadge risk={risk} />
            <StatusBadge
              label={`Sustainability: ${analysis.result.sustainabilityScore}`}
            />
          </div>

          <div className="mt-5 rounded-2xl bg-muted/60 p-4 ring-1 ring-border">
            <p className="text-sm font-medium">Safety note</p>
            <p className="mt-1 text-sm leading-6 text-foreground/70">
              {safetyNote}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" disabled>
              Start Project (next)
            </Button>
            <Link
              href="/community"
              className={buttonStyles({ size: "lg", variant: "outline" })}
            >
              See community builds
            </Link>
          </div>
          <p className="mt-3 text-xs text-foreground/60">
            Start Project is intentionally disabled until Step 3.
          </p>
        </Card>

        <div className="grid gap-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Reuse ideas</h2>
            <span className="text-xs text-foreground/60">From backend</span>
          </div>
          {ideas.length > 0 ? (
            <div className="grid gap-4">
              {ideas.map((idea) => (
                <IdeaCard key={idea.title} idea={idea} />
              ))}
            </div>
          ) : (
            <Card className="p-6">
              <p className="text-sm text-foreground/70">
                No reuse ideas returned from backend for this analysis.
              </p>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-10">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold">Nearby resources (preview)</h3>
              <p className="mt-2 text-sm leading-6 text-foreground/70">
                Placeholder for a future map-based view of repair shops, donation
                points, and parts stores near you.
              </p>
            </div>
            <StatusBadge label="Map later" variant="neutral" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-muted/60 p-4 ring-1 ring-border">
              <p className="text-xs text-foreground/60">Repair cafés</p>
              <div className="mt-2 h-3 w-24 rounded-full bg-foreground/10" />
            </div>
            <div className="rounded-2xl bg-muted/60 p-4 ring-1 ring-border">
              <p className="text-xs text-foreground/60">Donations</p>
              <div className="mt-2 h-3 w-32 rounded-full bg-foreground/10" />
            </div>
            <div className="rounded-2xl bg-muted/60 p-4 ring-1 ring-border">
              <p className="text-xs text-foreground/60">Parts</p>
              <div className="mt-2 h-3 w-20 rounded-full bg-foreground/10" />
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

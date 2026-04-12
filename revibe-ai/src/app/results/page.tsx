"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button, buttonStyles } from "@/components/ui/Button";
import { RiskBadge, StatusBadge } from "@/components/ui/StatusBadge";
import { Icon } from "@/components/ui/Icon";
import { StateCard } from "@/components/ui/StateCard";
import { IdeaCard } from "@/components/cards/IdeaCard";
import { ResourceList } from "@/components/map/ResourceList";
import { ResourceMap } from "@/components/map/ResourceMap";
import { mockResources } from "@/data/mockResources";
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

type NormalizedResultsData = {
  itemName: string;
  material: string;
  confidence: number;
  risk: RiskLevel;
  sustainabilityScore: number;
  ideas: ReuseIdea[];
  steps: string[];
  hasIncompleteFields: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function toStringOrFallback(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeResultsData(analysis: StoredAnalysis): NormalizedResultsData {
  const result = analysis?.result;

  const itemName = toStringOrFallback(analysis?.itemName, "Unknown item");
  const material = toStringOrFallback(
    result?.material,
    "Material could not be identified"
  );

  const confidenceRaw =
    typeof result?.confidence === "number" && Number.isFinite(result.confidence)
      ? result.confidence
      : 75;
  const confidence = clamp(Math.round(confidenceRaw), 0, 100);

  const risk = normalizeRisk(toStringOrFallback(result?.risk, "Medium"));

  const scoreRaw =
    typeof result?.sustainabilityScore === "number" &&
    Number.isFinite(result.sustainabilityScore)
      ? result.sustainabilityScore
      : 70;
  const sustainabilityScore = clamp(Math.round(scoreRaw), 0, 100);

  const rawIdeas = Array.isArray(result?.ideas) ? result.ideas : [];
  const ideas = rawIdeas
    .map((idea) => ({
      title: toStringOrFallback(idea?.title, "Reusable project idea"),
      difficulty: normalizeDifficulty(toStringOrFallback(idea?.difficulty, "Medium")),
      time: `Cost: ${toStringOrFallback(idea?.estimatedCost, "N/A")}`,
      summary: toStringOrFallback(
        idea?.description,
        "A practical low-cost reuse idea based on available components."
      ),
    }))
    .filter((idea) => idea.title.length > 0);

  const rawSteps = Array.isArray(result?.steps) ? result.steps : [];
  const steps = rawSteps
    .map((step) => toStringOrFallback(step, ""))
    .filter((step) => step.length > 0);

  const hasIncompleteFields =
    !analysis?.itemName ||
    !result?.material ||
    !Array.isArray(result?.ideas) ||
    !Array.isArray(result?.steps);

  return {
    itemName,
    material,
    confidence,
    risk,
    sustainabilityScore,
    ideas,
    steps,
    hasIncompleteFields,
  };
}

export default function ResultsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<StoredAnalysis | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const resources = mockResources;
  const [activeResourceId, setActiveResourceId] = useState<string | null>(
    resources[0]?.id ?? null
  );

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

  const normalized = useMemo(() => {
    if (!analysis) return null;
    return normalizeResultsData(analysis);
  }, [analysis]);

  if (isLoading) {
    return (
      <PageShell>
        <PageHeader
          title="Analysis result"
          description="Loading latest analysis result..."
        />
        <StateCard
          className="mt-8"
          title="Loading analysis"
          description="Preparing your latest AI recommendation output."
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
        <StateCard
          className="mt-8"
          title="Could not load analysis"
          description={loadError}
          tone="error"
        />
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

  if (!normalized) {
    return (
      <PageShell>
        <PageHeader
          title="Analysis result"
          description="Analysis data was unavailable. Try running Analyze again."
          action={
            <Link href="/upload" className={buttonStyles({ variant: "outline" })}>
              Go to upload
            </Link>
          }
        />
      </PageShell>
    );
  }

  const safetyNote =
    normalized.steps[0] ??
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
              <p className="text-sm font-semibold">{normalized.itemName}</p>
              <p className="mt-2 text-sm leading-6 text-foreground/70">
                <span className="font-medium text-foreground">Detected:</span>{" "}
                {normalized.material}
              </p>
            </div>
            <div className="h-10 w-10 shrink-0 rounded-2xl bg-primary/10 ring-1 ring-border grid place-items-center text-primary">
              <Icon name="shield" />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <StatusBadge label={`Confidence: ${normalized.confidence}%`} />
            <RiskBadge risk={normalized.risk} />
            <StatusBadge label={`Sustainability: ${normalized.sustainabilityScore}`} />
          </div>

          <div className="mt-5 rounded-2xl bg-muted/60 p-4 ring-1 ring-border">
            <p className="text-sm font-medium">Safety note</p>
            <p className="mt-1 text-sm leading-6 text-foreground/70">
              {safetyNote}
            </p>
          </div>
          {normalized.hasIncompleteFields ? (
            <p className="mt-3 text-xs text-foreground/60">
              Some AI fields were incomplete, so safe defaults were applied.
            </p>
          ) : null}

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
          {normalized.ideas.length > 0 ? (
            <div className="grid gap-4">
              {normalized.ideas.map((idea) => (
                <IdeaCard key={idea.title} idea={idea} />
              ))}
            </div>
          ) : (
            <StateCard
              title="No ideas returned"
              description="The backend response did not include project ideas for this item. Try another upload."
            />
          )}
        </div>
      </div>

      <div className="mt-10">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold">Nearby Resources</h3>
              <p className="mt-2 text-sm leading-6 text-foreground/70">
                Quickly scan nearby scrap shops, recycling points, and useful
                material spots. This is a map preview; live resource locations come
                in the next step.
              </p>
            </div>
            <StatusBadge
              label={resources.length > 0 ? `${resources.length} mock points` : "Map later"}
              variant="neutral"
            />
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <ResourceMap
                resources={resources}
                activeResourceId={activeResourceId}
                onSelectResource={setActiveResourceId}
              />
            </div>
            <div className="lg:col-span-5">
              <ResourceList
                resources={resources}
                activeResourceId={activeResourceId}
                onSelectResource={setActiveResourceId}
              />
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

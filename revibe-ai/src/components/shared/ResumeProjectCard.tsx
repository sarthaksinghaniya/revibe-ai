"use client";

import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { buttonStyles } from "@/components/ui/Button";
import { useAppState } from "@/lib/appState";

function formatLastUpdated(iso: string | null): string {
  if (!iso) return "Recently";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ResumeProjectCard() {
  const { hydrated, state } = useAppState();
  if (!hydrated) return null;

  const analysis = state.analysis.latest;
  const selectedIdea = state.analysis.selectedProjectIdea;
  const activeProject = state.activeProject;
  const latestSavedProject = state.savedProjects[0];

  const totalSteps =
    activeProject.steps.length || Number(latestSavedProject?.progress?.total ?? 0);
  const completedSteps =
    totalSteps > 0
      ? Object.values(activeProject.stepStatuses).filter((status) => status === "completed")
          .length || Number(latestSavedProject?.progress?.completed ?? 0)
      : 0;

  const hasUnfinishedAnalysis = Boolean(analysis);
  const hasSelectedIdea = Boolean(selectedIdea);
  const hasActiveProjectInProgress = Boolean(
    activeProject.projectId && (totalSteps === 0 || completedSteps < totalSteps),
  );

  if (!hasUnfinishedAnalysis && !hasSelectedIdea && !hasActiveProjectInProgress) {
    return null;
  }

  const projectName =
    activeProject.projectTitle || selectedIdea?.title || "Your current reuse project";
  const materialName =
    activeProject.material || analysis?.result.material || analysis?.itemName || "Material";
  const progressText =
    totalSteps > 0
      ? `${completedSteps} of ${totalSteps} steps completed`
      : "Analysis saved. Start project steps when ready.";
  const lastUpdated = formatLastUpdated(
    activeProject.lastUpdatedAt || latestSavedProject?.savedAt || analysis?.createdAt || null,
  );

  return (
    <Card className="p-5 sm:p-6">
      <p className="text-sm font-semibold">Resume your last project</p>
      <div className="mt-3 grid gap-2 text-sm text-foreground/80">
        <p>
          <span className="font-semibold">Project:</span> {projectName}
        </p>
        <p>
          <span className="font-semibold">Material:</span> {materialName}
        </p>
        <p>
          <span className="font-semibold">Current progress:</span> {progressText}
        </p>
        <p>
          <span className="font-semibold">Last updated:</span> {lastUpdated}
        </p>
      </div>
      <div className="mt-4">
        <Link href="/project-guide" className={buttonStyles({ size: "sm" })}>
          Continue Project
        </Link>
      </div>
    </Card>
  );
}


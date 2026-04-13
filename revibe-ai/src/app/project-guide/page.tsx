"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";

import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button, buttonStyles } from "@/components/ui/Button";
import { StateCard } from "@/components/ui/StateCard";
import { useAppState, type SavedProjectState, type StepStatus } from "@/lib/appState";

type StepItem = {
  stepNumber: number;
  shortTitle: string;
  whatToDo: string;
  toolsNeeded: string;
  estimatedTime: string;
  cautionTip: string;
};
type CostTip = {
  label: "Free Option" | "Low-Cost Option" | "Best Value";
  title: string;
  detail: string;
};

type LearningResource = {
  title: string;
  description: string;
  skillType: string;
  estimatedTime: string;
  link: string;
};

const HELP_ACTIONS = [
  "Simplify this step",
  "Safer method",
  "Lower cost option",
  "Explain tools needed",
  "Give alternative idea",
] as const;

function buildStepGuide(steps: string[], material: string): StepItem[] {
  const fallback: StepItem[] = [
    {
      stepNumber: 1,
      shortTitle: "Clean the material",
      whatToDo: `Wipe the ${material} and remove dust, rust, or loose plastic pieces before starting.`,
      toolsNeeded: "Dry cloth, brush, gloves",
      estimatedTime: "15-20 min",
      cautionTip: "Wear gloves if edges are sharp.",
    },
    {
      stepNumber: 2,
      shortTitle: "Separate reusable parts",
      whatToDo:
        "Split the material into useful parts and discard clearly damaged pieces safely.",
      toolsNeeded: "Small screwdriver, pliers, containers",
      estimatedTime: "20-30 min",
      cautionTip: "Keep screws and tiny parts in one labeled box.",
    },
    {
      stepNumber: 3,
      shortTitle: "Mark and assemble",
      whatToDo:
        "Mark cut/drill points, then assemble the basic project structure in small stages.",
      toolsNeeded: "Marker, ruler, cutter/drill, tape",
      estimatedTime: "30-45 min",
      cautionTip: "Measure twice before cutting to avoid waste.",
    },
    {
      stepNumber: 4,
      shortTitle: "Finish and test",
      whatToDo:
        "Secure loose parts, test basic function, and make one small improvement for durability.",
      toolsNeeded: "Glue, zip ties, sandpaper (optional)",
      estimatedTime: "20-30 min",
      cautionTip: "Test gently first, then do a full test.",
    },
  ];

  if (!steps.length) return fallback;

  return fallback.map((entry, idx) => {
    const aiStep = steps[idx]?.trim();
    return {
      ...entry,
      whatToDo: aiStep || entry.whatToDo,
    };
  });
}

function estimateTotalTime(stepItems: StepItem[]): string {
  const minutes = stepItems.reduce((sum, step) => {
    const match = step.estimatedTime.match(/(\d+)-(\d+)/);
    if (!match) return sum + 30;
    const low = Number(match[1]);
    const high = Number(match[2]);
    return sum + Math.round((low + high) / 2);
  }, 0);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  return `${hours}h ${mins}m`;
}

function buildCostTips(material: string): CostTip[] {
  return [
    {
      label: "Free Option",
      title: "Use home scrap before buying",
      detail:
        `Reuse old cardboard, packaging foam, or plastic trays with your ${material} parts instead of buying new base sheets.`,
    },
    {
      label: "Low-Cost Option",
      title: "Borrow tools instead of purchasing",
      detail:
        "Borrow a glue gun, drill, or soldering kit from a friend, school lab, or local maker space for one-day use.",
    },
    {
      label: "Best Value",
      title: "Buy only tiny missing parts",
      detail:
        "Purchase only essentials like tape, screws, or connectors from local hardware/e-waste markets instead of full new kits.",
    },
    {
      label: "Free Option",
      title: "Reuse small components from home",
      detail:
        "Save bottle caps, broken wires, old screws, zip ties, and leftover switches from damaged gadgets for assembly.",
    },
    {
      label: "Low-Cost Option",
      title: "Skip expensive finishing tools",
      detail:
        "Use sandpaper + hand tools for shaping and finishing instead of powered tools unless absolutely needed.",
    },
  ];
}

function buildLearningResources(material: string) {
  return {
    basicConcepts: [
      {
        title: "Basic e-waste sorting",
        description: `Learn how to separate ${material} parts into reusable, recyclable, and discard groups.`,
        skillType: "Concept",
        estimatedTime: "10 min",
        link: "https://www.youtube.com/results?search_query=basic+e-waste+sorting",
      },
      {
        title: "Reuse potential check",
        description:
          "Understand how to quickly decide if a part is worth reusing in a beginner project.",
        skillType: "Concept",
        estimatedTime: "8 min",
        link: "https://www.youtube.com/results?search_query=how+to+reuse+electronics+parts",
      },
    ] satisfies LearningResource[],
    practicalSkills: [
      {
        title: "How to cut plastic safely",
        description:
          "Simple ways to mark and cut plastic or casing material without cracking it.",
        skillType: "Hands-on",
        estimatedTime: "12 min",
        link: "https://www.youtube.com/results?search_query=cut+plastic+safely+diy",
      },
      {
        title: "Simple DIY joining methods",
        description:
          "Use tape, screws, zip ties, and glue in low-cost builds for stronger joints.",
        skillType: "Hands-on",
        estimatedTime: "10 min",
        link: "https://www.youtube.com/results?search_query=diy+joining+methods+for+beginners",
      },
      {
        title: "How to reuse small motors",
        description:
          "Beginner ideas for testing and reusing motors from fans or old devices.",
        skillType: "Hands-on",
        estimatedTime: "15 min",
        link: "https://www.youtube.com/results?search_query=reuse+small+motor+diy",
      },
    ] satisfies LearningResource[],
    safetyAndTools: [
      {
        title: "Beginner soldering basics",
        description:
          "Learn basic soldering only if your project needs wire connections.",
        skillType: "Tool usage",
        estimatedTime: "20 min",
        link: "https://www.youtube.com/results?search_query=beginner+soldering+basics",
      },
      {
        title: "Tool safety checklist",
        description:
          "Quick safety routine for cutters, drills, glue guns, and basic electrical tools.",
        skillType: "Safety",
        estimatedTime: "7 min",
        link: "https://www.youtube.com/results?search_query=diy+tool+safety+checklist",
      },
    ] satisfies LearningResource[],
  };
}

export default function ProjectGuidePage() {
  const { hydrated, state, setState, setStateImmediate } = useAppState();
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [helpQuery, setHelpQuery] = useState("");
  const [helpAnswer, setHelpAnswer] = useState<string | null>(null);
  const [helpLoading, setHelpLoading] = useState(false);
  const [activeHelpAction, setActiveHelpAction] = useState<string | null>(null);
  const [expandedCompleted, setExpandedCompleted] = useState<Record<number, boolean>>({});
  const helpPanelRef = useRef<HTMLDivElement | null>(null);

  const model = useMemo(() => {
    const analysis = state.analysis.latest;
    if (!analysis) return null;
    const material = analysis.result.material || analysis.itemName;
    const steps = buildStepGuide(analysis.result.steps ?? [], material);
    const mainIdea = analysis.result.ideas?.[0];
    const costTips = buildCostTips(material);
    const resources = buildLearningResources(material);
    const projectId = `${analysis.itemName}::${material}`;
    return {
      projectId,
      projectTitle: `${material} Starter Reuse Project`,
      material,
      reusePotential:
        analysis.result.sustainabilityScore >= 80
          ? "High potential for practical reuse."
          : analysis.result.sustainabilityScore >= 60
            ? "Good potential with a simple plan."
            : "Moderate potential; start with a small project.",
      difficulty: mainIdea?.difficulty || "Easy",
      budget: mainIdea?.estimatedCost || "₹300 - ₹1200",
      safety:
        analysis.result.risk?.toLowerCase() === "low"
          ? "Low risk. Use gloves and keep tools organized."
          : "Use caution with sharp edges and exposed wires.",
      summary:
        mainIdea?.description ||
        `Start with a small, useful build using ${material} parts and improve as you go.`,
      steps,
      totalTime: estimateTotalTime(steps),
      costTips,
      resources,
    };
  }, [state.analysis.latest]);

  const stepStatuses = useMemo(() => {
    if (!model) return {} as Record<number, StepStatus>;
    const savedForProject =
      state.activeProject.projectId === model.projectId ? state.activeProject.stepStatuses : {};
    const nextStatuses: Record<number, StepStatus> = {};

    for (const step of model.steps) {
      const saved = savedForProject[step.stepNumber];
      nextStatuses[step.stepNumber] =
        saved === "in_progress" || saved === "completed" ? saved : "not_started";
    }

    return nextStatuses;
  }, [model, state.activeProject.projectId, state.activeProject.stepStatuses]);

  const completedCount = useMemo(
    () => Object.values(stepStatuses).filter((status) => status === "completed").length,
    [stepStatuses],
  );
  const totalSteps = model?.steps.length ?? 0;
  const progressPercent =
    totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  function saveProject() {
    if (!model) return;
    const nextItem: SavedProjectState = {
      title: model.projectTitle,
      material: model.material,
      progress: {
        completed: completedCount,
        total: totalSteps,
      },
      stepStatuses,
      savedAt: new Date().toISOString(),
    };
    const nextProjects = [nextItem, ...state.savedProjects].slice(0, 20);
    const completedBuilds = nextProjects.filter((project) => {
      const completed = Number(project.progress?.completed ?? 0);
      const total = Number(project.progress?.total ?? 0);
      return total > 0 && completed >= total;
    }).length;
    setState((prev) => ({
      ...prev,
      savedProjects: nextProjects,
      profileStats: {
        ...prev.profileStats,
        totalStarted: nextProjects.length,
        completedBuilds,
        savedIdeas: prev.analysis.latest?.result.ideas.length ?? prev.profileStats.savedIdeas,
      },
    }));
    setSaveNotice("Project saved. You can continue from here anytime.");
  }

  function setStepStatus(stepNumber: number, status: StepStatus) {
    if (!model) return;
    setStateImmediate((prev) => {
      const nextStatuses = {
        ...prev.activeProject.stepStatuses,
        [stepNumber]: status,
      };
      return {
        ...prev,
        activeProject: {
          ...prev.activeProject,
          projectId: model.projectId,
          projectTitle: model.projectTitle,
          material: model.material,
          steps: model.steps.map((step) => step.whatToDo),
          stepStatuses: nextStatuses,
          lastUpdatedAt: new Date().toISOString(),
        },
      };
    });
    if (status !== "completed") {
      setExpandedCompleted((prev) => ({ ...prev, [stepNumber]: false }));
    }
  }

  function toggleCompletedDetail(stepNumber: number) {
    setExpandedCompleted((prev) => ({ ...prev, [stepNumber]: !prev[stepNumber] }));
  }

  function buildMockHelpResponse(action: string, question: string): string {
    if (!model) return "Start small and build one step at a time.";

    const byAction: Record<string, string> = {
      "Simplify this step":
        "Break this into two mini tasks: first prepare parts, then join only one section and test before continuing.",
      "Safer method":
        "Use gloves, clamp parts before cutting, and test with low power first. If a wire looks damaged, replace it instead of reusing.",
      "Lower cost option":
        "Use scrap cardboard/plastic as base, borrow tools, and buy only small connectors or screws from local hardware shops.",
      "Explain tools needed":
        `You mainly need basic tools: ${model.steps[0]?.toolsNeeded || "screwdriver, pliers, tape"}. Start with hand tools before power tools.`,
      "Give alternative idea":
        `If this build feels hard, turn ${model.material} into a simpler utility project like a cable organizer or small desk stand.`,
    };

    if (byAction[action]) return byAction[action];

    if (question.toLowerCase().includes("safe")) {
      return "Good question. Keep power disconnected while assembling, and test slowly after checking all joints.";
    }
    if (question.toLowerCase().includes("budget")) {
      return "Try reusing home scrap first. Spend only on tiny missing parts to stay within budget.";
    }
    return "You’re on the right track. Start with one small step, test it, then move to the next step confidently.";
  }

  async function askAiHelp(action?: string) {
    if (!model) return;

    const selectedAction = action || "General help";
    const question = helpQuery.trim();

    setActiveHelpAction(selectedAction);
    setHelpLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 450));

    const answer = buildMockHelpResponse(selectedAction, question);
    setHelpAnswer(answer);
    setHelpLoading(false);
  }

  function goToHelpPanel() {
    helpPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    helpPanelRef.current?.focus();
  }

  function renderResourceGroup(title: string, resources: LearningResource[]) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground/65">
          {title}
        </p>
        {resources.length === 0 ? (
          <p className="mt-2 text-sm text-foreground/70">
            Resources will appear here once available.
          </p>
        ) : (
          <div className="mt-2 grid gap-2">
            {resources.map((resource) => (
              <div key={resource.title} className="rounded-xl bg-muted/60 p-4 ring-1 ring-border">
                <p className="text-sm font-semibold">{resource.title}</p>
                <p className="mt-1 text-sm text-foreground/75">{resource.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-foreground/70">
                  <span className="rounded-full bg-card px-2 py-1 ring-1 ring-border">
                    {resource.skillType}
                  </span>
                  <span>{resource.estimatedTime}</span>
                </div>
                <div className="mt-3">
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonStyles({ size: "sm", variant: "outline" })}
                  >
                    Open resource
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!hydrated) {
    return (
      <PageShell>
        <PageHeader
          title="Project Guide"
          description="Preparing your guided project steps..."
        />
        <StateCard
          className="mt-8"
          title="Loading project guide"
          description="Setting up your step-by-step build plan."
        />
      </PageShell>
    );
  }

  if (!state.analysis.latest || !model) {
    return (
      <PageShell>
        <PageHeader
          title="Project Guide"
          description="No analysis found yet. Run Analyze first to start a guided project."
          action={
            <Link href="/upload" className={buttonStyles({ variant: "outline" })}>
              Back to Analysis
            </Link>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Project Guide"
        description="A simple step-by-step guide to start your reuse project confidently."
      />

      <div className="mt-8 grid gap-4">
        <Card className="p-6">
          <p className="text-sm font-semibold">Project overview</p>
          <p className="mt-2 text-lg font-semibold">{model.projectTitle}</p>
          <div className="mt-4 rounded-xl bg-muted/50 p-4 ring-1 ring-border">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Project progress</p>
              <p className="text-sm text-foreground/75">
                {completedCount} of {totalSteps} steps completed
              </p>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-card ring-1 ring-border">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="mt-3 grid gap-2 text-sm text-foreground/80 sm:grid-cols-2">
            <p>
              <span className="font-semibold">Estimated time:</span> {model.totalTime}
            </p>
            <p>
              <span className="font-semibold">Approx budget:</span> {model.budget}
            </p>
            <p>
              <span className="font-semibold">Difficulty level:</span> {model.difficulty}
            </p>
            <p>
              <span className="font-semibold">Material identified:</span> {model.material}
            </p>
            <p>
              <span className="font-semibold">Reuse potential:</span> {model.reusePotential}
            </p>
          </div>
          <p className="mt-3 text-sm text-foreground/75">
            <span className="font-semibold">Quick summary:</span> {model.summary}
          </p>
          <p className="mt-2 text-sm text-foreground/75">
            <span className="font-semibold">Safety note:</span> {model.safety}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-semibold">Step-by-step making guide</p>
          {model.steps.length === 0 ? (
            <p className="mt-3 text-sm text-foreground/70">
              No custom steps available yet. Start with basic cleanup, sorting, assembly, and testing.
            </p>
          ) : (
            <div className="mt-4 grid gap-3">
              {model.steps.map((step) => (
              <div
                key={step.stepNumber}
                className={
                  stepStatuses[step.stepNumber] === "completed"
                    ? "rounded-xl bg-primary/5 p-4 ring-1 ring-primary/25"
                    : "rounded-xl bg-muted/60 p-4 ring-1 ring-border"
                }
              >
                <div className="flex items-start gap-3">
                  <div
                    className={
                      stepStatuses[step.stepNumber] === "completed"
                        ? "mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                        : "mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-card text-xs font-semibold ring-1 ring-border"
                    }
                  >
                    {stepStatuses[step.stepNumber] === "completed" ? "✓" : step.stepNumber}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{step.shortTitle}</p>
                      <span className="rounded-full bg-card px-2 py-1 text-[11px] font-semibold ring-1 ring-border">
                        {stepStatuses[step.stepNumber] === "completed"
                          ? "Completed"
                          : stepStatuses[step.stepNumber] === "in_progress"
                            ? "In progress"
                            : "Not started"}
                      </span>
                    </div>
                    {stepStatuses[step.stepNumber] === "completed" &&
                    !expandedCompleted[step.stepNumber] ? (
                      <button
                        className="mt-2 text-xs font-semibold text-foreground/70 underline-offset-2 hover:underline"
                        onClick={() => toggleCompletedDetail(step.stepNumber)}
                      >
                        Show step details
                      </button>
                    ) : (
                      <>
                        <p className="mt-1 text-sm text-foreground/75">{step.whatToDo}</p>
                        <div className="mt-3 grid gap-2 text-xs text-foreground/70 sm:grid-cols-2">
                          <p>
                            <span className="font-semibold text-foreground">Tools needed:</span>{" "}
                            {step.toolsNeeded}
                          </p>
                          <p>
                            <span className="font-semibold text-foreground">Estimated time:</span>{" "}
                            {step.estimatedTime}
                          </p>
                        </div>
                        <p className="mt-2 text-xs text-foreground/70">
                          <span className="font-semibold text-foreground">Tip:</span>{" "}
                          {step.cautionTip}
                        </p>
                        {stepStatuses[step.stepNumber] === "completed" ? (
                          <button
                            className="mt-2 text-xs font-semibold text-foreground/70 underline-offset-2 hover:underline"
                            onClick={() => toggleCompletedDetail(step.stepNumber)}
                          >
                            Hide details
                          </button>
                        ) : null}
                      </>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={
                          stepStatuses[step.stepNumber] === "not_started"
                            ? "secondary"
                            : "outline"
                        }
                        onClick={() => setStepStatus(step.stepNumber, "not_started")}
                      >
                        Not started
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          stepStatuses[step.stepNumber] === "in_progress"
                            ? "secondary"
                            : "outline"
                        }
                        onClick={() => setStepStatus(step.stepNumber, "in_progress")}
                      >
                        In progress
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          stepStatuses[step.stepNumber] === "completed"
                            ? "secondary"
                            : "outline"
                        }
                        onClick={() => setStepStatus(step.stepNumber, "completed")}
                      >
                        Completed
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <p className="text-sm font-semibold">Cost reduction tips</p>
            <div className="mt-3 grid gap-3">
              {model.costTips.map((tip) => (
                <div key={`${tip.label}-${tip.title}`} className="rounded-xl bg-muted/60 p-4 ring-1 ring-border">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{tip.title}</p>
                    <span className="rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold ring-1 ring-border">
                      {tip.label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-foreground/75">{tip.detail}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-semibold">Resources to learn</p>
            <div className="mt-3 grid gap-4">
              {renderResourceGroup("Basic concepts", model.resources.basicConcepts)}
              {renderResourceGroup("Practical making skills", model.resources.practicalSkills)}
              {renderResourceGroup("Safety and tool usage", model.resources.safetyAndTools)}
            </div>
          </Card>
        </div>

        <div ref={helpPanelRef} tabIndex={-1}>
          <Card className="p-6">
            <p className="text-sm font-semibold">AI Guided Help</p>
            <p className="mt-2 text-sm text-foreground/75">
              Stuck on a step? Use quick help options or ask your own question.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {HELP_ACTIONS.map((action) => (
                <button
                  key={action}
                  className={
                    activeHelpAction === action
                      ? buttonStyles({ size: "sm", variant: "secondary" })
                      : buttonStyles({ size: "sm", variant: "outline" })
                  }
                  onClick={() => {
                    setHelpQuery(action);
                    void askAiHelp(action);
                  }}
                >
                  {action}
                </button>
              ))}
            </div>

            <textarea
              value={helpQuery}
              onChange={(e) => setHelpQuery(e.target.value)}
              placeholder="Ask anything about this project..."
              className="mt-3 min-h-24 w-full rounded-xl bg-card p-3 text-sm ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="mt-3">
              <Button onClick={() => void askAiHelp()} disabled={helpLoading}>
                {helpLoading ? "Getting help..." : "Ask AI Help"}
              </Button>
            </div>
            {helpAnswer ? (
              <div className="mt-3 rounded-xl bg-muted/60 p-4 ring-1 ring-border">
                <p className="text-sm font-medium">AI suggestion</p>
                <p className="mt-1 text-sm text-foreground/75">{helpAnswer}</p>
              </div>
            ) : (
              <div className="mt-3 rounded-xl bg-muted/40 p-4 ring-1 ring-border">
                <p className="text-sm text-foreground/70">
                  Quick tip: start with the easiest step first, test early, and improve one part at a time.
                </p>
              </div>
            )}
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex flex-wrap gap-3">
            <Button onClick={saveProject}>Save Project</Button>
            <Button variant="outline" onClick={goToHelpPanel}>
              Ask AI Help
            </Button>
            <Link href="/upload" className={buttonStyles({ variant: "outline" })}>
              Back to Analysis
            </Link>
          </div>
          {saveNotice ? <p className="mt-3 text-sm text-foreground/75">{saveNotice}</p> : null}
        </Card>
      </div>
    </PageShell>
  );
}

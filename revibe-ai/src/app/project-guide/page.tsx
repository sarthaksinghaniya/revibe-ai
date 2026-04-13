"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button, buttonStyles } from "@/components/ui/Button";
import { StateCard } from "@/components/ui/StateCard";
import { analyzeItem } from "@/lib/api";
import { readLatestAnalysis } from "@/lib/analysisSession";

type StepItem = {
  stepNumber: number;
  shortTitle: string;
  whatToDo: string;
  toolsNeeded: string;
  estimatedTime: string;
  cautionTip: string;
  completed: boolean;
};

const SAVED_PROJECTS_KEY = "revibe.savedProjects";

function buildStepGuide(steps: string[], material: string): StepItem[] {
  const fallback: StepItem[] = [
    {
      stepNumber: 1,
      shortTitle: "Clean the material",
      whatToDo: `Wipe the ${material} and remove dust, rust, or loose plastic pieces before starting.`,
      toolsNeeded: "Dry cloth, brush, gloves",
      estimatedTime: "15-20 min",
      cautionTip: "Wear gloves if edges are sharp.",
      completed: false,
    },
    {
      stepNumber: 2,
      shortTitle: "Separate reusable parts",
      whatToDo:
        "Split the material into useful parts and discard clearly damaged pieces safely.",
      toolsNeeded: "Small screwdriver, pliers, containers",
      estimatedTime: "20-30 min",
      cautionTip: "Keep screws and tiny parts in one labeled box.",
      completed: false,
    },
    {
      stepNumber: 3,
      shortTitle: "Mark and assemble",
      whatToDo:
        "Mark cut/drill points, then assemble the basic project structure in small stages.",
      toolsNeeded: "Marker, ruler, cutter/drill, tape",
      estimatedTime: "30-45 min",
      cautionTip: "Measure twice before cutting to avoid waste.",
      completed: false,
    },
    {
      stepNumber: 4,
      shortTitle: "Finish and test",
      whatToDo:
        "Secure loose parts, test basic function, and make one small improvement for durability.",
      toolsNeeded: "Glue, zip ties, sandpaper (optional)",
      estimatedTime: "20-30 min",
      cautionTip: "Test gently first, then do a full test.",
      completed: false,
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

export default function ProjectGuidePage() {
  const [loading, setLoading] = useState(true);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [helpQuery, setHelpQuery] = useState("");
  const [helpAnswer, setHelpAnswer] = useState<string | null>(null);
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpError, setHelpError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [analysis, setAnalysis] = useState<ReturnType<typeof readLatestAnalysis>>(null);
  const helpPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const latest = readLatestAnalysis();
    setAnalysis(latest);
    setHasData(Boolean(latest));
    setLoading(false);
  }, []);

  const model = useMemo(() => {
    if (!analysis) return null;
    const material = analysis.result.material || analysis.itemName;
    const steps = buildStepGuide(analysis.result.steps ?? [], material);
    const mainIdea = analysis.result.ideas?.[0];
    return {
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
    };
  }, [analysis]);

  function saveProject() {
    if (!model) return;
    const raw =
      typeof window !== "undefined"
        ? window.localStorage.getItem(SAVED_PROJECTS_KEY)
        : null;
    const existing = raw ? (JSON.parse(raw) as unknown[]) : [];
    const next = [
      {
        title: model.projectTitle,
        material: model.material,
        savedAt: new Date().toISOString(),
      },
      ...existing,
    ];
    window.localStorage.setItem(SAVED_PROJECTS_KEY, JSON.stringify(next.slice(0, 20)));
    setSaveNotice("Project saved. You can continue from here anytime.");
  }

  async function askAiHelp() {
    if (!analysis || !model) return;
    setHelpError(null);
    setHelpLoading(true);
    try {
      const question = helpQuery.trim() || "Give me beginner tips for the next build step.";
      const response = await analyzeItem({
        itemName: analysis.itemName,
        notes: `Project guide help request. Material: ${model.material}. Question: ${question}`,
      });
      const answer =
        response.data.ideas?.[0]?.description ||
        response.data.steps?.[0] ||
        "Start with a small test build, then improve one part at a time.";
      setHelpAnswer(answer);
    } catch (error) {
      setHelpError(
        error instanceof Error
          ? error.message
          : "Could not get AI help right now. Please try again.",
      );
    } finally {
      setHelpLoading(false);
    }
  }

  function goToHelpPanel() {
    helpPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    helpPanelRef.current?.focus();
  }

  if (loading) {
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

  if (!hasData || !model) {
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
          <div className="mt-4 grid gap-3">
            {model.steps.map((step) => (
              <div
                key={step.stepNumber}
                className="rounded-xl bg-muted/60 p-4 ring-1 ring-border"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={
                      step.completed
                        ? "mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                        : "mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-card text-xs font-semibold ring-1 ring-border"
                    }
                  >
                    {step.stepNumber}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{step.shortTitle}</p>
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <p className="text-sm font-semibold">Cost reduction tips</p>
            <ul className="mt-3 grid gap-2 text-sm text-foreground/75">
              <li>Use parts you already have before buying anything new.</li>
              <li>Buy missing parts from local repair markets for lower cost.</li>
              <li>Test parts first to avoid spending on unnecessary replacements.</li>
            </ul>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-semibold">Resources to learn</p>
            <ul className="mt-3 grid gap-2 text-sm text-foreground/75">
              <li>Search beginner upcycling videos for your exact material type.</li>
              <li>Read one short safety checklist before using tools.</li>
              <li>Check local maker groups for low-cost tool sharing.</li>
            </ul>
          </Card>
        </div>

        <div ref={helpPanelRef} tabIndex={-1}>
          <Card className="p-6">
          <p className="text-sm font-semibold">AI guidance help panel</p>
          <p className="mt-2 text-sm text-foreground/75">
            Ask for help in simple words. Example: &quot;What should I do first?&quot;
          </p>
          <textarea
            value={helpQuery}
            onChange={(e) => setHelpQuery(e.target.value)}
            placeholder="Ask AI for help with your next step..."
            className="mt-3 min-h-24 w-full rounded-xl bg-card p-3 text-sm ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="mt-3">
            <Button onClick={askAiHelp} disabled={helpLoading}>
              {helpLoading ? "Getting help..." : "Ask AI Help"}
            </Button>
          </div>
          {helpError ? (
            <p className="mt-3 text-sm text-rose-700" role="alert">
              {helpError}
            </p>
          ) : null}
          {helpAnswer ? (
            <div className="mt-3 rounded-xl bg-muted/60 p-4 ring-1 ring-border">
              <p className="text-sm font-medium">AI suggestion</p>
              <p className="mt-1 text-sm text-foreground/75">{helpAnswer}</p>
            </div>
          ) : null}
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

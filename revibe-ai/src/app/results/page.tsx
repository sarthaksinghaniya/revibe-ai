import Link from "next/link";

import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button, buttonStyles } from "@/components/ui/Button";
import { RiskBadge, StatusBadge } from "@/components/ui/StatusBadge";
import { Icon } from "@/components/ui/Icon";
import { IdeaCard } from "@/components/cards/IdeaCard";
import { mockAnalysis } from "@/data/mockAnalysis";

export default function ResultsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Analysis result"
        description="Showing mock detected material, confidence, risk level, and reuse ideas. Real AI integration comes later."
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
              <p className="text-sm font-semibold">{mockAnalysis.itemName}</p>
              <p className="mt-2 text-sm leading-6 text-foreground/70">
                <span className="font-medium text-foreground">Detected:</span>{" "}
                {mockAnalysis.detectedMaterial}
              </p>
            </div>
            <div className="h-10 w-10 shrink-0 rounded-2xl bg-primary/10 ring-1 ring-border grid place-items-center text-primary">
              <Icon name="shield" />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <StatusBadge label={`Confidence: ${mockAnalysis.confidencePct}%`} />
            <RiskBadge risk={mockAnalysis.riskLevel} />
          </div>

          <div className="mt-5 rounded-2xl bg-muted/60 p-4 ring-1 ring-border">
            <p className="text-sm font-medium">Safety note</p>
            <p className="mt-1 text-sm leading-6 text-foreground/70">
              {mockAnalysis.riskNote}
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
            <span className="text-xs text-foreground/60">Mock ideas</span>
          </div>
          <div className="grid gap-4">
            {mockAnalysis.ideas.map((idea) => (
              <IdeaCard key={idea.title} idea={idea} />
            ))}
          </div>
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

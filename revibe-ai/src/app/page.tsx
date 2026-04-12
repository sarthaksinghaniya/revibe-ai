"use client";

import { useEffect } from "react";
import Link from "next/link";

import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { buttonStyles } from "@/components/ui/Button";
import { FeatureCard } from "@/components/cards/FeatureCard";
import { featureQuickCards } from "@/data/mockFeatures";
import { getHealth } from "@/lib/api";

export default function Home() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const checkHealth = async () => {
      try {
        const health = await getHealth();
        console.log("[health-check] GET /api/health success:", health);
      } catch (error) {
        console.error("[health-check] GET /api/health failed:", error);
      }
    };

    void checkHealth();
  }, []);

  return (
    <PageShell>
      <section className="grid gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <p className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground/70 ring-1 ring-border">
            Eco-tech · Beginner-friendly · Step-by-step
          </p>
          <h1 className="mt-5 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">
            Turn e-waste into practical projects—guided by AI.
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-base leading-7 text-foreground/70 sm:text-lg">
            Upload a device photo or details, get reuse ideas, and follow a clear
            build plan. Share progress with the community when you’re ready.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/upload" className={buttonStyles({ size: "lg" })}>
              Upload e-waste
            </Link>
            <Link
              href="/community"
              className={buttonStyles({ size: "lg", variant: "outline" })}
            >
              Browse community
            </Link>
          </div>
          <p className="mt-3 text-sm text-foreground/60">
            Live flow: upload → AI results → community.
          </p>
        </div>

        <div className="lg:col-span-5">
          <Card className="p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Your clean workflow</h2>
                <p className="mt-1 text-sm leading-6 text-foreground/70">
                  Upload → recommendations → guided steps.
                </p>
              </div>
              <div className="h-10 w-10 shrink-0 rounded-2xl bg-primary/10 ring-1 ring-border grid place-items-center">
                <span className="text-primary font-semibold">AI</span>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="rounded-xl bg-muted p-4 ring-1 ring-border">
                <p className="text-sm font-medium">Light, premium UI</p>
                <p className="mt-1 text-sm text-foreground/70">
                  White cards, teal accents, and calm spacing.
                </p>
              </div>
              <div className="rounded-xl bg-muted p-4 ring-1 ring-border">
                <p className="text-sm font-medium">Mock data now</p>
                <p className="mt-1 text-sm text-foreground/70">
                  Screens are real, data is static—perfect for UX iteration.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-3">
        {featureQuickCards.map((f) => (
          <FeatureCard
            key={f.title}
            title={f.title}
            description={f.description}
            href={f.href}
            icon={f.icon}
          />
        ))}
      </section>
    </PageShell>
  );
}

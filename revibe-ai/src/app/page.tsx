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
      <div className="space-y-12 sm:space-y-16">
        <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-card via-card to-muted/45 p-6 shadow-[var(--shadow-soft)] sm:p-8 lg:p-10">
          <div
            className="pointer-events-none absolute -top-20 -left-20 h-56 w-56 rounded-full bg-primary/8 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-12 -bottom-16 h-52 w-52 rounded-full bg-accent/8 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="inline-flex items-center rounded-xl bg-muted px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">
                Eco-tech · Beginner-friendly · Step-by-step
              </p>
              <h1 className="mt-5 max-w-2xl text-pretty text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Turn e-waste into practical projects—guided by AI.
              </h1>
              <p className="mt-4 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
                Upload a device photo or details, get reuse ideas, and follow a clear
                build plan. Share progress with the community when you’re ready.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/upload" className={buttonStyles({ size: "lg" })}>
                  Upload e-waste
                </Link>
                <Link
                  href="/community"
                  className={buttonStyles({
                    size: "lg",
                    variant: "outline",
                    className: "bg-card/90 text-foreground/85 hover:bg-muted/80",
                  })}
                >
                  Browse community
                </Link>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Live flow: upload → AI results → community.
              </p>
            </div>

            <div className="lg:col-span-5">
              <Card className="rounded-3xl border border-border/90 bg-card p-6 shadow-[var(--shadow-soft)] sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Your clean workflow</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Upload → recommendations → guided steps.
                    </p>
                  </div>
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/25">
                    <span className="font-semibold text-primary">AI</span>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <div className="rounded-2xl bg-muted/85 p-4 ring-1 ring-border">
                    <p className="text-sm font-medium text-foreground">Light, premium UI</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      White cards, teal accents, and calm spacing.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-muted/85 p-4 ring-1 ring-border">
                    <p className="text-sm font-medium text-foreground">Mock data now</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Screens are real, data is static—perfect for UX iteration.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-3">
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
      </div>
    </PageShell>
  );
}

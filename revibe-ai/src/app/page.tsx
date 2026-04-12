import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-16">
        <section className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground/70 ring-1 ring-border">
              Eco-tech · Beginner-friendly · Step-by-step
            </p>
            <h1 className="mt-5 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">
              Turn e-waste into practical projects—guided by AI.
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-base leading-7 text-foreground/70 sm:text-lg">
              Upload a device photo or details, get upcycling ideas, and follow a
              clear build plan. Share progress with the community when you’re
              ready.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" disabled>
                Start with Upload (next)
              </Button>
              <Button size="lg" variant="outline" disabled>
                Explore Community (later)
              </Button>
            </div>
            <p className="mt-3 text-sm text-foreground/60">
              You’re in Step 1: UI foundation. Upload/AI comes next.
            </p>
          </div>

          <div className="lg:col-span-5">
            <Card className="p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">What Revibe does</h2>
                  <p className="mt-1 text-sm leading-6 text-foreground/70">
                    A clean flow from{" "}
                    <span className="font-medium text-foreground">upload</span>{" "}
                    →{" "}
                    <span className="font-medium text-foreground">
                      recommendations
                    </span>{" "}
                    →{" "}
                    <span className="font-medium text-foreground">
                      guided steps
                    </span>
                    .
                  </p>
                </div>
                <div className="h-10 w-10 shrink-0 rounded-2xl bg-primary/10 ring-1 ring-border grid place-items-center">
                  <span className="text-primary font-semibold">AI</span>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="rounded-xl bg-muted p-4 ring-1 ring-border">
                  <p className="text-sm font-medium">Premium, light UI</p>
                  <p className="mt-1 text-sm text-foreground/70">
                    White cards, teal accents, smooth interactions.
                  </p>
                </div>
                <div className="rounded-xl bg-muted p-4 ring-1 ring-border">
                  <p className="text-sm font-medium">No complexity (yet)</p>
                  <p className="mt-1 text-sm text-foreground/70">
                    No auth, no database—just clean foundations.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-3">
          <Card className="p-6">
            <p className="text-sm font-semibold">1) Upload</p>
            <p className="mt-2 text-sm text-foreground/70">
              Add a photo or device details.
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-semibold">2) Get ideas</p>
            <p className="mt-2 text-sm text-foreground/70">
              Safe, practical reuse options.
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-semibold">3) Build</p>
            <p className="mt-2 text-sm text-foreground/70">
              Step-by-step guidance and progress.
            </p>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

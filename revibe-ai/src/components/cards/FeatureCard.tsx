import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export function FeatureCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: Parameters<typeof Icon>[0]["name"];
}) {
  return (
    <Link href={href} className="group block h-full">
      <Card className="h-full rounded-3xl border border-border/90 bg-card p-6 shadow-[var(--shadow-soft)] transition-all duration-200 ease-[var(--ease-out-quint)] will-change-transform group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-soft)] group-hover:ring-primary/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
          <div
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/12 ring-1 ring-primary/25",
              "text-primary transition-colors duration-200 group-hover:bg-muted",
            )}
            aria-hidden="true"
          >
            <Icon name={icon} />
          </div>
        </div>
      </Card>
    </Link>
  );
}

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
    <Link href={href} className="group block">
      <Card className="p-6 transition-transform duration-200 ease-out will-change-transform group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-soft)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-2 text-sm leading-6 text-foreground/70">
              {description}
            </p>
          </div>
          <div
            className={cn(
              "h-10 w-10 shrink-0 rounded-2xl bg-primary/10 ring-1 ring-border grid place-items-center",
              "text-primary",
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

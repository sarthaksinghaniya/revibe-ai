"use client";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { MapResource } from "@/data/mockResources";

type ResourceListProps = {
  resources: MapResource[];
  activeResourceId: string | null;
  onSelectResource: (resourceId: string) => void;
};

export function ResourceList({
  resources,
  activeResourceId,
  onSelectResource,
}: ResourceListProps) {
  return (
    <div className="grid gap-3">
      {resources.map((resource) => {
        const isActive = activeResourceId === resource.id;

        return (
          <button
            key={resource.id}
            type="button"
            onClick={() => onSelectResource(resource.id)}
            className="text-left"
          >
            <Card
              className={cn(
                "rounded-2xl p-4 transition-colors",
                "ring-1 ring-border hover:bg-muted/50",
                isActive ? "bg-primary/5 ring-primary/30" : ""
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{resource.name}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-foreground/60">
                    {resource.type}
                  </p>
                </div>
                <span className="text-xs text-foreground/60">
                  {resource.distanceLabel ?? "Nearby"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-foreground/70">
                {resource.description}
              </p>
            </Card>
          </button>
        );
      })}
    </div>
  );
}

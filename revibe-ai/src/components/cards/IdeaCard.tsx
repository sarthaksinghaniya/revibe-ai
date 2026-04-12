import { Card } from "@/components/ui/Card";
import type { ReuseIdea } from "@/data/mockAnalysis";
import { StatusBadge } from "@/components/ui/StatusBadge";

function difficultyVariant(difficulty: ReuseIdea["difficulty"]) {
  if (difficulty === "Easy") return "low" as const;
  if (difficulty === "Medium") return "medium" as const;
  return "high" as const;
}

export function IdeaCard({ idea }: { idea: ReuseIdea }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{idea.title}</p>
          <p className="mt-2 text-sm leading-6 text-foreground/70">{idea.summary}</p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <StatusBadge label={idea.difficulty} variant={difficultyVariant(idea.difficulty)} />
          <span className="text-xs text-foreground/60">{idea.time}</span>
        </div>
      </div>
    </Card>
  );
}

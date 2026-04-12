import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type StateTone = "neutral" | "error";

const toneStyles: Record<StateTone, string> = {
  neutral: "text-foreground/75",
  error: "text-rose-700",
};

export function StateCard({
  title,
  description,
  tone = "neutral",
  className,
}: {
  title: string;
  description: string;
  tone?: StateTone;
  className?: string;
}) {
  return (
    <Card className={cn("p-6", className)}>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className={cn("mt-2 text-sm leading-6", toneStyles[tone])}>{description}</p>
    </Card>
  );
}

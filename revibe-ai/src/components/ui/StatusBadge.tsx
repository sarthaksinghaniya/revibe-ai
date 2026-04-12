import { cn } from "@/lib/cn";
import type { RiskLevel } from "@/data/mockAnalysis";

type Variant = "neutral" | "low" | "medium" | "high";

const variants: Record<Variant, string> = {
  neutral: "bg-muted text-muted-foreground ring-border",
  low: "bg-green-50 text-green-800 ring-green-200",
  medium: "bg-amber-50 text-amber-800 ring-amber-200",
  high: "bg-rose-50 text-rose-900 ring-rose-200",
};

function riskToVariant(risk: RiskLevel): Variant {
  if (risk === "Low") return "low";
  if (risk === "Medium") return "medium";
  return "high";
}

export function StatusBadge({
  label,
  variant = "neutral",
}: {
  label: string;
  variant?: Variant;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1",
        variants[variant],
      )}
    >
      {label}
    </span>
  );
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return <StatusBadge label={`Risk: ${risk}`} variant={riskToVariant(risk)} />;
}

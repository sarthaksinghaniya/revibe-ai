import { cn } from "@/lib/cn";
import type { RiskLevel } from "@/data/mockAnalysis";

type Variant = "neutral" | "low" | "medium" | "high";

const variants: Record<Variant, string> = {
  neutral: "bg-muted text-slate-600 ring-border",
  low: "bg-primary/12 text-primary ring-primary/25",
  medium: "bg-teal-50 text-teal-700 ring-teal-200",
  high: "bg-rose-50 text-rose-800 ring-rose-200",
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
        "inline-flex items-center rounded-xl px-3 py-1 text-xs font-medium ring-1 transition-colors duration-200",
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

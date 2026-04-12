import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card ring-1 ring-border shadow-[var(--shadow-soft)] transition-[box-shadow,transform,background-color] duration-200 ease-[var(--ease-out-quint)]",
        className,
      )}
      {...props}
    />
  );
}

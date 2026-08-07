import { cn } from "@/lib/utils";
import type { ApprovalStatus, RiskLevel } from "@/lib/mock/types";

const base =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap";

export function StatusBadge({ status, className }: { status: ApprovalStatus; className?: string }) {
  const tone =
    status === "Approved"
      ? "border-success/30 bg-success/12 text-success"
      : status === "Rejected"
        ? "border-destructive/30 bg-destructive/12 text-destructive"
        : "border-warning/40 bg-warning/15 text-warning";
  return (
    <span className={cn(base, tone, className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  const tone =
    level === "Low"
      ? "border-success/30 bg-success/12 text-success"
      : level === "Medium"
        ? "border-warning/40 bg-warning/15 text-warning"
        : "border-destructive/30 bg-destructive/12 text-destructive";
  return <span className={cn(base, tone, className)}>{level} Risk</span>;
}

export function ScoreChip({ value, invert = false }: { value: number; invert?: boolean }) {
  const good = invert ? value < 35 : value > 700;
  const mid = invert ? value < 60 : value > 620;
  const tone = good ? "text-success" : mid ? "text-warning" : "text-destructive";
  return <span className={cn("font-semibold tabular-nums", tone)}>{value}</span>;
}
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  index = 0,
}: {
  label: string;
  value: string | number;
  hint?: string | undefined;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "destructive" | "info" | undefined;
  index?: number | undefined;
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary/12 text-primary",
    success: "bg-success/12 text-success",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/12 text-destructive",
    info: "bg-info/12 text-info",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card card-hover relative overflow-hidden p-5"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
          <p className="font-display mt-2 truncate text-2xl font-bold tabular-nums">{value}</p>
          {hint ? <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tones[tone])}>
          <Icon className="size-5" />
        </span>
      </div>
      <span className="absolute inset-x-0 bottom-0 h-0.5 gradient-brand opacity-60" />
    </motion.div>
  );
}
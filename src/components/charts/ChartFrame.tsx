import type { ReactElement, ReactNode } from "react";
import { ResponsiveContainer } from "recharts";
import { SectionCard } from "@/components/common/GlassCard";

export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary-glow)",
];

export const tooltipStyle = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "0.75rem",
    color: "var(--popover-foreground)",
    fontSize: 12,
    boxShadow: "var(--shadow-soft)",
  },
  labelStyle: { color: "var(--muted-foreground)", fontSize: 11 },
  itemStyle: { color: "var(--popover-foreground)" },
};

export const axisProps = {
  stroke: "var(--muted-foreground)",
  tick: { fill: "var(--muted-foreground)", fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;

export function ChartFrame({
  title,
  description,
  height = 260,
  action,
  className,
  children,
}: {
  title: string;
  description?: string | undefined;
  height?: number | undefined;
  action?: ReactNode | undefined;
  className?: string | undefined;
  children: ReactElement;
}) {
  return (
    <SectionCard title={title} description={description} action={action} className={className}>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
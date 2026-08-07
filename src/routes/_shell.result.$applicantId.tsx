import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from "recharts";
import { mockApi } from "@/lib/mock/api";
import { inr } from "@/lib/format";
import { PageHeader } from "@/components/common/PageHeader";
import { GlassCard, SectionCard } from "@/components/common/GlassCard";
import { ScoreRing } from "@/components/common/ScoreRing";
import { RiskBadge, StatusBadge } from "@/components/common/StatusBadge";
import { ChartFrame, axisProps, tooltipStyle } from "@/components/charts/ChartFrame";
import { TableSkeleton } from "@/components/common/Loading";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_shell/result/$applicantId")({
  head: () => ({
    meta: [
      { title: "Underwriting Decision — AI Loan Underwriting" },
      { name: "description", content: "AI decision outcome with risk score, contributing factors and underwriter recommendation." },
      { property: "og:title", content: "Underwriting Decision — AI Loan Underwriting" },
      { property: "og:description", content: "AI decision outcome with risk score, contributing factors and underwriter recommendation." },
    ],
  }),
  component: ResultPage,
});

function ResultPage() {
  const { applicantId } = Route.useParams();
  const { data: a, isLoading } = useQuery({
    queryKey: ["applicant", applicantId],
    queryFn: () => mockApi.getApplicant(applicantId),
  });

  if (isLoading) return <TableSkeleton rows={6} />;
  if (!a)
    return (
      <GlassCard className="p-8 text-center">
        <p className="font-display text-lg font-semibold">Decision not found</p>
        <Button asChild className="mt-4 rounded-xl"><Link to="/applicants">Back to applicants</Link></Button>
      </GlassCard>
    );

  return (
    <>
      <PageHeader
        title="Application Result"
        subtitle={`${a.fullName} · ${a.loanId}`}
        actions={
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/applicants/$applicantId" params={{ applicantId: a.id }}>Full profile</Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="flex items-center justify-center">
          <ScoreRing value={a.riskScore} caption={a.riskLevel + " risk band"} />
        </GlassCard>

        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={a.approvalStatus} />
            <RiskBadge level={a.riskLevel} />
          </div>
          <div>
            <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Decision Rationale</p>
            <p className="mt-1 text-sm">{a.reason}</p>
          </div>
          <div>
            <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Recommendation</p>
            <p className="mt-1 text-sm">{a.recommendation}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ["Credit Score", a.creditScore],
              ["Fraud Score", a.fraudScore],
              ["DTI Ratio", `${a.debtToIncome}%`],
              ["Loan Amount", inr(a.loanAmount)],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-xl border border-border/70 bg-card/60 p-3">
                <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{k}</p>
                <p className="font-display mt-1 truncate text-lg font-bold tabular-nums">{v}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <ChartFrame title="Decision Factor Contributions" description="Positive drivers vs. detractors (model attribution)">
        <BarChart data={a.factors} layout="vertical" margin={{ left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" {...axisProps} />
          <YAxis type="category" dataKey="factor" width={140} {...axisProps} />
          <Tooltip {...tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.35 }} />
          <Bar dataKey="impact" radius={[0, 8, 8, 0]}>
            {a.factors.map((f) => (
              <Cell key={f.factor} fill={f.impact >= 0 ? "var(--success)" : "var(--destructive)"} />
            ))}
          </Bar>
        </BarChart>
      </ChartFrame>

      <SectionCard title="Factor Detail" description="Plain-language explanation of each contribution">
        <div className="grid gap-3 sm:grid-cols-2">
          {a.factors.map((f) => (
            <div key={f.factor} className="rounded-xl border border-border/70 bg-card/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{f.factor}</p>
                <span className={f.impact >= 0 ? "text-xs font-bold text-success" : "text-xs font-bold text-destructive"}>
                  {f.impact >= 0 ? "+" : ""}{f.impact}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{f.detail}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
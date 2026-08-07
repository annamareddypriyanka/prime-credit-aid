import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BrainCircuit } from "lucide-react";
import { mockApi } from "@/lib/mock/api";
import { PageHeader } from "@/components/common/PageHeader";
import { GlassCard, SectionCard } from "@/components/common/GlassCard";
import { ScoreRing } from "@/components/common/ScoreRing";
import { RiskBadge, StatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_shell/ai-decision")({
  head: () => ({
    meta: [
      { title: "AI Explanation — AI Loan Underwriting" },
      { name: "description", content: "Explainable AI view showing how each factor shifted the underwriting decision for a chosen applicant." },
      { property: "og:title", content: "AI Explanation — AI Loan Underwriting" },
      { property: "og:description", content: "Explainable AI view showing how each factor shifted the underwriting decision for a chosen applicant." },
    ],
  }),
  component: AiDecisionPage,
});

function AiDecisionPage() {
  const { data, isLoading } = useQuery({ queryKey: ["recent", 40], queryFn: () => mockApi.getRecent(40) });
  const [selected, setSelected] = useState<string | null>(null);
  const rows = data ?? [];
  const a = rows.find((r) => r.id === selected) ?? rows[0];

  if (isLoading || !a) return <TableSkeleton rows={6} />;

  const max = Math.max(...a.factors.map((f) => Math.abs(f.impact)), 1);

  return (
    <>
      <PageHeader
        title="AI Explanation"
        subtitle="Transparent, factor-level reasoning behind every automated decision."
        actions={
          <Select value={a.id} onValueChange={setSelected}>
            <SelectTrigger className="w-[240px] rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              {rows.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.fullName} · {r.loanId}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="flex items-center justify-center">
          <ScoreRing value={a.riskScore} caption={`Credit ${a.creditScore} · Fraud ${a.fraudScore}`} />
        </GlassCard>
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/12 text-primary"><BrainCircuit className="size-5" /></span>
            <div className="min-w-0">
              <p className="font-display truncate font-semibold">{a.fullName}</p>
              <p className="text-xs text-muted-foreground">{a.loanType} loan · {a.loanId}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={a.approvalStatus} />
            <RiskBadge level={a.riskLevel} />
          </div>
          <p className="text-sm">{a.reason}</p>
          <p className="text-sm text-muted-foreground">{a.recommendation}</p>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/result/$applicantId" params={{ applicantId: a.id }}>Open decision report</Link>
          </Button>
        </GlassCard>
      </div>

      <SectionCard title="Factor Attribution" description="How far each signal moved the decision">
        <div className="space-y-4">
          {a.factors.map((f) => (
            <div key={f.factor} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 truncate font-medium">{f.factor}</span>
                <span className={f.impact >= 0 ? "font-bold text-success" : "font-bold text-destructive"}>
                  {f.impact >= 0 ? "+" : ""}{f.impact}
                </span>
              </div>
              <Progress value={(Math.abs(f.impact) / max) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">{f.detail}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
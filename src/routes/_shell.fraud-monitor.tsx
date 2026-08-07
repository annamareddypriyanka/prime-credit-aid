import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Fingerprint, Globe, Copy } from "lucide-react";
import { mockApi } from "@/lib/mock/api";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/GlassCard";
import { KpiCard } from "@/components/common/KpiCard";
import { TableSkeleton } from "@/components/common/Loading";
import { RiskBadge, StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_shell/fraud-monitor")({
  head: () => ({
    meta: [
      { title: "Fraud Monitor — AI Loan Underwriting" },
      { name: "description", content: "Live fraud watchlist with device, IP, duplicate and behavioural anomaly signals ranked by severity." },
      { property: "og:title", content: "Fraud Monitor — AI Loan Underwriting" },
      { property: "og:description", content: "Live fraud watchlist with device, IP, duplicate and behavioural anomaly signals ranked by severity." },
    ],
  }),
  component: FraudPage,
});

function FraudPage() {
  const { data, isLoading } = useQuery({ queryKey: ["fraud"], queryFn: () => mockApi.getFraudCases() });
  const rows = data ?? [];

  return (
    <>
      <PageHeader title="Fraud Monitor" subtitle="Applications carrying elevated fraud telemetry, ranked by composite score." />
      {isLoading ? (
        <TableSkeleton rows={10} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard index={0} label="Flagged Cases" value={rows.length} hint="Above alert threshold" icon={AlertTriangle} tone="destructive" />
            <KpiCard index={1} label="Device Changes" value={rows.filter((a) => a.fraudIndicators.deviceChanged).length} hint="New fingerprint detected" icon={Fingerprint} tone="warning" />
            <KpiCard index={2} label="IP Mismatches" value={rows.filter((a) => !a.fraudIndicators.ipLocationMatch).length} hint="Geo inconsistency" icon={Globe} tone="warning" />
            <KpiCard index={3} label="Duplicate Filings" value={rows.filter((a) => a.fraudIndicators.duplicateApplication).length} hint="Repeat identity match" icon={Copy} tone="destructive" />
          </div>

          <SectionCard title="Fraud Watchlist" description="Highest composite fraud scores first">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Applicant</TableHead>
                    <TableHead>Loan ID</TableHead>
                    <TableHead className="text-right">Fraud Score</TableHead>
                    <TableHead>Signals</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 30).map((a) => {
                    const signals = [
                      a.fraudIndicators.deviceChanged && "Device",
                      !a.fraudIndicators.ipLocationMatch && "IP",
                      a.fraudIndicators.duplicateApplication && "Duplicate",
                      a.fraudIndicators.suspiciousActivity && "Behaviour",
                    ].filter(Boolean) as string[];
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium whitespace-nowrap">{a.fullName}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{a.loanId}</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums text-destructive">{a.fraudScore}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {signals.length ? (
                              signals.map((s) => (
                                <span key={s} className="rounded-full border border-warning/40 bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning">
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">Score only</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell><RiskBadge level={a.riskLevel} /></TableCell>
                        <TableCell><StatusBadge status={a.approvalStatus} /></TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline" className="rounded-lg">
                            <Link to="/applicants/$applicantId" params={{ applicantId: a.id }}>Investigate</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </>
      )}
    </>
  );
}
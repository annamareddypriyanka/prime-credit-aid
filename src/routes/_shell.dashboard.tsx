import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Users,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Gauge,
  ShieldAlert,
  Wallet,
  Banknote,
  ArrowUpRight,
} from "lucide-react";
import { mockApi } from "@/lib/mock/api";
import { compactInr, inr } from "@/lib/format";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { KpiSkeletonGrid, ChartSkeleton, TableSkeleton } from "@/components/common/Loading";
import { ChartFrame, CHART_COLORS, axisProps, tooltipStyle } from "@/components/charts/ChartFrame";
import { RiskBadge, StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SectionCard } from "@/components/common/GlassCard";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Portfolio Dashboard — AI Loan Underwriting" },
      { name: "description", content: "Live KPIs, approval distribution, credit score and fraud analytics across the lending portfolio." },
      { property: "og:title", content: "Portfolio Dashboard — AI Loan Underwriting" },
      { property: "og:description", content: "Live KPIs, approval distribution, credit score and fraud analytics across the lending portfolio." },
    ],
  }),
  component: DashboardPage,
});

function bucket(values: number[], size: number, min: number, max: number, prefix = "") {
  const buckets: { label: string; count: number }[] = [];
  for (let s = min; s < max; s += size) {
    buckets.push({ label: `${prefix}${s}-${s + size}`, count: 0 });
  }
  values.forEach((v) => {
    const i = Math.min(buckets.length - 1, Math.max(0, Math.floor((v - min) / size)));
    buckets[i]!.count += 1;
  });
  return buckets;
}

function DashboardPage() {
  const stats = useQuery({ queryKey: ["stats"], queryFn: () => mockApi.getStats() });
  const all = useQuery({ queryKey: ["applicants", "all"], queryFn: () => mockApi.listApplicants() });
  const recent = useQuery({ queryKey: ["recent"], queryFn: () => mockApi.getRecent(8) });

  const rows = all.data ?? [];

  const approvalData = [
    { name: "Approved", value: rows.filter((a) => a.approvalStatus === "Approved").length },
    { name: "Manual Review", value: rows.filter((a) => a.approvalStatus === "Manual Review").length },
    { name: "Rejected", value: rows.filter((a) => a.approvalStatus === "Rejected").length },
  ];
  const riskData = (["Low", "Medium", "High"] as const).map((l) => ({
    name: l,
    value: rows.filter((a) => a.riskLevel === l).length,
  }));
  const creditHist = bucket(rows.map((a) => a.creditScore), 50, 500, 900);
  const incomeHist = bucket(rows.map((a) => Math.round(a.monthlyIncome / 1000)), 40, 0, 360, "₹").map((b) => ({
    ...b,
    label: `${b.label}K`,
  }));
  const loanTypeData = Object.entries(
    rows.reduce<Record<string, number>>((acc, a) => ({ ...acc, [a.loanType]: (acc[a.loanType] ?? 0) + 1 }), {}),
  ).map(([name, value]) => ({ name, value }));
  const fraudHist = bucket(rows.map((a) => a.fraudScore), 10, 0, 100);

  const statusColor: Record<string, string> = {
    Approved: "var(--success)",
    "Manual Review": "var(--warning)",
    Rejected: "var(--destructive)",
    Low: "var(--success)",
    Medium: "var(--warning)",
    High: "var(--destructive)",
  };

  return (
    <>
      <PageHeader
        title="Portfolio Dashboard"
        subtitle="Real-time view of underwriting throughput, credit quality and fraud exposure."
        actions={
          <Button asChild className="rounded-xl gradient-brand text-primary-foreground shadow-soft">
            <Link to="/new-application">New Application</Link>
          </Button>
        }
      />

      {stats.isLoading || !stats.data ? (
        <KpiSkeletonGrid />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard index={0} label="Total Applicants" value={stats.data.total} hint="Across all channels" icon={Users} />
          <KpiCard index={1} label="Approved Loans" value={stats.data.approved} hint={`${Math.round((stats.data.approved / stats.data.total) * 100)}% approval rate`} icon={CheckCircle2} tone="success" />
          <KpiCard index={2} label="Rejected Loans" value={stats.data.rejected} hint="Policy or fraud declines" icon={XCircle} tone="destructive" />
          <KpiCard index={3} label="Manual Review" value={stats.data.review} hint="Awaiting underwriter" icon={ClipboardList} tone="warning" />
          <KpiCard index={4} label="Avg Credit Score" value={stats.data.avgCreditScore} hint="Bureau weighted" icon={Gauge} tone="info" />
          <KpiCard index={5} label="Avg Fraud Score" value={stats.data.avgFraudScore} hint="Lower is safer" icon={ShieldAlert} tone="destructive" />
          <KpiCard index={6} label="Avg Monthly Income" value={inr(stats.data.avgMonthlyIncome)} hint="Verified declarations" icon={Wallet} tone="success" />
          <KpiCard index={7} label="Total Loan Requested" value={compactInr(stats.data.totalLoanAmount)} hint="Gross exposure sought" icon={Banknote} />
        </div>
      )}

      {all.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartFrame title="Loan Approval Distribution" description="Decision split across the portfolio">
            <PieChart>
              <Pie data={approvalData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                {approvalData.map((d) => (
                  <Cell key={d.name} fill={statusColor[d.name]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ChartFrame>

          <ChartFrame title="Risk Level Distribution" description="Composite AI risk banding">
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.4 }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {riskData.map((d) => (
                  <Cell key={d.name} fill={statusColor[d.name]} />
                ))}
              </Bar>
            </BarChart>
          </ChartFrame>

          <ChartFrame title="Credit Score Histogram" description="Bureau score distribution">
            <BarChart data={creditHist}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.4 }} />
              <Bar dataKey="count" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartFrame>

          <ChartFrame title="Monthly Income Distribution" description="Declared income bands (₹ thousands)">
            <AreaChart data={incomeHist}>
              <defs>
                <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="count" stroke="var(--chart-2)" strokeWidth={2} fill="url(#incomeFill)" />
            </AreaChart>
          </ChartFrame>

          <ChartFrame title="Loan Type Mix" description="Product-wise application volume">
            <PieChart>
              <Pie data={loanTypeData} dataKey="value" nameKey="name" outerRadius={92} label={false}>
                {loanTypeData.map((d, i) => (
                  <Cell key={d.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ChartFrame>

          <ChartFrame title="Fraud Score Distribution" description="Composite fraud telemetry">
            <BarChart data={fraudHist}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.4 }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {fraudHist.map((d, i) => (
                  <Cell key={d.label} fill={i > 6 ? "var(--destructive)" : i > 4 ? "var(--warning)" : "var(--chart-2)"} />
                ))}
              </Bar>
            </BarChart>
          </ChartFrame>
        </div>
      )}

      {recent.isLoading || !recent.data ? (
        <TableSkeleton />
      ) : (
        <SectionCard
          title="Recent Applications"
          description="Latest files processed by the underwriting engine"
          action={
            <Button asChild variant="ghost" size="sm" className="rounded-xl">
              <Link to="/applicants">
                View all <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Applicant</TableHead>
                  <TableHead>Loan ID</TableHead>
                  <TableHead className="text-right">Credit Score</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead className="text-right">Fraud Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.data.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium whitespace-nowrap">{a.fullName}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{a.loanId}</TableCell>
                    <TableCell className="text-right tabular-nums">{a.creditScore}</TableCell>
                    <TableCell><RiskBadge level={a.riskLevel} /></TableCell>
                    <TableCell className="text-right tabular-nums">{a.fraudScore}</TableCell>
                    <TableCell><StatusBadge status={a.approvalStatus} /></TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline" className="rounded-lg">
                        <Link to="/applicants/$applicantId" params={{ applicantId: a.id }}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}
    </>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";
import { mockApi } from "@/lib/mock/api";
import { PageHeader } from "@/components/common/PageHeader";
import { ChartFrame, CHART_COLORS, axisProps, tooltipStyle } from "@/components/charts/ChartFrame";
import { ChartSkeleton } from "@/components/common/Loading";

export const Route = createFileRoute("/_shell/analytics")({
  head: () => ({
    meta: [
      { title: "Portfolio Analytics — AI Loan Underwriting" },
      { name: "description", content: "Deep analytics on approvals by employment, geography, loan product and credit-risk correlation." },
      { property: "og:title", content: "Portfolio Analytics — AI Loan Underwriting" },
      { property: "og:description", content: "Deep analytics on approvals by employment, geography, loan product and credit-risk correlation." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["applicants", "all"], queryFn: () => mockApi.listApplicants() });
  const rows = data ?? [];

  const byGroup = (key: (a: (typeof rows)[number]) => string) => {
    const map = new Map<string, { name: string; approved: number; rejected: number; review: number }>();
    rows.forEach((a) => {
      const k = key(a);
      const e = map.get(k) ?? { name: k, approved: 0, rejected: 0, review: 0 };
      if (a.approvalStatus === "Approved") e.approved += 1;
      else if (a.approvalStatus === "Rejected") e.rejected += 1;
      else e.review += 1;
      map.set(k, e);
    });
    return [...map.values()];
  };

  const byEmployment = byGroup((a) => a.employmentType);
  const byLoanType = byGroup((a) => a.loanType);
  const byState = byGroup((a) => a.state)
    .sort((a, b) => b.approved + b.rejected + b.review - (a.approved + a.rejected + a.review))
    .slice(0, 8);

  const creditVsRisk = [...Array(8)].map((_, i) => {
    const lo = 500 + i * 50;
    const set = rows.filter((a) => a.creditScore >= lo && a.creditScore < lo + 50);
    return {
      band: `${lo}-${lo + 50}`,
      avgRisk: set.length ? Math.round(set.reduce((s, a) => s + a.riskScore, 0) / set.length) : 0,
      avgFraud: set.length ? Math.round(set.reduce((s, a) => s + a.fraudScore, 0) / set.length) : 0,
    };
  });

  const riskShare = (["Low", "Medium", "High"] as const).map((l, i) => ({
    name: `${l} risk`,
    value: rows.filter((a) => a.riskLevel === l).length,
    fill: CHART_COLORS[i]!,
  }));

  if (isLoading) {
    return (
      <>
        <PageHeader title="Analytics" subtitle="Loading portfolio analytics…" />
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartSkeleton /><ChartSkeleton /><ChartSkeleton /><ChartSkeleton />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Portfolio Analytics" subtitle="Decision performance sliced by segment, product and geography." />
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartFrame title="Approval Rate by Employment Type" description="Stacked decision outcomes">
          <BarChart data={byEmployment}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.35 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="approved" stackId="s" fill="var(--success)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="review" stackId="s" fill="var(--warning)" />
            <Bar dataKey="rejected" stackId="s" fill="var(--destructive)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartFrame>

        <ChartFrame title="Decisions by Loan Product" description="Where the portfolio concentrates">
          <BarChart data={byLoanType}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.35 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="approved" stackId="s" fill="var(--success)" />
            <Bar dataKey="review" stackId="s" fill="var(--warning)" />
            <Bar dataKey="rejected" stackId="s" fill="var(--destructive)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartFrame>

        <ChartFrame title="Top States by Volume" description="Geographic concentration of applications">
          <BarChart data={byState} layout="vertical" margin={{ left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" {...axisProps} />
            <YAxis type="category" dataKey="name" width={110} {...axisProps} />
            <Tooltip {...tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.35 }} />
            <Bar dataKey="approved" stackId="s" fill="var(--success)" />
            <Bar dataKey="review" stackId="s" fill="var(--warning)" />
            <Bar dataKey="rejected" stackId="s" fill="var(--destructive)" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ChartFrame>

        <ChartFrame title="Credit Band vs Average Risk" description="Model monotonicity check">
          <LineChart data={creditVsRisk}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="band" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="avgRisk" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="avgFraud" stroke="var(--chart-4)" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ChartFrame>

        <ChartFrame title="Risk Band Share" description="Portfolio composition by AI risk band" className="lg:col-span-2">
          <PieChart>
            <Pie data={riskShare} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>
              {riskShare.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ChartFrame>
      </div>
    </>
  );
}
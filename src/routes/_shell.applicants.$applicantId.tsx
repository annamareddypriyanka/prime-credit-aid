import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { mockApi } from "@/lib/mock/api";
import { inr, formatDate, formatDateTime, initials } from "@/lib/format";
import { PageHeader } from "@/components/common/PageHeader";
import { GlassCard, SectionCard } from "@/components/common/GlassCard";
import { RiskBadge, StatusBadge } from "@/components/common/StatusBadge";
import { ScoreRing } from "@/components/common/ScoreRing";
import { TableSkeleton } from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_shell/applicants/$applicantId")({
  head: () => ({
    meta: [
      { title: "Applicant Profile — AI Loan Underwriting" },
      { name: "description", content: "Full applicant profile with credit, income, alternative data, fraud indicators and the AI decision timeline." },
      { property: "og:title", content: "Applicant Profile — AI Loan Underwriting" },
      { property: "og:description", content: "Full applicant profile with credit, income, alternative data, fraud indicators and the AI decision timeline." },
    ],
  }),
  component: ApplicantDetailPage,
});

function ApplicantDetailPage() {
  const { applicantId } = Route.useParams();
  const { data: a, isLoading } = useQuery({
    queryKey: ["applicant", applicantId],
    queryFn: () => mockApi.getApplicant(applicantId),
  });

  if (isLoading) return <TableSkeleton rows={8} />;
  if (!a)
    return (
      <GlassCard className="p-8 text-center">
        <p className="font-display text-lg font-semibold">Application not found</p>
        <Button asChild className="mt-4 rounded-xl"><Link to="/applicants">Back to applicants</Link></Button>
      </GlassCard>
    );

  return (
    <>
      <PageHeader
        title={a.fullName}
        subtitle={`${a.loanId} · Applied ${formatDate(a.appliedAt)}`}
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/applicants"><ArrowLeft className="size-4" /> Back</Link>
            </Button>
            <Button asChild className="rounded-xl gradient-brand text-primary-foreground">
              <Link to="/result/$applicantId" params={{ applicantId: a.id }}>View decision</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2 space-y-5">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl gradient-brand font-display text-lg font-bold text-primary-foreground">
              {initials(a.fullName)}
            </span>
            <div className="min-w-0">
              <p className="font-display truncate text-lg font-semibold">{a.fullName}</p>
              <p className="text-sm text-muted-foreground">{a.designation} · {a.company}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Info icon={Phone} label="Phone" value={a.phone} />
            <Info icon={Mail} label="Email" value={a.email} />
            <Info icon={MapPin} label="Location" value={`${a.city}, ${a.state}`} />
            {[
              ["Age / Gender", `${a.age} · ${a.gender}`],
              ["Employment", a.employmentType],
              ["Experience", `${a.experienceYears} yrs`],
              ["Education", a.education],
              ["Monthly Income", inr(a.monthlyIncome)],
              ["Loan Requested", `${a.loanType} · ${inr(a.loanAmount)}`],
              ["Existing Loans", String(a.existingLoans)],
              ["Current EMI", inr(a.monthlyEmi)],
              ["Debt-to-Income", `${a.debtToIncome}%`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-border/70 bg-card/60 p-3">
                <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{k}</p>
                <p className="mt-1 truncate text-sm font-medium">{v}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border/70 bg-card/60 p-3">
            <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Loan Purpose</p>
            <p className="mt-1 text-sm">{a.loanPurpose}</p>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col items-center justify-center gap-4">
          <ScoreRing value={a.riskScore} caption={`Credit score ${a.creditScore} · Fraud ${a.fraudScore}`} />
          <div className="flex flex-wrap justify-center gap-2">
            <StatusBadge status={a.approvalStatus} />
            <RiskBadge level={a.riskLevel} />
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Alternative Data" description="Digital footprint signals used by the model">
          <div className="space-y-3">
            <Meter label="Digital payment score" value={a.alternativeData.digitalPaymentScore} />
            <Meter label="Public record score" value={a.alternativeData.publicRecordScore} />
            {[
              ["LinkedIn available", a.alternativeData.linkedinAvailable],
              ["GitHub / portfolio", a.alternativeData.githubAvailable],
              ["Education verified", a.alternativeData.educationVerified],
              ["Consent given", a.alternativeData.consentGiven],
            ].map(([k, v]) => (
              <Flag key={k as string} label={k as string} good={v as boolean} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Fraud Indicators" description="Device, network and behavioural checks">
          <div className="space-y-3">
            <Meter label="Composite fraud score" value={a.fraudScore} invert />
            <Flag label="Device fingerprint stable" good={!a.fraudIndicators.deviceChanged} />
            <Flag label="IP matches declared location" good={a.fraudIndicators.ipLocationMatch} />
            <Flag label="No duplicate application" good={!a.fraudIndicators.duplicateApplication} />
            <Flag label="No suspicious activity" good={!a.fraudIndicators.suspiciousActivity} />
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Application Timeline" description="Every step recorded by the underwriting pipeline">
        <ol className="relative space-y-5 border-l border-border/80 pl-6">
          {a.timeline.map((t) => (
            <li key={t.label} className="relative">
              <span className="absolute top-1.5 -left-[1.72rem] size-3 rounded-full gradient-brand" />
              <p className="text-sm font-semibold">{t.label}</p>
              <p className="text-xs text-muted-foreground">{t.description}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{formatDateTime(t.date)}</p>
            </li>
          ))}
        </ol>
      </SectionCard>
    </>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary"><Icon className="size-4" /></span>
      <div className="min-w-0">
        <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function Meter({ label, value, invert = false }: { label: string; value: number; invert?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={invert ? (value > 60 ? "font-semibold text-destructive" : "font-semibold text-success") : "font-semibold"}>{value}/100</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}

function Flag({ label, good }: { label: string; good: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card/60 px-3 py-2 text-sm">
      <span className="min-w-0 truncate">{label}</span>
      <span className={good ? "text-xs font-semibold text-success" : "text-xs font-semibold text-destructive"}>
        {good ? "Pass" : "Flagged"}
      </span>
    </div>
  );
}
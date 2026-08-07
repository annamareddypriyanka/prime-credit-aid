import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AI Loan Underwriting" },
      { name: "description", content: "Configure underwriter profile, decision thresholds, notifications and appearance for the underwriting console." },
      { property: "og:title", content: "Settings — AI Loan Underwriting" },
      { property: "og:description", content: "Configure underwriter profile, decision thresholds, notifications and appearance for the underwriting console." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [approveBelow, setApproveBelow] = useState(40);
  const [rejectAbove, setRejectAbove] = useState(74);
  const [fraudAlert, setFraudAlert] = useState(45);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoDecision, setAutoDecision] = useState(true);

  return (
    <>
      <PageHeader title="Settings" subtitle="Underwriting policy, notifications and console preferences." />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Underwriter Profile" description="Displayed across audit trails and decision logs">
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input className="rounded-xl" defaultValue={user?.name ?? "Demo Underwriter"} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input className="rounded-xl" defaultValue={user?.email ?? "underwriter@bank.in"} />
            </div>
            <Button className="rounded-xl gradient-brand text-primary-foreground" onClick={() => toast.success("Profile saved")}>
              Save profile
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Decision Thresholds" description="Applied by the AI engine to new applications">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs">Auto-approve when risk score below · {approveBelow}</Label>
              <Slider min={10} max={60} value={[approveBelow]} onValueChange={(v) => setApproveBelow(v[0]!)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Auto-reject when risk score above · {rejectAbove}</Label>
              <Slider min={60} max={95} value={[rejectAbove]} onValueChange={(v) => setRejectAbove(v[0]!)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Fraud alert threshold · {fraudAlert}</Label>
              <Slider min={20} max={90} value={[fraudAlert]} onValueChange={(v) => setFraudAlert(v[0]!)} />
            </div>
            <Button variant="outline" className="rounded-xl" onClick={() => toast.success("Thresholds updated")}>
              Apply thresholds
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Notifications" description="How the console alerts your team">
          <div className="space-y-3">
            <Row label="Email alerts for high-risk files" checked={emailAlerts} onChange={setEmailAlerts} />
            <Row label="Automated decisions without review" checked={autoDecision} onChange={setAutoDecision} />
          </div>
        </SectionCard>

        <SectionCard title="Appearance" description="Console theme preference">
          <Row label="Dark mode" checked={theme === "dark"} onChange={(v) => setTheme(v ? "dark" : "light")} />
        </SectionCard>
      </div>
    </>
  );
}

function Row({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/60 px-3.5 py-3">
      <span className="min-w-0 text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
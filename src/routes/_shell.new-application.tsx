import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { mockApi } from "@/lib/mock/api";
import { PageHeader } from "@/components/common/PageHeader";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/new-application")({
  head: () => ({
    meta: [
      { title: "New Loan Application — AI Underwriting" },
      { name: "description", content: "Capture applicant, employment, loan, alternative data and fraud signals in a guided multi-step underwriting form." },
      { property: "og:title", content: "New Loan Application — AI Underwriting" },
      { property: "og:description", content: "Capture applicant, employment, loan, alternative data and fraud signals in a guided multi-step underwriting form." },
    ],
  }),
  component: NewApplicationPage,
});

const schema = z.object({
  fullName: z.string().trim().min(3, "Enter the full legal name").max(80),
  age: z.coerce.number().int().min(21, "Applicant must be 21+").max(70),
  gender: z.enum(["Male", "Female", "Other"]),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().trim().email("Enter a valid email").max(120),
  city: z.string().trim().min(2, "City is required").max(60),
  state: z.string().trim().min(2, "State is required").max(60),

  employmentType: z.enum(["Salaried", "Self-Employed", "Government", "Freelancer", "Business Owner"]),
  company: z.string().trim().min(2, "Employer is required").max(80),
  designation: z.string().trim().min(2, "Designation is required").max(80),
  experienceYears: z.coerce.number().min(0).max(45),
  education: z.enum(["High School", "Diploma", "B.Tech", "B.Com", "B.Sc", "MBA", "M.Tech", "CA", "PhD"]),
  monthlyIncome: z.coerce.number().min(10000, "Minimum ₹10,000").max(5000000),

  loanType: z.enum(["Home", "Personal", "Auto", "Education", "Business", "Gold"]),
  loanAmount: z.coerce.number().min(50000, "Minimum ₹50,000").max(50000000),
  loanPurpose: z.string().trim().min(10, "Describe the purpose (min 10 chars)").max(300),
  existingLoans: z.coerce.number().int().min(0).max(8),
  monthlyEmi: z.coerce.number().min(0).max(2000000),

  linkedinAvailable: z.boolean(),
  githubAvailable: z.boolean(),
  educationVerified: z.boolean(),
  digitalPaymentScore: z.number().min(0).max(100),
  publicRecordScore: z.number().min(0).max(100),
  consentGiven: z.boolean(),

  deviceChanged: z.boolean(),
  ipLocationMatch: z.boolean(),
  duplicateApplication: z.boolean(),
  suspiciousActivity: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const STEPS = [
  { title: "Personal", fields: ["fullName", "age", "gender", "phone", "email", "city", "state"] },
  { title: "Employment", fields: ["employmentType", "company", "designation", "experienceYears", "education", "monthlyIncome"] },
  { title: "Loan Details", fields: ["loanType", "loanAmount", "loanPurpose", "existingLoans", "monthlyEmi"] },
  { title: "Alternative Data", fields: ["digitalPaymentScore", "publicRecordScore"] },
  { title: "Review & Submit", fields: [] },
] as const;

function NewApplicationPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      age: 32,
      gender: "Male",
      phone: "",
      email: "",
      city: "",
      state: "",
      employmentType: "Salaried",
      company: "",
      designation: "",
      experienceYears: 5,
      education: "B.Tech",
      monthlyIncome: 85000,
      loanType: "Personal",
      loanAmount: 800000,
      loanPurpose: "",
      existingLoans: 0,
      monthlyEmi: 0,
      linkedinAvailable: true,
      githubAvailable: false,
      educationVerified: true,
      digitalPaymentScore: 72,
      publicRecordScore: 68,
      consentGiven: true,
      deviceChanged: false,
      ipLocationMatch: true,
      duplicateApplication: false,
      suspiciousActivity: false,
    },
  });

  const submit = useMutation({
    mutationFn: (values: FormValues) => mockApi.submitApplication(values),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["applicants"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["recent"] });
      toast.success("AI underwriting complete");
      navigate({ to: "/result/$applicantId", params: { applicantId: created.id } });
    },
  });

  const next = async () => {
    const fields = STEPS[step]!.fields as unknown as (keyof FormValues)[];
    const ok = fields.length === 0 || (await form.trigger(fields));
    if (!ok) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const values = form.watch();
  const err = form.formState.errors;

  return (
    <>
      <PageHeader
        title="New Loan Application"
        subtitle="Five guided steps. The AI engine scores the file instantly on submission."
      />

      <GlassCard className="p-4 sm:p-5">
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex min-w-0 items-center gap-2.5">
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-xl text-xs font-bold transition-colors",
                  i < step
                    ? "bg-success/15 text-success"
                    : i === step
                      ? "gradient-brand text-primary-foreground shadow-soft"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </span>
              <span className={cn("truncate text-xs font-medium", i === step ? "text-foreground" : "text-muted-foreground")}>
                {s.title}
              </span>
            </li>
          ))}
        </ol>
      </GlassCard>

      <GlassCard className="p-5 sm:p-6">
        <form
          onSubmit={form.handleSubmit((v) => submit.mutate(v))}
          className="space-y-6"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-5 md:grid-cols-2"
            >
              {step === 0 && (
                <>
                  <Field label="Full Name" error={err.fullName?.message}>
                    <Input className="rounded-xl" placeholder="Ananya Krishnan" {...form.register("fullName")} />
                  </Field>
                  <Field label="Age" error={err.age?.message}>
                    <Input className="rounded-xl" type="number" {...form.register("age")} />
                  </Field>
                  <Field label="Gender">
                    <Choice value={values.gender} onChange={(v) => form.setValue("gender", v as never)} options={["Male", "Female", "Other"]} />
                  </Field>
                  <Field label="Mobile Number" error={err.phone?.message}>
                    <Input className="rounded-xl" placeholder="9876543210" {...form.register("phone")} />
                  </Field>
                  <Field label="Email" error={err.email?.message}>
                    <Input className="rounded-xl" placeholder="name@email.com" {...form.register("email")} />
                  </Field>
                  <Field label="City" error={err.city?.message}>
                    <Input className="rounded-xl" placeholder="Bengaluru" {...form.register("city")} />
                  </Field>
                  <Field label="State" error={err.state?.message}>
                    <Input className="rounded-xl" placeholder="Karnataka" {...form.register("state")} />
                  </Field>
                </>
              )}

              {step === 1 && (
                <>
                  <Field label="Employment Type">
                    <Choice
                      value={values.employmentType}
                      onChange={(v) => form.setValue("employmentType", v as never)}
                      options={["Salaried", "Self-Employed", "Government", "Freelancer", "Business Owner"]}
                    />
                  </Field>
                  <Field label="Employer / Business" error={err.company?.message}>
                    <Input className="rounded-xl" placeholder="Infosys" {...form.register("company")} />
                  </Field>
                  <Field label="Designation" error={err.designation?.message}>
                    <Input className="rounded-xl" placeholder="Senior Engineer" {...form.register("designation")} />
                  </Field>
                  <Field label="Experience (years)" error={err.experienceYears?.message}>
                    <Input className="rounded-xl" type="number" step="0.5" {...form.register("experienceYears")} />
                  </Field>
                  <Field label="Education">
                    <Choice
                      value={values.education}
                      onChange={(v) => form.setValue("education", v as never)}
                      options={["High School", "Diploma", "B.Tech", "B.Com", "B.Sc", "MBA", "M.Tech", "CA", "PhD"]}
                    />
                  </Field>
                  <Field label="Monthly Income (₹)" error={err.monthlyIncome?.message}>
                    <Input className="rounded-xl" type="number" {...form.register("monthlyIncome")} />
                  </Field>
                </>
              )}

              {step === 2 && (
                <>
                  <Field label="Loan Type">
                    <Choice
                      value={values.loanType}
                      onChange={(v) => form.setValue("loanType", v as never)}
                      options={["Home", "Personal", "Auto", "Education", "Business", "Gold"]}
                    />
                  </Field>
                  <Field label="Loan Amount (₹)" error={err.loanAmount?.message}>
                    <Input className="rounded-xl" type="number" {...form.register("loanAmount")} />
                  </Field>
                  <Field label="Existing Loans" error={err.existingLoans?.message}>
                    <Input className="rounded-xl" type="number" {...form.register("existingLoans")} />
                  </Field>
                  <Field label="Current Monthly EMI (₹)" error={err.monthlyEmi?.message}>
                    <Input className="rounded-xl" type="number" {...form.register("monthlyEmi")} />
                  </Field>
                  <Field label="Loan Purpose" error={err.loanPurpose?.message} className="md:col-span-2">
                    <Textarea className="min-h-24 rounded-xl" placeholder="Describe how the funds will be used" {...form.register("loanPurpose")} />
                  </Field>
                </>
              )}

              {step === 3 && (
                <>
                  <Field label={`Digital Payment Score · ${values.digitalPaymentScore}`}>
                    <Slider min={0} max={100} step={1} value={[values.digitalPaymentScore]} onValueChange={(v) => form.setValue("digitalPaymentScore", v[0]!)} />
                  </Field>
                  <Field label={`Public Record Score · ${values.publicRecordScore}`}>
                    <Slider min={0} max={100} step={1} value={[values.publicRecordScore]} onValueChange={(v) => form.setValue("publicRecordScore", v[0]!)} />
                  </Field>
                  <Toggle label="LinkedIn profile available" checked={values.linkedinAvailable} onChange={(v) => form.setValue("linkedinAvailable", v)} />
                  <Toggle label="GitHub / portfolio available" checked={values.githubAvailable} onChange={(v) => form.setValue("githubAvailable", v)} />
                  <Toggle label="Education verified" checked={values.educationVerified} onChange={(v) => form.setValue("educationVerified", v)} />
                  <Toggle label="Consent for alternative data" checked={values.consentGiven} onChange={(v) => form.setValue("consentGiven", v)} />
                  <Toggle label="Device fingerprint changed" checked={values.deviceChanged} onChange={(v) => form.setValue("deviceChanged", v)} />
                  <Toggle label="IP matches declared location" checked={values.ipLocationMatch} onChange={(v) => form.setValue("ipLocationMatch", v)} />
                  <Toggle label="Duplicate application detected" checked={values.duplicateApplication} onChange={(v) => form.setValue("duplicateApplication", v)} />
                  <Toggle label="Suspicious activity flagged" checked={values.suspiciousActivity} onChange={(v) => form.setValue("suspiciousActivity", v)} />
                </>
              )}

              {step === 4 && (
                <div className="md:col-span-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    ["Applicant", `${values.fullName || "—"}, ${values.age}`],
                    ["Contact", values.phone || "—"],
                    ["Location", [values.city, values.state].filter(Boolean).join(", ") || "—"],
                    ["Employment", `${values.employmentType} · ${values.company || "—"}`],
                    ["Monthly Income", `₹${Number(values.monthlyIncome).toLocaleString("en-IN")}`],
                    ["Loan", `${values.loanType} · ₹${Number(values.loanAmount).toLocaleString("en-IN")}`],
                    ["Existing EMI", `₹${Number(values.monthlyEmi).toLocaleString("en-IN")}`],
                    ["Digital Footprint", `${values.digitalPaymentScore}/100`],
                    ["Fraud Flags", [
                      values.deviceChanged && "Device changed",
                      !values.ipLocationMatch && "IP mismatch",
                      values.duplicateApplication && "Duplicate",
                      values.suspiciousActivity && "Suspicious",
                    ].filter(Boolean).join(", ") || "None"],
                  ].map(([k, v]) => (
                    <div key={k as string} className="rounded-xl border border-border/70 bg-card/60 p-3">
                      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{k}</p>
                      <p className="mt-1 truncate text-sm font-medium">{v}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              <ChevronLeft className="size-4" /> Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button type="button" className="rounded-xl gradient-brand text-primary-foreground shadow-soft" onClick={next}>
                Continue <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={submit.isPending} className="rounded-xl gradient-brand text-primary-foreground shadow-soft">
                {submit.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {submit.isPending ? "Scoring application…" : "Run AI Underwriting"}
              </Button>
            )}
          </div>
        </form>
      </GlassCard>
    </>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string | undefined;
  className?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs">{label}</Label>
      {children}
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}

function Choice({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full rounded-xl"><SelectValue /></SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>{o}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/60 px-3.5 py-3">
      <span className="min-w-0 text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
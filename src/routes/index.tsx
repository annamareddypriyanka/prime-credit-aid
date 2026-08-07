import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Landmark, Lock, Mail, ShieldCheck, Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign In — AI Dynamic Loan Underwriting System" },
      {
        name: "description",
        content:
          "Secure access to the AI Dynamic Loan Underwriting System: real-time credit scoring, fraud detection and explainable lending decisions.",
      },
      { property: "og:title", content: "AI Dynamic Loan Underwriting System" },
      {
        property: "og:description",
        content: "Enterprise-grade AI underwriting: credit risk, fraud monitoring and explainable decisions in one console.",
      },
    ],
  }),
  component: LoginPage,
});

const highlights = [
  { icon: Sparkles, title: "Explainable AI decisions", detail: "Every approval carries a factor-level breakdown." },
  { icon: ShieldCheck, title: "Real-time fraud screening", detail: "Device, IP and duplication signals scored instantly." },
  { icon: TrendingUp, title: "Alternative data enrichment", detail: "Digital footprints extend credit to thin-file borrowers." },
];

function LoginPage() {
  const { login, user, ready } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: "/dashboard" });
  }, [ready, user, navigate]);

  const signIn = (mail: string, pass: string) => {
    if (!mail.includes("@") || pass.length < 4) {
      toast.error("Enter a valid email and a password of at least 4 characters.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login(mail);
      toast.success("Welcome back to the underwriting console.");
      navigate({ to: "/dashboard" });
    }, 700);
  };

  return (
    <div className="mesh-bg grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="absolute inset-0 gradient-brand opacity-95" />
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(28rem_28rem_at_80%_20%,white,transparent_60%)]" />
        <div className="relative z-10 flex items-center gap-3 text-primary-foreground">
          <span className="grid size-11 place-items-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <Landmark className="size-5" />
          </span>
          <div>
            <p className="font-display text-base font-bold">AI Dynamic Loan Underwriting</p>
            <p className="text-xs opacity-80">Enterprise credit decisioning platform</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-lg text-primary-foreground"
        >
          <h2 className="font-display text-4xl leading-tight font-bold">
            Underwrite in seconds, not days.
          </h2>
          <p className="mt-3 text-sm opacity-90">
            A dynamic risk engine that blends bureau data, income signals, alternative digital footprints and
            fraud telemetry into a single, auditable decision.
          </p>

          <div className="mt-8 space-y-3">
            {highlights.map((h, i) => (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md"
              >
                <h.icon className="mt-0.5 size-5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{h.title}</p>
                  <p className="text-xs opacity-85">{h.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="relative z-10 grid grid-cols-3 gap-4 text-primary-foreground">
          {[
            ["250+", "Live applications"],
            ["1.4s", "Median decision time"],
            ["98.2%", "Model AUC stability"],
          ].map(([v, l]) => (
            <div key={l} className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-md">
              <p className="font-display text-xl font-bold">{v}</p>
              <p className="text-[11px] opacity-85">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card w-full max-w-md p-8"
        >
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="grid size-10 place-items-center rounded-xl gradient-brand text-primary-foreground">
              <Landmark className="size-5" />
            </span>
            <p className="font-display text-sm font-bold">AI Dynamic Loan Underwriting</p>
          </div>

          <h1 className="font-display text-2xl font-bold tracking-tight">Sign in to your console</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use your institutional credentials or explore with the demo account.
          </p>

          <form
            className="mt-7 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              signIn(email, password);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="underwriter@bank.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl pl-9"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl gradient-brand text-primary-foreground shadow-soft">
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              Login
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={loading}
              className="h-11 w-full rounded-xl"
              onClick={() => {
                setEmail("demo.underwriter@bank.in");
                setPassword("demo1234");
                signIn("demo.underwriter@bank.in", "demo1234");
              }}
            >
              Demo Login
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Protected by bank-grade encryption. Mock environment — no live customer data.
          </p>
        </motion.div>
      </section>
    </div>
  );
}

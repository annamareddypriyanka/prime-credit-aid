import { generateApplicants } from "./generate";
import type { Applicant, ApplicantFilters, ScoreFactor } from "./types";

/**
 * Central mock API service. Every page consumes data from here so that
 * swapping in real backend endpoints later is a single-file change.
 */

let store: Applicant[] = generateApplicants(250);

const delay = (ms = 260) => new Promise((res) => setTimeout(res, ms));

export const mockApi = {
  async listApplicants(filters: ApplicantFilters = {}): Promise<Applicant[]> {
    await delay();
    const {
      search = "",
      riskLevel = "all",
      approvalStatus = "all",
      loanType = "all",
      employmentType = "all",
      creditScoreRange = [300, 900],
      fraudScoreRange = [0, 100],
      sortBy = "recent",
    } = filters;

    const q = search.trim().toLowerCase();
    let rows = store.filter((a) => {
      if (q && !`${a.fullName} ${a.loanId} ${a.city} ${a.email}`.toLowerCase().includes(q)) return false;
      if (riskLevel !== "all" && a.riskLevel !== riskLevel) return false;
      if (approvalStatus !== "all" && a.approvalStatus !== approvalStatus) return false;
      if (loanType !== "all" && a.loanType !== loanType) return false;
      if (employmentType !== "all" && a.employmentType !== employmentType) return false;
      if (a.creditScore < creditScoreRange[0] || a.creditScore > creditScoreRange[1]) return false;
      if (a.fraudScore < fraudScoreRange[0] || a.fraudScore > fraudScoreRange[1]) return false;
      return true;
    });

    const sorters: Record<string, (a: Applicant, b: Applicant) => number> = {
      recent: (a, b) => b.appliedAt.localeCompare(a.appliedAt),
      name: (a, b) => a.fullName.localeCompare(b.fullName),
      creditHigh: (a, b) => b.creditScore - a.creditScore,
      creditLow: (a, b) => a.creditScore - b.creditScore,
      riskHigh: (a, b) => b.riskScore - a.riskScore,
      fraudHigh: (a, b) => b.fraudScore - a.fraudScore,
      amountHigh: (a, b) => b.loanAmount - a.loanAmount,
    };
    rows = [...rows].sort(sorters[sortBy] ?? sorters["recent"]!);
    return rows;
  },

  async getApplicant(id: string): Promise<Applicant | undefined> {
    await delay(200);
    return store.find((a) => a.id === id || a.loanId === id);
  },

  async deleteApplicant(id: string): Promise<void> {
    await delay(160);
    store = store.filter((a) => a.id !== id);
  },

  async updateApplicant(id: string, patch: Partial<Applicant>): Promise<Applicant | undefined> {
    await delay(160);
    store = store.map((a) => (a.id === id ? { ...a, ...patch } : a));
    return store.find((a) => a.id === id);
  },

  async getStats() {
    await delay(220);
    const total = store.length;
    const approved = store.filter((a) => a.approvalStatus === "Approved").length;
    const rejected = store.filter((a) => a.approvalStatus === "Rejected").length;
    const review = store.filter((a) => a.approvalStatus === "Manual Review").length;
    const avg = (fn: (a: Applicant) => number) => Math.round(store.reduce((s, a) => s + fn(a), 0) / (total || 1));
    return {
      total,
      approved,
      rejected,
      review,
      avgCreditScore: avg((a) => a.creditScore),
      avgFraudScore: avg((a) => a.fraudScore),
      avgMonthlyIncome: avg((a) => a.monthlyIncome),
      totalLoanAmount: store.reduce((s, a) => s + a.loanAmount, 0),
    };
  },

  async getRecent(limit = 8): Promise<Applicant[]> {
    await delay(200);
    return [...store].sort((a, b) => b.appliedAt.localeCompare(a.appliedAt)).slice(0, limit);
  },

  async getFraudCases(): Promise<Applicant[]> {
    await delay(220);
    return store
      .filter(
        (a) =>
          a.fraudScore >= 45 ||
          a.fraudIndicators.duplicateApplication ||
          a.fraudIndicators.suspiciousActivity ||
          !a.fraudIndicators.ipLocationMatch,
      )
      .sort((a, b) => b.fraudScore - a.fraudScore);
  },

  async submitApplication(input: NewApplicationInput): Promise<Applicant> {
    await delay(900);
    const created = scoreApplication(input, store.length);
    store = [created, ...store];
    return created;
  },
};

export interface NewApplicationInput {
  fullName: string;
  age: number;
  gender: Applicant["gender"];
  phone: string;
  email: string;
  city: string;
  state: string;
  employmentType: Applicant["employmentType"];
  company: string;
  designation: string;
  experienceYears: number;
  education: string;
  monthlyIncome: number;
  loanAmount: number;
  loanType: Applicant["loanType"];
  loanPurpose: string;
  existingLoans: number;
  monthlyEmi: number;
  linkedinAvailable: boolean;
  githubAvailable: boolean;
  educationVerified: boolean;
  digitalPaymentScore: number;
  publicRecordScore: number;
  consentGiven: boolean;
  deviceChanged: boolean;
  ipLocationMatch: boolean;
  duplicateApplication: boolean;
  suspiciousActivity: boolean;
}

/** Deterministic scoring engine mirroring the model that the backend will serve. */
export function scoreApplication(input: NewApplicationInput, index: number): Applicant {
  const dti = Number(((input.monthlyEmi / Math.max(input.monthlyIncome, 1)) * 100).toFixed(1));
  const altScore = Math.round(
    (input.digitalPaymentScore + input.publicRecordScore) / 2 +
      (input.linkedinAvailable ? 4 : 0) +
      (input.githubAvailable ? 2 : 0) +
      (input.educationVerified ? 4 : -6),
  );

  let fraudScore = 8;
  if (input.deviceChanged) fraudScore += 18;
  if (!input.ipLocationMatch) fraudScore += 15;
  if (input.duplicateApplication) fraudScore += 26;
  if (input.suspiciousActivity) fraudScore += 22;
  if (!input.consentGiven) fraudScore += 8;
  fraudScore = Math.max(1, Math.min(99, fraudScore));

  const creditScore = Math.max(
    520,
    Math.min(
      880,
      Math.round(
        640 +
          Math.min(input.monthlyIncome / 4000, 60) +
          (input.educationVerified ? 20 : -12) +
          Math.min(input.experienceYears * 3, 45) +
          altScore * 0.25 -
          dti * 1.4 -
          input.existingLoans * 12,
      ),
    ),
  );

  const riskScore = Math.max(
    3,
    Math.min(
      99,
      Math.round(
        100 -
          ((creditScore - 500) / 380) * 46 -
          (altScore / 100) * 12 -
          Math.min(input.monthlyIncome / 320000, 1) * 12 +
          Math.min(dti, 60) * 0.35 +
          fraudScore * 0.28 -
          8,
      ),
    ),
  );

  const riskLevel = riskScore < 35 ? "Low" : riskScore < 62 ? "Medium" : "High";
  const approvalStatus =
    fraudScore > 72 || riskScore > 74 ? "Rejected" : riskScore < 40 && fraudScore < 45 ? "Approved" : "Manual Review";

  const factors: ScoreFactor[] = [
    { factor: "Credit Score", impact: Math.round(((creditScore - 600) / 300) * 30), detail: `Modelled bureau score of ${creditScore}.` },
    { factor: "Monthly Income", impact: Math.round(Math.min(input.monthlyIncome / 200000, 1) * 22), detail: `Declared income of ₹${input.monthlyIncome.toLocaleString("en-IN")}.` },
    { factor: "Debt-to-Income Ratio", impact: -Math.round(Math.min(dti / 60, 1) * 26), detail: `EMI obligations at ${dti}% of income.` },
    { factor: "Fraud Indicators", impact: -Math.round((fraudScore / 100) * 32), detail: `Composite fraud score of ${fraudScore}.` },
    { factor: "Alternative Data", impact: Math.round((altScore / 100) * 14), detail: `Digital footprint score ${altScore}/100.` },
    { factor: "Employment Stability", impact: Math.round(Math.min(input.experienceYears / 20, 1) * 10), detail: `${input.experienceYears} years of experience as ${input.designation}.` },
  ];

  const now = new Date().toISOString();
  return {
    id: `APP${String(index + 1001).padStart(4, "0")}`,
    loanId: `LN-2026-${String(90000 + index)}`,
    ...input,
    alternativeData: {
      linkedinAvailable: input.linkedinAvailable,
      githubAvailable: input.githubAvailable,
      educationVerified: input.educationVerified,
      digitalPaymentScore: input.digitalPaymentScore,
      publicRecordScore: input.publicRecordScore,
      consentGiven: input.consentGiven,
    },
    fraudIndicators: {
      deviceChanged: input.deviceChanged,
      ipLocationMatch: input.ipLocationMatch,
      duplicateApplication: input.duplicateApplication,
      suspiciousActivity: input.suspiciousActivity,
    },
    creditScore,
    fraudScore,
    riskScore,
    debtToIncome: dti,
    riskLevel,
    approvalStatus,
    reason:
      approvalStatus === "Approved"
        ? `Composite risk of ${riskScore}/100 with a healthy ${dti}% debt-to-income ratio and clean fraud signals.`
        : approvalStatus === "Rejected"
          ? `Composite risk of ${riskScore}/100 exceeds policy thresholds${fraudScore > 72 ? " and fraud signals are severe" : ""}.`
          : `Borderline composite risk of ${riskScore}/100 requires human verification of income and obligations.`,
    recommendation:
      approvalStatus === "Approved"
        ? "Sanction at standard pricing with a 12-month behavioural review."
        : approvalStatus === "Rejected"
          ? "Decline at current terms; suggest a co-applicant or reduced ticket size."
          : "Escalate to a senior underwriter with bank statements and income proof.",
    factors,
    timeline: [
      { label: "Application submitted", description: `${input.loanType} loan request captured.`, date: now },
      { label: "KYC & document check", description: "Automated identity and address verification passed.", date: now },
      { label: "Alternative data enrichment", description: "Digital footprint and public records ingested.", date: now },
      { label: "Fraud screening", description: `Composite fraud score computed at ${fraudScore}/100.`, date: now },
      { label: "AI underwriting decision", description: `${approvalStatus} — risk score ${riskScore}/100.`, date: now },
    ],
    appliedAt: now,
  } as Applicant;
}
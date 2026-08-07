export type RiskLevel = "Low" | "Medium" | "High";
export type ApprovalStatus = "Approved" | "Rejected" | "Manual Review";
export type LoanType = "Home" | "Personal" | "Auto" | "Education" | "Business" | "Gold";
export type EmploymentType = "Salaried" | "Self-Employed" | "Government" | "Freelancer" | "Business Owner";

export interface AlternativeData {
  linkedinAvailable: boolean;
  githubAvailable: boolean;
  educationVerified: boolean;
  digitalPaymentScore: number;
  publicRecordScore: number;
  consentGiven: boolean;
}

export interface FraudIndicators {
  deviceChanged: boolean;
  ipLocationMatch: boolean;
  duplicateApplication: boolean;
  suspiciousActivity: boolean;
}

export interface TimelineEvent {
  label: string;
  description: string;
  date: string;
}

export interface ScoreFactor {
  factor: string;
  impact: number;
  detail: string;
}

export interface Applicant {
  id: string;
  loanId: string;
  fullName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  email: string;
  city: string;
  state: string;

  employmentType: EmploymentType;
  company: string;
  designation: string;
  experienceYears: number;
  education: string;
  monthlyIncome: number;

  loanAmount: number;
  loanType: LoanType;
  loanPurpose: string;
  existingLoans: number;
  monthlyEmi: number;

  alternativeData: AlternativeData;
  fraudIndicators: FraudIndicators;

  creditScore: number;
  fraudScore: number;
  riskScore: number;
  debtToIncome: number;
  riskLevel: RiskLevel;
  approvalStatus: ApprovalStatus;
  reason: string;
  recommendation: string;
  factors: ScoreFactor[];
  timeline: TimelineEvent[];
  appliedAt: string;
}

export interface ApplicantFilters {
  search?: string;
  riskLevel?: RiskLevel | "all";
  approvalStatus?: ApprovalStatus | "all";
  loanType?: LoanType | "all";
  employmentType?: EmploymentType | "all";
  creditScoreRange?: [number, number];
  fraudScoreRange?: [number, number];
  sortBy?: string;
}
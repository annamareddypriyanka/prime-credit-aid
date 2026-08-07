import type {
  Applicant,
  ApprovalStatus,
  EmploymentType,
  LoanType,
  RiskLevel,
  ScoreFactor,
} from "./types";

/** Deterministic PRNG so the mock dataset is stable across SSR + client. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_M = ["Aarav","Vivaan","Aditya","Vihaan","Arjun","Reyansh","Krishna","Ishaan","Rohan","Karthik","Rahul","Siddharth","Aniket","Manish","Rajat","Nikhil","Pranav","Harsh","Yash","Suresh","Ramesh","Vikram","Deepak","Sanjay","Ajay","Naveen","Gaurav","Abhishek","Tarun","Kunal"];
const FIRST_F = ["Aanya","Diya","Ananya","Ishita","Kavya","Meera","Neha","Priya","Riya","Sanya","Shreya","Trisha","Pooja","Divya","Nandini","Aditi","Sneha","Anjali","Swathi","Lakshmi","Rekha","Kirti","Bhavana","Tanvi","Ritika","Payal","Manasi","Sonal","Radhika","Vaishnavi"];
const LAST = ["Sharma","Verma","Patel","Reddy","Nair","Iyer","Menon","Gupta","Agarwal","Chopra","Kapoor","Malhotra","Joshi","Desai","Shah","Rao","Naidu","Pillai","Bose","Chatterjee","Banerjee","Mukherjee","Singh","Yadav","Mishra","Tiwari","Pandey","Kulkarni","Deshmukh","Bhatt"];
const CITY_STATE: Array<[string, string]> = [
  ["Mumbai","Maharashtra"],["Pune","Maharashtra"],["Nagpur","Maharashtra"],
  ["Bengaluru","Karnataka"],["Mysuru","Karnataka"],
  ["Chennai","Tamil Nadu"],["Coimbatore","Tamil Nadu"],
  ["Hyderabad","Telangana"],["Warangal","Telangana"],
  ["Delhi","Delhi"],["Noida","Uttar Pradesh"],["Lucknow","Uttar Pradesh"],
  ["Ahmedabad","Gujarat"],["Surat","Gujarat"],
  ["Jaipur","Rajasthan"],["Jodhpur","Rajasthan"],
  ["Kolkata","West Bengal"],["Kochi","Kerala"],["Thiruvananthapuram","Kerala"],
  ["Bhopal","Madhya Pradesh"],["Indore","Madhya Pradesh"],["Chandigarh","Punjab"],
];
const COMPANIES = ["Infosys","Tata Consultancy Services","Wipro","HCL Technologies","Reliance Industries","HDFC Bank","ICICI Bank","Larsen & Toubro","Mahindra Group","Zomato","Flipkart","Paytm","Byju's","Tech Mahindra","Asian Paints","Hindustan Unilever","Self Employed","Aditya Birla Group","Bajaj Finserv","Cognizant India"];
const DESIGNATIONS = ["Software Engineer","Senior Analyst","Project Manager","Operations Lead","Sales Executive","Consultant","Accountant","Branch Manager","Product Designer","Data Scientist","Proprietor","Regional Head"];
const EDUCATION = ["B.Tech","B.Com","MBA","M.Tech","B.Sc","CA","Diploma","B.A.","M.Sc"];
const LOAN_TYPES: LoanType[] = ["Home","Personal","Auto","Education","Business","Gold"];
const EMPLOYMENT: EmploymentType[] = ["Salaried","Self-Employed","Government","Freelancer","Business Owner"];
const PURPOSES: Record<LoanType, string[]> = {
  Home: ["Purchase of apartment","Home construction","Home renovation"],
  Personal: ["Medical expenses","Wedding expenses","Debt consolidation","Travel"],
  Auto: ["New car purchase","Used car purchase","Two-wheeler purchase"],
  Education: ["Overseas masters programme","Professional certification","Undergraduate tuition"],
  Business: ["Working capital","Equipment purchase","Business expansion"],
  Gold: ["Short term liquidity","Business cashflow","Family obligation"],
};

const pick = <T,>(r: () => number, arr: T[]): T => arr[Math.floor(r() * arr.length)]!;
const between = (r: () => number, a: number, b: number) => Math.round(a + r() * (b - a));

function buildFactors(a: {
  creditScore: number;
  monthlyIncome: number;
  dti: number;
  fraudScore: number;
  altScore: number;
  experienceYears: number;
}): ScoreFactor[] {
  const credit = Math.round(((a.creditScore - 600) / 300) * 30);
  const income = Math.round(Math.min(a.monthlyIncome / 200000, 1) * 22);
  const dti = -Math.round(Math.min(a.dti / 60, 1) * 26);
  const fraud = -Math.round((a.fraudScore / 100) * 32);
  const alt = Math.round((a.altScore / 100) * 14);
  const exp = Math.round(Math.min(a.experienceYears / 20, 1) * 10);
  return [
    { factor: "Credit Score", impact: credit, detail: `Bureau score of ${a.creditScore} against a portfolio median of 712.` },
    { factor: "Monthly Income", impact: income, detail: `Verified income of ₹${a.monthlyIncome.toLocaleString("en-IN")} per month.` },
    { factor: "Debt-to-Income Ratio", impact: dti, detail: `Existing obligations consume ${a.dti.toFixed(1)}% of monthly income.` },
    { factor: "Fraud Indicators", impact: fraud, detail: `Device, IP and duplication signals produce a fraud score of ${a.fraudScore}.` },
    { factor: "Alternative Data", impact: alt, detail: `Digital footprint and public records contribute ${a.altScore}/100.` },
    { factor: "Employment Stability", impact: exp, detail: `${a.experienceYears} years of continuous work history.` },
  ];
}

export function generateApplicants(count = 250): Applicant[] {
  const r = mulberry32(20260807);
  const out: Applicant[] = [];

  for (let i = 0; i < count; i++) {
    const gender = r() > 0.42 ? "Male" : "Female";
    const first = gender === "Male" ? pick(r, FIRST_M) : pick(r, FIRST_F);
    const fullName = `${first} ${pick(r, LAST)}`;
    const [city, state] = pick(r, CITY_STATE);
    const employmentType = pick(r, EMPLOYMENT);
    const loanType = pick(r, LOAN_TYPES);
    const age = between(r, 22, 58);
    const experienceYears = Math.max(1, Math.min(age - 21, between(r, 1, 25)));
    const monthlyIncome = between(r, 22000, 320000);
    const loanAmount =
      loanType === "Home" ? between(r, 1500000, 12000000)
      : loanType === "Business" ? between(r, 500000, 6000000)
      : loanType === "Auto" ? between(r, 300000, 2500000)
      : loanType === "Education" ? between(r, 300000, 4000000)
      : between(r, 50000, 1500000);
    const existingLoans = between(r, 0, 3);
    const monthlyEmi = existingLoans === 0 ? 0 : between(r, 3000, Math.max(6000, Math.round(monthlyIncome * 0.42)));
    const dti = Number(((monthlyEmi / monthlyIncome) * 100).toFixed(1));

    const alternativeData = {
      linkedinAvailable: r() > 0.32,
      githubAvailable: r() > 0.72,
      educationVerified: r() > 0.24,
      digitalPaymentScore: between(r, 25, 99),
      publicRecordScore: between(r, 30, 99),
      consentGiven: r() > 0.06,
    };
    const altScore = Math.round(
      (alternativeData.digitalPaymentScore + alternativeData.publicRecordScore) / 2 +
        (alternativeData.linkedinAvailable ? 4 : 0) +
        (alternativeData.educationVerified ? 4 : -6),
    );

    const fraudIndicators = {
      deviceChanged: r() > 0.79,
      ipLocationMatch: r() > 0.18,
      duplicateApplication: r() > 0.9,
      suspiciousActivity: r() > 0.87,
    };
    let fraudScore = between(r, 2, 34);
    if (fraudIndicators.deviceChanged) fraudScore += between(r, 10, 22);
    if (!fraudIndicators.ipLocationMatch) fraudScore += between(r, 8, 18);
    if (fraudIndicators.duplicateApplication) fraudScore += between(r, 15, 30);
    if (fraudIndicators.suspiciousActivity) fraudScore += between(r, 12, 26);
    fraudScore = Math.max(1, Math.min(99, fraudScore));

    const creditScore = Math.max(
      520,
      Math.min(880, between(r, 560, 840) + (alternativeData.educationVerified ? 12 : -10) - Math.round(dti / 3)),
    );

    const riskScore = Math.max(
      3,
      Math.min(
        99,
        Math.round(
          100 -
            ((creditScore - 500) / 380) * 46 -
            (altScore / 100) * 12 -
            Math.min(monthlyIncome / 320000, 1) * 12 +
            Math.min(dti, 60) * 0.35 +
            fraudScore * 0.28 -
            8,
        ),
      ),
    );

    const riskLevel: RiskLevel = riskScore < 35 ? "Low" : riskScore < 62 ? "Medium" : "High";
    const approvalStatus: ApprovalStatus =
      fraudScore > 72 || riskScore > 74 ? "Rejected" : riskScore < 40 && fraudScore < 45 ? "Approved" : "Manual Review";

    const reason =
      approvalStatus === "Approved"
        ? `Strong bureau score (${creditScore}) with a manageable debt-to-income ratio of ${dti}% and low fraud exposure.`
        : approvalStatus === "Rejected"
          ? `Elevated composite risk (${riskScore}/100) driven by ${fraudScore > 72 ? "fraud signals" : "leverage and repayment capacity"}.`
          : `Mixed signals: acceptable credit history offset by a ${dti}% debt-to-income ratio and a fraud score of ${fraudScore}.`;
    const recommendation =
      approvalStatus === "Approved"
        ? "Proceed to sanction at standard pricing. Recommend a 12-month behavioural review."
        : approvalStatus === "Rejected"
          ? "Decline at current terms. Re-apply after 6 months with reduced obligations or a co-applicant."
          : "Route to a senior underwriter. Request income proof and 6 months of bank statements.";

    const day = 1 + (i % 250);
    const appliedAt = new Date(Date.UTC(2026, 0, 1) + day * 86400000 * 0.85).toISOString();
    const loanId = `LN-2026-${String(10248 + i)}`;

    out.push({
      id: `APP${String(i + 1).padStart(4, "0")}`,
      loanId,
      fullName,
      age,
      gender,
      phone: `+91 ${between(r, 70, 99)}${String(between(r, 10000000, 99999999)).padStart(8, "0")}`,
      email: `${first.toLowerCase()}.${fullName.split(" ")[1]!.toLowerCase()}${i}@example.in`,
      city,
      state,
      employmentType,
      company: employmentType === "Self-Employed" ? "Self Employed" : pick(r, COMPANIES),
      designation: pick(r, DESIGNATIONS),
      experienceYears,
      education: pick(r, EDUCATION),
      monthlyIncome,
      loanAmount,
      loanType,
      loanPurpose: pick(r, PURPOSES[loanType]),
      existingLoans,
      monthlyEmi,
      alternativeData,
      fraudIndicators,
      creditScore,
      fraudScore,
      riskScore,
      debtToIncome: dti,
      riskLevel,
      approvalStatus,
      reason,
      recommendation,
      factors: buildFactors({ creditScore, monthlyIncome, dti, fraudScore, altScore, experienceYears }),
      timeline: [
        { label: "Application submitted", description: `${loanType} loan request received via digital channel.`, date: appliedAt },
        { label: "KYC & document check", description: "Identity, address and income documents auto-verified.", date: new Date(new Date(appliedAt).getTime() + 3600000).toISOString() },
        { label: "Alternative data enrichment", description: "Digital footprint and public records ingested.", date: new Date(new Date(appliedAt).getTime() + 7200000).toISOString() },
        { label: "Fraud screening", description: `Composite fraud score computed at ${fraudScore}/100.`, date: new Date(new Date(appliedAt).getTime() + 9000000).toISOString() },
        { label: "AI underwriting decision", description: `${approvalStatus} — risk score ${riskScore}/100.`, date: new Date(new Date(appliedAt).getTime() + 10800000).toISOString() },
      ],
      appliedAt,
    });
  }

  return out;
}
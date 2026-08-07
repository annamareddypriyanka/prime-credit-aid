import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Trash2, SlidersHorizontal, Search, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { mockApi } from "@/lib/mock/api";
import type { ApplicantFilters } from "@/lib/mock/types";
import { compactInr } from "@/lib/format";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/GlassCard";
import { RiskBadge, StatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_shell/applicants/")({
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search["q"] === "string" && search["q"] ? { q: search["q"] } : {},
  head: () => ({
    meta: [
      { title: "Applicant Management — AI Loan Underwriting" },
      { name: "description", content: "Search, filter, sort and manage every loan applicant with risk, fraud and credit context." },
      { property: "og:title", content: "Applicant Management — AI Loan Underwriting" },
      { property: "og:description", content: "Search, filter, sort and manage every loan applicant with risk, fraud and credit context." },
    ],
  }),
  component: ApplicantsPage,
});

const PAGE_SIZE = 12;

function ApplicantsPage() {
  const { q } = Route.useSearch();
  const qc = useQueryClient();
  const [filters, setFilters] = useState<ApplicantFilters>({
    search: q ?? "",
    riskLevel: "all",
    approvalStatus: "all",
    loanType: "all",
    employmentType: "all",
    creditScoreRange: [300, 900],
    fraudScoreRange: [0, 100],
    sortBy: "recent",
  });
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>("Approved");

  const { data, isLoading } = useQuery({
    queryKey: ["applicants", filters],
    queryFn: () => mockApi.listApplicants(filters),
  });

  const del = useMutation({
    mutationFn: (id: string) => mockApi.deleteApplicant(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applicants"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Application deleted");
    },
  });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      mockApi.updateApplicant(id, { approvalStatus: status as never }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applicants"] });
      toast.success("Decision updated");
    },
  });

  const rows = data ?? [];
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const visible = useMemo(() => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [rows, page]);

  const set = <K extends keyof ApplicantFilters>(key: K, value: ApplicantFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="Applicant Management"
        subtitle={`${rows.length} applications match the current filters.`}
        actions={
          <Button asChild className="rounded-xl gradient-brand text-primary-foreground shadow-soft">
            <Link to="/new-application">New Application</Link>
          </Button>
        }
      />

      <SectionCard
        title="Filters"
        description="Refine the portfolio by risk, decision, product and score bands"
        action={
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl"
            onClick={() =>
              setFilters({
                search: "",
                riskLevel: "all",
                approvalStatus: "all",
                loanType: "all",
                employmentType: "all",
                creditScoreRange: [300, 900],
                fraudScoreRange: [0, 100],
                sortBy: "recent",
              })
            }
          >
            <RotateCcw className="size-4" /> Reset
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filters.search ?? ""}
                onChange={(e) => set("search", e.target.value)}
                placeholder="Name, loan ID, city or email"
                className="rounded-xl pl-9"
              />
            </div>
          </div>

          <FilterSelect label="Risk Level" value={filters.riskLevel!} onChange={(v) => set("riskLevel", v as never)} options={["all", "Low", "Medium", "High"]} />
          <FilterSelect label="Approval Status" value={filters.approvalStatus!} onChange={(v) => set("approvalStatus", v as never)} options={["all", "Approved", "Rejected", "Manual Review"]} />
          <FilterSelect label="Loan Type" value={filters.loanType!} onChange={(v) => set("loanType", v as never)} options={["all", "Home", "Personal", "Auto", "Education", "Business", "Gold"]} />
          <FilterSelect label="Employment Type" value={filters.employmentType!} onChange={(v) => set("employmentType", v as never)} options={["all", "Salaried", "Self-Employed", "Government", "Freelancer", "Business Owner"]} />
          <FilterSelect
            label="Sort By"
            value={filters.sortBy!}
            onChange={(v) => set("sortBy", v)}
            options={["recent", "name", "creditHigh", "creditLow", "riskHigh", "fraudHigh", "amountHigh"]}
            labels={{
              recent: "Most recent",
              name: "Name (A–Z)",
              creditHigh: "Credit score (high→low)",
              creditLow: "Credit score (low→high)",
              riskHigh: "Risk score (high→low)",
              fraudHigh: "Fraud score (high→low)",
              amountHigh: "Loan amount (high→low)",
            }}
          />

          <div className="space-y-2">
            <Label className="text-xs">
              Credit Score Range · {filters.creditScoreRange![0]} – {filters.creditScoreRange![1]}
            </Label>
            <Slider
              min={300}
              max={900}
              step={10}
              value={filters.creditScoreRange as number[]}
              onValueChange={(v) => set("creditScoreRange", [v[0]!, v[1]!])}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">
              Fraud Score Range · {filters.fraudScoreRange![0]} – {filters.fraudScoreRange![1]}
            </Label>
            <Slider
              min={0}
              max={100}
              step={1}
              value={filters.fraudScoreRange as number[]}
              onValueChange={(v) => set("fraudScoreRange", [v[0]!, v[1]!])}
            />
          </div>
        </div>
      </SectionCard>

      {isLoading ? (
        <TableSkeleton rows={10} />
      ) : (
        <SectionCard
          title="Applications"
          description={`Page ${page} of ${pages}`}
          action={<SlidersHorizontal className="size-4 text-muted-foreground" />}
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Applicant</TableHead>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Fraud</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="whitespace-nowrap">
                      <p className="font-medium">{a.fullName}</p>
                      <p className="text-xs text-muted-foreground">{a.city}, {a.state}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{a.loanId}</TableCell>
                    <TableCell className="whitespace-nowrap">{a.loanType}</TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">{compactInr(a.loanAmount)}</TableCell>
                    <TableCell className="text-right tabular-nums">{a.creditScore}</TableCell>
                    <TableCell className="text-right tabular-nums">{a.fraudScore}</TableCell>
                    <TableCell><RiskBadge level={a.riskLevel} /></TableCell>
                    <TableCell><StatusBadge status={a.approvalStatus} /></TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button asChild size="icon" variant="ghost" className="size-8 rounded-lg" aria-label="View">
                          <Link to="/applicants/$applicantId" params={{ applicantId: a.id }}>
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 rounded-lg"
                          aria-label="Edit"
                          onClick={() => {
                            setEditId(a.id);
                            setEditStatus(a.approvalStatus);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 rounded-lg text-destructive hover:text-destructive"
                          aria-label="Delete"
                          onClick={() => setDeleteId(a.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-xs text-muted-foreground">
              Showing {visible.length} of {rows.length} applications
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </SectionCard>
      )}

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete application</DialogTitle>
            <DialogDescription>
              This removes the file from the mock underwriting queue. The action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={() => {
                if (deleteId) del.mutate(deleteId);
                setDeleteId(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editId} onOpenChange={(o) => !o && setEditId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Override decision</DialogTitle>
            <DialogDescription>Underwriter overrides are logged against the application timeline.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">Approval Status</Label>
            <Select value={editStatus} onValueChange={setEditStatus}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Approved", "Rejected", "Manual Review"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setEditId(null)}>Cancel</Button>
            <Button
              className="rounded-xl gradient-brand text-primary-foreground"
              onClick={() => {
                if (editId) update.mutate({ id: editId, status: editStatus });
                setEditId(null);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full rounded-xl"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {labels?.[o] ?? (o === "all" ? "All" : o)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
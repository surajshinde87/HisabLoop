import { Icon } from "@/components/ui/icon";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ClaimDetail } from "@/types/api";

type StepState = "done" | "current" | "todo" | "failed";

/** "Reimbursement Stage Pipeline" from the claim-detail design, driven by real timestamps. */
export function ClaimPipeline({ claim }: { claim: ClaimDetail }) {
  const s = claim.status;
  const order = ["DRAFT", "CONFIRMED", "PENDING_APPROVAL", "APPROVED", "IN_BATCH", "PAID"] as const;
  const idx = s === "REJECTED" ? 2 : order.indexOf(s as (typeof order)[number]);
  const state = (i: number): StepState => {
    if (s === "REJECTED" && i === 2) return "failed";
    if (s === "PAID" && i === 5) return "done";
    if (i < idx) return "done";
    if (i === idx) return "current";
    return "todo";
  };
  const steps = [
    { label: "Draft", sub: formatDateTime(claim.createdAt), icon: "edit_note" },
    { label: "Confirmed", sub: claim.confirmedAt ? formatDateTime(claim.confirmedAt) : "By claimant", icon: "fact_check" },
    {
      label: s === "REJECTED" ? "Rejected" : "Approval",
      sub:
        s === "REJECTED"
          ? formatDateTime(claim.rejectedAt)
          : claim.requiredApprovalLevels > 1
            ? `Level ${Math.min(claim.approvalsCompleted + 1, claim.requiredApprovalLevels)} of ${claim.requiredApprovalLevels}`
            : claim.approverName ?? "Manager",
      icon: s === "REJECTED" ? "block" : "approval_delegation",
    },
    { label: "Approved", sub: claim.approvedAt ? formatDateTime(claim.approvedAt) : "Finance sign-off", icon: "verified" },
    { label: "In Batch", sub: claim.batch ? `Batch ${claim.batch.reference}` : "Queue", icon: "inventory" },
    { label: "Paid", sub: claim.paidAt ? formatDateTime(claim.paidAt) : "Bank transfer", icon: "payments" },
  ];
  const doneCount = steps.filter((_, i) => state(i) === "done").length;
  return (
    <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-primary">
            <Icon name="account_tree" className="text-[18px]" />
          </span>
          <h2 className="font-headline-md text-headline-md text-primary">Reimbursement Stage Pipeline</h2>
        </div>
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
          {doneCount} of {steps.length} done
        </span>
      </div>
      <ol className="grid grid-cols-3 gap-y-4 gap-x-2 sm:grid-cols-6">
        {steps.map((step, i) => {
          const st = state(i);
          return (
            <li key={step.label} className={cn("flex flex-col items-center gap-1.5 text-center", st === "todo" && "opacity-40")}>
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full shadow-sm",
                  st === "done" && "bg-secondary text-on-secondary",
                  st === "current" && "bg-warning-soft text-warning-text ring-4 ring-warning-soft/40",
                  st === "failed" && "bg-danger-soft text-danger ring-4 ring-danger-soft/40",
                  st === "todo" && "bg-surface-container text-on-surface-variant",
                )}
              >
                <Icon name={st === "done" ? "check" : step.icon} className="text-[16px]" />
              </div>
              <span className={cn("font-label-md text-label-md font-semibold", st === "current" ? "text-warning-text" : st === "failed" ? "text-danger" : "text-primary")}>
                {i + 1}. {step.label}
              </span>
              <span className="font-label-sm text-[10px] leading-tight text-outline">{step.sub}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

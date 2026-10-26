"use client";

import Link from "next/link";
import { use, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CategoryChip, FlagChips, StatusBadge } from "@/components/app/badges";
import { ReasonDialog } from "@/components/app/reason-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EmptyState, ErrorState, Notice, Skeleton } from "@/components/ui/feedback";
import { Select, Textarea } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { useWorkspace } from "@/features/auth/auth-provider";
import { ClaimForm } from "@/features/claims/claim-form";
import { ClaimPipeline } from "@/features/claims/claim-pipeline";
import { toClaimInput } from "@/features/claims/claim-schema";
import { ReceiptPreview } from "@/features/claims/receipt-preview";
import { useClaimMutation } from "@/features/claims/use-claim-mutation";
import { useCategories } from "@/hooks/use-company-data";
import { ApiError, errorMessage } from "@/lib/api-client";
import { formatDate, formatDateTime, formatINRExact } from "@/lib/format";
import { invalidateClaimData, qk } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { approvalService } from "@/services/approval-service";
import { claimsService } from "@/services/claims-service";
import { receiptService } from "@/services/receipt-service";
import type { ClaimDetail, ItcStatus, PolicyCheck } from "@/types/api";

const CHECK_TITLE: Record<PolicyCheck["type"], string> = {
  CATEGORY_LIMIT: "Category limit",
  DUPLICATE: "Duplicate detection",
  GSTIN: "Supplier GSTIN",
  RECEIPT: "Receipt evidence",
};
const ACTION_LABEL: Record<string, string> = {
  CLAIM_CREATED: "Claim created",
  RECEIPT_UPLOADED: "Receipt uploaded",
  RECEIPT_PROCESSED: "Receipt processed",
  CLAIM_UPDATED: "Details edited",
  CLAIM_REOPENED: "Reopened for editing",
  CLAIM_CONFIRMED: "Confirmed by claimant",
  CLAIM_SUBMITTED: "Submitted for approval",
  APPROVAL_LEVEL_RECORDED: "Approval level recorded",
  CLAIM_APPROVED: "Approved",
  CLAIM_REJECTED: "Rejected",
  CHANGES_REQUESTED: "Changes requested",
  COMMENT_ADDED: "Comment added",
  DUPLICATE_RESOLVED: "Duplicate warning resolved",
  ITC_REVIEWED: "ITC eligibility reviewed",
  CLAIM_BATCHED: "Added to reimbursement batch",
  CLAIM_PAID: "Marked paid",
};

export default function ClaimDetailPage({ params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = use(params);
  const ws = useWorkspace();
  const q = useQuery({ queryKey: qk.claim(ws.companyId, claimId), queryFn: () => claimsService.get(ws.companyId, claimId) });

  if (q.isLoading)
    return (
      <div className="space-y-4 pt-space-md">
        <Skeleton className="h-28" />
        <div className="grid gap-4 lg:grid-cols-12">
          <Skeleton className="h-[520px] lg:col-span-5" />
          <Skeleton className="h-[520px] lg:col-span-7" />
        </div>
      </div>
    );
  if (q.isError)
    return (
      <Card className="mt-space-md">
        {q.error instanceof ApiError && q.error.status === 404 ? (
          <EmptyState icon="search_off" title="Claim not found" description="It may not exist, or it is outside what your role can see." action={<Link href="/claims" className="text-brand-link">Back to claims</Link>} />
        ) : (
          <ErrorState error={q.error} onRetry={() => void q.refetch()} />
        )}
      </Card>
    );
  return <ClaimView claim={q.data as ClaimDetail} companyId={ws.companyId} />;
}

function ClaimView({ claim, companyId }: { claim: ClaimDetail; companyId: string }) {
  const can = (a: string) => claim.availableActions.includes(a as never);
  const [dialog, setDialog] = useState<null | "edit" | "reject" | "changes" | "ask" | "approve" | "respond">(null);
  const [comment, setComment] = useState("");
  const [ack, setAck] = useState(false);
  const [approveNote, setApproveNote] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const categories = useCategories();
  const qc = useQueryClient();
  const refresh = () => invalidateClaimData(qc, companyId);
  const blocking = claim.policyChecks.filter((c) => c.blocking);

  const confirm = useClaimMutation(companyId, () => claimsService.confirm(companyId, claim.id), (c) => `${c.reference} confirmed`);
  const submit = useClaimMutation(companyId, () => claimsService.submit(companyId, claim.id), (c) => `${c.reference} sent to ${c.approverName ?? "your approver"}`);
  const approve = useClaimMutation(
    companyId,
    (v: { comment?: string; ack: boolean }) => approvalService.approve(companyId, claim.id, v.comment, v.ack),
    (c) => (c.status === "APPROVED" ? `${c.reference} approved` : `Level ${c.approvalsCompleted} approved – awaiting admin`),
  );
  const addComment = useClaimMutation(companyId, (v: { body: string; kind: "COMMENT" | "CLARIFICATION_REQUEST" | "CLARIFICATION_RESPONSE" }) => claimsService.comment(companyId, claim.id, v.body, v.kind), () => "Comment added");
  const resolveDup = useClaimMutation(companyId, (dup: boolean) => claimsService.resolveDuplicate(companyId, claim.id, dup), (c) => (c.duplicateStatus === "CONFIRMED_DUPLICATE" ? "Marked as duplicate" : "Duplicate warning cleared"));
  const itc = useClaimMutation(companyId, (s: ItcStatus) => claimsService.reviewItc(companyId, claim.id, s), () => "ITC review saved");
  const upload = useClaimMutation(
    companyId,
    async (file: File) => {
      const r = await receiptService.upload(companyId, claim.id, file);
      return receiptService.process(companyId, r.id);
    },
    () => "Receipt uploaded",
  );

  const receipt = claim.receipts[claim.receipts.length - 1];
  const confidence = receipt?.confidence;
  const categoryLabel = categories.data?.find((c) => c.code === claim.categoryCode)?.label ?? claim.categoryCode;

  return (
    <>
      <div className="flex flex-col gap-space-sm pt-space-md">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/claims" className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container-lowest px-2.5 py-1 text-on-surface-variant shadow-sm transition-all hover:bg-surface-container hover:text-primary">
            <Icon name="arrow_back" className="text-[16px]" />
            <span className="font-label-md text-label-md">Back to Claims</span>
          </Link>
          <span className="font-label-md text-label-md text-outline-variant">/</span>
          <span className="font-label-md text-label-md font-semibold text-secondary">#{claim.reference}</span>
        </div>

        <Card className="flex flex-col justify-between gap-space-md p-space-md lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-primary md:font-headline-lg md:text-headline-lg">Claim #{claim.reference}</h1>
              <StatusBadge status={claim.status} className="h-7 px-2.5 text-label-md" />
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary-fixed px-2.5 py-1 font-label-sm text-label-sm text-on-secondary-fixed">
                <Icon name={claim.source === "WHATSAPP" ? "chat" : claim.source === "TEXT" ? "sms" : "language"} className="text-[14px]" />
                {claim.source === "WHATSAPP" ? "WhatsApp Submission" : claim.source === "TEXT" ? "Text claim" : "Web submission"}
              </span>
            </div>
            <p className="flex flex-wrap items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
              <Icon name="person" className="text-[16px] text-outline" />
              <span>
                Claimant <strong className="font-semibold text-on-surface">{claim.employee.name}</strong>
                {claim.employee.designation ? ` (${claim.employee.designation})` : ""}
              </span>
              <span className="text-outline">·</span>
              <span>Created {formatDateTime(claim.createdAt)}</span>
              {claim.submittedAt && (
                <>
                  <span className="text-outline">·</span>
                  <span>Submitted {formatDateTime(claim.submittedAt)}</span>
                </>
              )}
            </p>
            {claim.flags.length > 0 && (
              <div className="pt-1">
                <FlagChips flags={claim.flags} max={6} quiet={[]} />
              </div>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            {can("EDIT") && (
              <Button variant="secondary" onClick={() => setDialog("edit")}>
                <Icon name="edit" className="text-[18px]" /> Edit details
              </Button>
            )}
            {can("CONFIRM") && (
              <Button onClick={() => confirm.mutate(undefined)} loading={confirm.isPending}>
                <Icon name="fact_check" className="text-[18px]" /> Confirm details
              </Button>
            )}
            {can("SUBMIT") && (
              <Button variant="accent" onClick={() => submit.mutate(undefined)} loading={submit.isPending}>
                <Icon name="send" className="text-[18px]" /> Submit for approval
              </Button>
            )}
            {can("RESPOND_CLARIFICATION") && (
              <Button variant="secondary" onClick={() => setDialog("respond")}>
                <Icon name="reply" className="text-[18px]" /> Answer question
              </Button>
            )}
            {can("REQUEST_CLARIFICATION") && (
              <Button variant="secondary" onClick={() => setDialog("ask")}>
                <Icon name="help_outline" className="text-[18px] text-on-surface-variant" /> Ask a Question
              </Button>
            )}
            {can("REQUEST_CHANGES") && (
              <Button variant="secondary" onClick={() => setDialog("changes")}>
                <Icon name="undo" className="text-[18px] text-on-surface-variant" /> Send back
              </Button>
            )}
            {can("REJECT") && (
              <Button variant="danger-ghost" onClick={() => setDialog("reject")}>
                <Icon name="block" className="text-[18px]" /> Reject Claim
              </Button>
            )}
            {can("APPROVE") && (
              <Button variant="accent" className="px-5 shadow-md" onClick={() => (blocking.length ? setDialog("approve") : approve.mutate({ ack: false }))} loading={approve.isPending}>
                <Icon name="check_circle" className="text-[18px]" />
                {claim.requiredApprovalLevels > 1 ? `Approve (level ${claim.approvalsCompleted + 1} of ${claim.requiredApprovalLevels})` : "Approve Claim"}
              </Button>
            )}
          </div>
        </Card>
        {claim.status === "REJECTED" && claim.rejectionReason && (
          <Notice tone="danger" icon="block">
            <strong>Rejected:</strong> {claim.rejectionReason}
          </Notice>
        )}
        {claim.clarificationRequested && (
          <Notice tone="warning" icon="forum">
            The approver asked a question about this claim. See the conversation below{claim.status === "DRAFT" ? ", update the claim and confirm it again" : ""}.
          </Notice>
        )}
        {claim.status === "DRAFT" && !claim.clarificationRequested && (
          <Notice tone="info" icon="edit_note">
            This claim is a draft. Check the details{receipt?.processingStatus === "NEEDS_REVIEW" ? " (the receipt could not be read automatically — enter them from the bill)" : ""}, then confirm and submit it for approval.
          </Notice>
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
        <div className="flex flex-col gap-space-md lg:sticky lg:top-20 lg:col-span-5">
          {receipt ? (
            <ReceiptPreview companyId={companyId} receipt={receipt} />
          ) : (
            <Card className="p-space-lg">
              <EmptyState
                icon="receipt"
                title="No receipt attached"
                description={claim.source === "TEXT" ? `Text claim: “${claim.rawText ?? claim.description ?? ""}”` : "Upload the bill so approvers and your CA can verify it."}
                action={
                  can("UPLOAD_RECEIPT") ? (
                    <Button variant="secondary" onClick={() => fileRef.current?.click()} loading={upload.isPending}>
                      <Icon name="upload_file" className="text-[18px]" /> Upload receipt
                    </Button>
                  ) : undefined
                }
              />
            </Card>
          )}
          {receipt && can("UPLOAD_RECEIPT") && (
            <Button variant="ghost" onClick={() => fileRef.current?.click()} loading={upload.isPending}>
              <Icon name="upload_file" className="text-[18px]" /> Replace / add receipt
            </Button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload.mutate(f);
              e.target.value = "";
            }}
          />
          {can("REVIEW_ITC") && (
            <Card className="space-y-3 p-space-md">
              <div className="flex items-center gap-2">
                <Icon name="account_balance" className="text-secondary" />
                <h3 className="font-headline-sm text-headline-sm text-primary">Input tax credit review</h3>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                ITC is never assumed. Mark eligibility after checking the invoice (e.g. blocked credits under Sec 17(5)).
              </p>
              <Select value={claim.itcStatus} onChange={(e) => itc.mutate(e.target.value as ItcStatus)} disabled={itc.isPending} aria-label="ITC eligibility">
                <option value="UNREVIEWED">Not reviewed</option>
                <option value="ELIGIBLE">Eligible for ITC</option>
                <option value="INELIGIBLE">Not eligible</option>
                <option value="NOT_APPLICABLE">Not applicable</option>
              </Select>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-space-md lg:col-span-7">
          <Card className="flex flex-col gap-space-md p-space-lg">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-primary">
                  <Icon name="auto_awesome" className="text-[18px]" />
                </span>
                <div>
                  <h2 className="font-headline-md text-headline-md text-primary">Claim Details</h2>
                  <p className="font-label-sm text-label-sm font-normal text-on-surface-variant">
                    {receipt?.processingStatus === "COMPLETED" ? "Extracted from the receipt and confirmed by the claimant" : "Entered by the claimant"}
                  </p>
                </div>
              </div>
              {confidence != null && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container/40 px-3 py-1 font-label-md text-label-md font-semibold text-on-secondary-container">
                  <Icon name="verified" className="text-[15px] text-secondary" /> Extraction confidence {confidence}%
                </span>
              )}
            </div>
            <dl className="grid grid-cols-1 gap-space-md md:grid-cols-2">
              <Detail label="Vendor name" value={claim.vendorName ?? "—"} />
              <Detail label="Bill date" value={formatDate(claim.receiptDate)} />
              <div className="flex items-center justify-between rounded-lg bg-surface-container p-3 md:col-span-2">
                <div className="flex flex-col gap-0.5">
                  <dt className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Total claim amount</dt>
                  <dd className="font-currency-display text-currency-display font-bold text-primary">{formatINRExact(claim.totalAmount)}</dd>
                </div>
                <CategoryChip code={claim.categoryCode} />
              </div>
              <Detail label="Taxable value" value={claim.taxableAmount != null ? formatINRExact(claim.taxableAmount) : "—"} money />
              <div className="flex flex-col gap-1 rounded-lg bg-surface-container-low p-3">
                <div className="flex items-center justify-between">
                  <dt className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Total GST</dt>
                  <dd className="font-currency-md text-currency-md font-semibold text-primary">{formatINRExact(claim.gstAmount)}</dd>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {claim.igstAmount > 0 ? `IGST ${formatINRExact(claim.igstAmount)}` : claim.gstAmount > 0 ? `CGST ${formatINRExact(claim.cgstAmount)} + SGST ${formatINRExact(claim.sgstAmount)}` : "No GST on this bill"}
                </span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-surface-container-low p-3">
                <dt className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Supplier GSTIN</dt>
                <dd className="flex items-center gap-1.5">
                  <span className="font-label-md text-label-md font-semibold tracking-wide text-primary">{claim.vendorGstin ?? "Not captured"}</span>
                  {claim.gstinStatus === "VALID" && <Icon name="verified" className="text-[16px] text-secondary" label="Valid format" />}
                </dd>
                <span className={cn("font-label-sm text-[10px] font-medium", claim.gstinStatus === "VALID" ? "text-secondary" : claim.gstinStatus === "NOT_APPLICABLE" || claim.gstinStatus === "NOT_CHECKED" ? "text-outline" : "text-error")}>
                  {{ VALID: "Format valid · registration not verified", MISSING: "Missing — GST charged without GSTIN", INVALID: "Does not match GSTIN format", NOT_APPLICABLE: "Not required (no GST)", NOT_CHECKED: "Validation disabled by policy" }[claim.gstinStatus]}
                </span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-surface-container-low p-3">
                <dt className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Expense category</dt>
                <dd className="font-body-md text-body-md font-semibold text-primary">{categoryLabel}</dd>
              </div>
              <Detail label="Payment method" value={claim.paymentMode?.replace("_", " ") ?? "—"} />
              <Detail label="Approval levels" value={`${claim.approvalsCompleted} of ${claim.requiredApprovalLevels} complete`} />
              <div className="flex flex-col gap-1 rounded-lg bg-surface-container-low p-3 md:col-span-2">
                <dt className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Purpose / notes</dt>
                <dd className="font-body-md text-body-md italic text-on-surface">{claim.description ? `“${claim.description}”` : "—"}</dd>
              </div>
            </dl>
          </Card>

          <Card className="flex flex-col gap-space-md p-space-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-container/50 text-on-secondary-container">
                  <Icon name="policy" className="text-[18px]" />
                </span>
                <h2 className="font-headline-md text-headline-md text-primary">Policy & Audit Compliance</h2>
              </div>
              {(() => {
                const passed = claim.policyChecks.filter((c) => c.result === "PASS").length;
                const all = claim.policyChecks.length;
                return (
                  <span className={cn("rounded-full px-2.5 py-1 font-label-md text-label-md font-semibold", passed === all ? "bg-success-soft text-success" : "bg-warning-soft text-warning-text")}>
                    {passed === all ? `All Checks Passed (${passed}/${all})` : `${passed}/${all} checks passed`}
                  </span>
                );
              })()}
            </div>
            <ul className="space-y-3">
              {claim.policyChecks.map((c) => (
                <li key={c.type} className="flex items-start gap-3 rounded-lg bg-surface-container-low p-3 transition-colors hover:bg-surface-container">
                  <div
                    className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                      c.result === "PASS" ? "bg-success-soft text-success" : c.result === "WARN" ? "bg-warning-soft text-warning-text" : "bg-danger-soft text-danger",
                    )}
                  >
                    <Icon name={c.result === "PASS" ? "check" : c.result === "WARN" ? "priority_high" : "close"} className="text-[16px]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-label-lg text-label-lg font-semibold text-primary">{CHECK_TITLE[c.type]}</span>
                      {c.blocking && <span className="font-label-sm text-label-sm font-semibold text-error">Needs review</span>}
                    </div>
                    <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">{c.message}</p>
                    {c.type === "DUPLICATE" && claim.duplicateOf && (
                      <Link href={`/claims/${claim.duplicateOf.id}`} className="mt-1 inline-flex items-center gap-1 font-label-md text-label-md text-brand-link hover:underline">
                        Open {claim.duplicateOf.reference} <Icon name="open_in_new" className="text-[14px]" />
                      </Link>
                    )}
                    {c.type === "DUPLICATE" && can("RESOLVE_DUPLICATE") && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button size="sm" variant="ghost" loading={resolveDup.isPending} onClick={() => resolveDup.mutate(false)}>
                          Not a duplicate
                        </Button>
                        <Button size="sm" variant="danger-ghost" loading={resolveDup.isPending} onClick={() => resolveDup.mutate(true)}>
                          Confirm duplicate
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <ClaimPipeline claim={claim} />

          {claim.approvals.length > 0 && (
            <Card className="space-y-3 p-space-lg">
              <h2 className="font-headline-md text-headline-md text-primary">Approval History</h2>
              <ul className="space-y-2">
                {claim.approvals.map((a) => (
                  <li key={a.id} className="flex items-start justify-between gap-3 rounded-lg bg-surface-container-low p-3">
                    <div>
                      <p className="font-label-lg text-label-lg text-on-surface">
                        Level {a.level} · {a.approverName}{" "}
                        <span className={cn("ml-1 rounded-full px-2 py-0.5 font-label-sm text-label-sm", a.decision === "APPROVED" ? "bg-success-soft text-success" : a.decision === "REJECTED" ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning-text")}>
                          {a.decision === "CHANGES_REQUESTED" ? "Sent back" : a.decision.toLowerCase()}
                        </span>
                      </p>
                      {a.comment && <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">“{a.comment}”</p>}
                    </div>
                    <span className="shrink-0 font-body-sm text-body-sm text-outline">{formatDateTime(a.decidedAt)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="space-y-3 p-space-lg">
            <h2 className="font-headline-md text-headline-md text-primary">Comments</h2>
            {claim.comments.length === 0 && <p className="font-body-sm text-body-sm text-on-surface-variant">No comments yet.</p>}
            <ul className="space-y-2">
              {claim.comments.map((c) => (
                <li key={c.id} className={cn("rounded-lg p-3", c.kind === "CLARIFICATION_REQUEST" ? "bg-warning-soft/60" : c.kind === "CLARIFICATION_RESPONSE" ? "bg-secondary-container/30" : "bg-surface-container-low")}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-label-md text-label-md text-on-surface">
                      {c.authorName}
                      {c.kind === "CLARIFICATION_REQUEST" && <span className="ml-2 font-label-sm text-label-sm text-warning-text">asked</span>}
                      {c.kind === "CLARIFICATION_RESPONSE" && <span className="ml-2 font-label-sm text-label-sm text-secondary">replied</span>}
                    </span>
                    <span className="font-body-sm text-body-sm text-outline">{formatDateTime(c.createdAt)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-line font-body-md text-body-md text-on-surface-variant">{c.body}</p>
                </li>
              ))}
            </ul>
            {can("COMMENT") && (
              <form
                className="flex flex-col gap-2 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!comment.trim()) return;
                  addComment.mutate({ body: comment.trim(), kind: "COMMENT" }, { onSuccess: () => setComment("") });
                }}
              >
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment for the claimant, approver or CA…" rows={2} className="flex-1" aria-label="Comment" maxLength={2000} />
                <Button type="submit" variant="secondary" loading={addComment.isPending} className="self-end">
                  <Icon name="send" className="text-[18px]" /> Post
                </Button>
              </form>
            )}
          </Card>

          {claim.auditTrail.length > 0 && (
            <Card className="space-y-3 p-space-lg">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-primary">
                  <Icon name="history_edu" className="text-[18px]" />
                </span>
                <div>
                  <h2 className="font-headline-md text-headline-md text-primary">Immutable Audit Trail</h2>
                  <p className="font-label-sm text-label-sm font-normal text-on-surface-variant">Append-only, hash-chained ledger events</p>
                </div>
              </div>
              <ol className="relative ml-3 space-y-4 border-l-2 border-surface-container pl-5">
                {claim.auditTrail.map((e) => (
                  <li key={e.id} className="relative">
                    <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-surface-container-lowest bg-secondary" />
                    <div className="flex flex-wrap items-center justify-between gap-x-3">
                      <span className="font-label-lg text-label-lg text-on-surface">{ACTION_LABEL[e.action] ?? e.action}</span>
                      <span className="font-body-sm text-body-sm text-outline">{formatDateTime(e.occurredAt)}</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {e.actorName}
                      {e.previousStatus && e.newStatus && e.previousStatus !== e.newStatus ? ` · ${e.previousStatus} → ${e.newStatus}` : ""}
                    </p>
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={dialog === "edit"} onOpenChange={(v) => setDialog(v ? "edit" : null)}>
        <DialogContent title={`Edit ${claim.reference}`} description={claim.status === "CONFIRMED" ? "Editing a confirmed claim returns it to draft; confirm it again afterwards." : undefined} className="max-w-2xl">
          <ClaimForm
            initial={claim}
            submitLabel="Save changes"
            onCancel={() => setDialog(null)}
            onSubmit={async (v) => {
              try {
                const updated = await claimsService.update(companyId, claim.id, { ...toClaimInput(v), version: claim.version });
                qc.setQueryData(qk.claim(companyId, claim.id), updated);
                await refresh();
                toast.success("Claim updated");
                setDialog(null);
              } catch (e) {
                toast.error(errorMessage(e));
              }
            }}
          />
        </DialogContent>
      </Dialog>

      <ReasonDialog
        open={dialog === "reject"}
        onOpenChange={(v) => setDialog(v ? "reject" : null)}
        title={`Reject ${claim.reference}?`}
        description="Rejection is final. The claimant sees your reason."
        label="Reason for rejection"
        placeholder="e.g. Personal expense, not covered by policy"
        confirmLabel="Reject claim"
        variant="danger"
        onConfirm={async (reason) => {
          await approvalService.reject(companyId, claim.id, reason);
          await refresh();
          toast.success(`${claim.reference} rejected`);
        }}
      />
      <ReasonDialog
        open={dialog === "changes"}
        onOpenChange={(v) => setDialog(v ? "changes" : null)}
        title="Send back for changes"
        description="The claim returns to the claimant as a draft. They update it and resubmit."
        label="What should be changed?"
        confirmLabel="Send back"
        onConfirm={async (reason) => {
          await approvalService.requestChanges(companyId, claim.id, reason);
          await refresh();
          toast.success("Sent back to the claimant");
        }}
      />
      <ReasonDialog
        open={dialog === "ask"}
        onOpenChange={(v) => setDialog(v ? "ask" : null)}
        title="Ask the claimant a question"
        description="The claim stays in your inbox while you wait for the answer."
        label="Your question"
        placeholder="e.g. Who attended this client lunch?"
        confirmLabel="Send question"
        onConfirm={async (body) => {
          await claimsService.comment(companyId, claim.id, body, "CLARIFICATION_REQUEST");
          await refresh();
          toast.success("Question sent");
        }}
      />
      <ReasonDialog
        open={dialog === "respond"}
        onOpenChange={(v) => setDialog(v ? "respond" : null)}
        title="Answer the approver"
        label="Your answer"
        confirmLabel="Send answer"
        onConfirm={async (body) => {
          await claimsService.comment(companyId, claim.id, body, "CLARIFICATION_RESPONSE");
          await refresh();
          toast.success("Answer sent");
        }}
      />
      <Dialog open={dialog === "approve"} onOpenChange={(v) => setDialog(v ? "approve" : null)}>
        <DialogContent title={`Approve ${claim.reference} with open issues?`} description="These checks need a conscious decision before approval.">
          <div className="space-y-4">
            <ul className="space-y-2">
              {blocking.map((b) => (
                <li key={b.type}>
                  <Notice tone="danger" icon="warning">
                    <strong>{CHECK_TITLE[b.type]}:</strong> {b.message}
                  </Notice>
                </li>
              ))}
            </ul>
            <Textarea value={approveNote} onChange={(e) => setApproveNote(e.target.value)} placeholder="Reason for approving as an exception (recorded in the audit trail)" aria-label="Approval note" rows={2} />
            <label className="flex items-start gap-2 font-body-md text-body-md text-on-surface">
              <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-1 h-4 w-4" />I have reviewed these issues and approve this claim as an exception.
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDialog(null)}>
                Cancel
              </Button>
              <Button
                variant="accent"
                disabled={!ack || approveNote.trim().length < 3}
                loading={approve.isPending}
                onClick={() => approve.mutate({ comment: approveNote.trim(), ack: true }, { onSuccess: () => setDialog(null) })}
              >
                Approve as exception
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Detail({ label, value, money }: { label: string; value: string; money?: boolean }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-surface-container-low p-3">
      <dt className="font-label-sm text-label-sm uppercase tracking-wider text-outline">{label}</dt>
      <dd className={cn("font-body-md text-body-md font-semibold text-primary", money && "font-currency-md text-currency-md text-on-surface")}>{value}</dd>
    </div>
  );
}

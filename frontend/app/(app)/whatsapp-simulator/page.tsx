"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CategoryChip, StatusBadge } from "@/components/app/badges";
import { ReasonDialog } from "@/components/app/reason-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EmptyState, Notice, Spinner } from "@/components/ui/feedback";
import { Icon } from "@/components/ui/icon";
import { useAuth, useWorkspace } from "@/features/auth/auth-provider";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/features/auth/demo-accounts";
import { ClaimForm } from "@/features/claims/claim-form";
import { toClaimInput } from "@/features/claims/claim-schema";
import { BotBubble, KeyValues, QuickReplies, QuickReply, ReceiptThumb, Typing, UserBubble } from "@/features/simulator/chat-bubbles";
import { errorMessage } from "@/lib/api-client";
import { env } from "@/lib/env";
import { formatDate, formatINR, formatINRExact } from "@/lib/format";
import { invalidateClaimData, qk } from "@/lib/query-keys";
import { cn, firstName } from "@/lib/utils";
import { approvalService } from "@/services/approval-service";
import { authService } from "@/services/auth-service";
import { claimsService } from "@/services/claims-service";
import { messagingService } from "@/services/messaging-service";
import { receiptService } from "@/services/receipt-service";
import type { ClaimDetail, PendingApproval, WhatsAppMessage } from "@/types/api";

type View = "employee" | "manager";
const POLL_MS = 5000;

const SCENARIOS = [
  { id: 1, title: "Uber Taxi Receipt", tag: "OCR", tagCls: "bg-secondary-container text-on-secondary-container", desc: "Standard travel receipt with GST split and one-tap confirmation.", file: "uber_trip_sample.png" },
  { id: 2, title: "Swiggy Lunch Bill", tag: "Duplicate Flag", tagCls: "bg-error-container text-on-error-container", desc: "Same bill was already claimed – caught by the receipt fingerprint.", file: "swiggy_lunch_sample.png" },
  { id: 3, title: "Auto Rickshaw Cash", tag: "Text-Only", tagCls: "bg-surface-container text-on-surface-variant", desc: 'Plain text, no bill: "Auto fare ₹180 to customer warehouse cash".', text: "Auto fare ₹180 to customer warehouse cash" },
  { id: 4, title: "Client Dinner ₹5,400", tag: "> Policy Max", tagCls: "bg-surface-container-high text-primary", desc: "Over the food limit and above ₹5,000, so it needs two approval levels.", file: "orchid_client_dinner_sample.png" },
] as const;

function sinceKey(companyId: string, userId: string) {
  return `hl.sim.since.${companyId}.${userId}`;
}
function readSince(key: string): string {
  try {
    const v = window.localStorage.getItem(key);
    if (v) return v;
  } catch {
    /* storage unavailable */
  }
  return new Date(Date.now() - 24 * 3600 * 1000).toISOString();
}

export default function SimulatorPage() {
  const ws = useWorkspace();
  const { session, setSession, selectCompany } = useAuth();
  const qc = useQueryClient();
  const canSubmit = ws.can("CREATE_CLAIM") && ws.kind === "MEMBER";
  const canApprove = ws.can("APPROVE_CLAIMS");
  const [view, setView] = useState<View>(canSubmit ? "employee" : "manager");
  const key = sinceKey(ws.companyId, session?.user.id ?? "");
  const [since, setSince] = useState<string>(() => (typeof window === "undefined" ? new Date().toISOString() : readSince(key)));
  const [typing, setTyping] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<ClaimDetail | null>(null);
  const [rejecting, setRejecting] = useState<PendingApproval | null>(null);
  const [asking, setAsking] = useState<PendingApproval | null>(null);
  const [decisions, setDecisions] = useState<{ id: string; at: string; text: string }[]>([]);
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<HTMLDivElement>(null);

  // Reset the persona view / transcript window when the user or company changes.
  const [viewFor, setViewFor] = useState(`${ws.companyId}|${canSubmit}`);
  if (viewFor !== `${ws.companyId}|${canSubmit}`) {
    setViewFor(`${ws.companyId}|${canSubmit}`);
    setView(canSubmit ? "employee" : "manager");
  }
  const [sinceFor, setSinceFor] = useState(key);
  if (sinceFor !== key) {
    setSinceFor(key);
    setSince(readSince(key));
  }

  // ---- data (all from the real API; nothing is kept only in the browser)
  const mine = useQuery({
    queryKey: qk.claims(ws.companyId, { employeeId: ws.membershipId ?? undefined, source: ["WHATSAPP", "TEXT"], size: 10, sort: "claimNumber,desc" }),
    queryFn: () => claimsService.list(ws.companyId, { employeeId: ws.membershipId ?? undefined, source: ["WHATSAPP", "TEXT"], size: 10, sort: "claimNumber,desc" }),
    enabled: view === "employee" && canSubmit,
    refetchInterval: POLL_MS,
  });
  const sessionClaims = useMemo(() => (mine.data?.items ?? []).filter((c) => c.createdAt >= since).sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [mine.data, since]);
  const details = useQueries({
    queries: sessionClaims.map((c) => ({ queryKey: qk.claim(ws.companyId, c.id), queryFn: () => claimsService.get(ws.companyId, c.id), refetchInterval: POLL_MS })),
  });
  const inbox = useQuery({ queryKey: qk.approvals(ws.companyId), queryFn: () => approvalService.inbox(ws.companyId), enabled: view === "manager" && canApprove, refetchInterval: POLL_MS });
  const messages = useQuery({ queryKey: [...qk.messages(ws.companyId), since], queryFn: () => messagingService.messages(ws.companyId, since), refetchInterval: POLL_MS });
  const status = useQuery({ queryKey: ["whatsapp", ws.companyId, "status"], queryFn: () => messagingService.status(ws.companyId) });

  const claimDetails = details.map((d) => d.data).filter((d): d is ClaimDetail => Boolean(d));
  const selectedId = selected ?? (view === "employee" ? claimDetails[claimDetails.length - 1]?.id : inbox.data?.[0]?.claim.id) ?? null;
  const selectedClaim = useQuery({ queryKey: qk.claim(ws.companyId, selectedId ?? ""), queryFn: () => claimsService.get(ws.companyId, selectedId as string), enabled: Boolean(selectedId), refetchInterval: POLL_MS });

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "smooth" });
  }, [claimDetails.length, messages.data?.length, inbox.data?.length, typing, decisions.length, view]);

  const refresh = async () => {
    await invalidateClaimData(qc, ws.companyId);
  };
  const run = async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
    setTyping(true);
    try {
      return await fn();
    } catch (e) {
      toast.error(errorMessage(e));
      return undefined;
    } finally {
      await refresh();
      setTyping(false);
    }
  };

  // ---- employee actions
  async function sendFile(file: File, caption?: string) {
    await run(async () => {
      const draft = await claimsService.create(ws.companyId, { categoryCode: "OTHER", source: "WHATSAPP", description: caption });
      const r = await receiptService.upload(ws.companyId, draft.id, file);
      const processed = await receiptService.process(ws.companyId, r.id);
      setSelected(processed.id);
      return processed;
    });
  }
  async function sendSample(name: string) {
    const res = await fetch(`/sample-receipts/${name}`);
    const blob = await res.blob();
    await sendFile(new File([blob], name, { type: blob.type || "image/png" }));
  }
  async function sendText(t: string) {
    if (!t.trim()) return;
    await run(async () => {
      const c = await claimsService.createFromText(ws.companyId, t.trim(), "WHATSAPP");
      setSelected(c.id);
      return c;
    });
  }
  async function confirmAndSubmit(c: ClaimDetail) {
    await run(async () => {
      if (c.status === "DRAFT") await claimsService.confirm(ws.companyId, c.id);
      return claimsService.submit(ws.companyId, c.id);
    });
  }

  // ---- manager actions
  const approve = useMutation({
    mutationFn: (p: PendingApproval) => approvalService.approve(ws.companyId, p.claim.id, "Approved on WhatsApp", p.hasBlockingIssues),
    onMutate: () => setTyping(true),
    onSuccess: (c, p) =>
      setDecisions((d) => [
        ...d,
        {
          id: c.id + c.status + c.approvalsCompleted,
          at: new Date().toISOString(),
          text:
            c.status === "APPROVED"
              ? `✅ Approved ${c.reference} (${formatINR(c.totalAmount)}). ${firstName(p.claim.employee.name)} has been notified – it will be paid in the next batch.`
              : `✅ Level ${c.approvalsCompleted} approved for ${c.reference}. It now needs a second approval from a company admin.`,
        },
      ]),
    onError: (e) => toast.error(errorMessage(e)),
    onSettled: async () => {
      await refresh();
      setTyping(false);
    },
  });

  async function switchPersona(email: string) {
    try {
      const res = await authService.login(email, DEMO_PASSWORD);
      setSession(res.session);
      const same = res.session.workspaces.find((w) => w.companyId === ws.companyId);
      if (same) selectCompany(same.companyId);
      qc.clear();
      toast.success(`Now signed in as ${res.session.user.fullName}`);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  function reset() {
    const now = new Date().toISOString();
    try {
      window.localStorage.setItem(key, now);
    } catch {
      /* ignore */
    }
    setSince(now);
    setSelected(null);
    setDecisions([]);
    toast.message("Chat cleared", { description: "Earlier claims are kept – they stay in Claims, Approvals and the Audit log." });
  }

  // ---- transcript
  const transcript: { at: string; node: ReactNode }[] = [];
  const msgs: WhatsAppMessage[] = (messages.data ?? []).filter((m) => (view === "manager" ? m.template !== "APPROVAL_REQUESTED" : m.template !== "APPROVAL_REQUESTED"));
  if (view === "employee") {
    for (const c of claimDetails) {
      const receipt = c.receipts[c.receipts.length - 1];
      transcript.push({
        at: c.createdAt,
        node: (
          <UserBubble key={`u-${c.id}`} at={c.createdAt}>
            {c.source === "TEXT" ? (
              <p className="px-1.5 pt-1 text-[13px]">{c.rawText}</p>
            ) : (
              <ReceiptThumb companyId={ws.companyId} receiptId={receipt?.id} filename={receipt?.originalFilename ?? "receipt"} caption={null} />
            )}
          </UserBubble>
        ),
      });
      const warnings = c.policyChecks.filter((p) => p.result !== "PASS" && !(p.type === "RECEIPT" && c.source === "TEXT"));
      const unread = receipt?.processingStatus === "NEEDS_REVIEW" || (c.source !== "TEXT" && !c.vendorName);
      transcript.push({
        at: c.createdAt + "z",
        node: (
          <div key={`b-${c.id}`} onClick={() => setSelected(c.id)} className="cursor-pointer">
            <BotBubble
              at={receipt?.processedAt ?? c.createdAt}
              title={
                <>
                  <Icon name="auto_awesome" className="text-[15px]" /> {c.source === "TEXT" ? "HisabLoop understood your message" : "HisabLoop extracted bill"} · {c.reference}
                </>
              }
            >
              {unread ? (
                <p className="text-[12px] text-[#d1d7db]">I couldn&apos;t read this receipt automatically. Tap “Edit details” to enter the amount, vendor and date.</p>
              ) : (
                <>
                  <KeyValues
                    rows={[
                      ["Amount", formatINRExact(c.totalAmount), "font-bold text-[13px]"],
                      ["Vendor", c.vendorName ?? c.description ?? "—"],
                      ["Category", c.categoryCode.replace("_", " ").toLowerCase(), "text-[#53dbc7]"],
                      ["Date", formatDate(c.receiptDate)],
                      ["GSTIN", c.vendorGstin ?? (c.gstAmount > 0 ? "missing" : "n/a"), c.vendorGstin ? "text-[#25d366]" : "text-[#ffd279]"],
                    ]}
                  />
                  <p className="text-[12px] text-[#d1d7db]">
                    {formatINR(c.totalAmount)}, {c.vendorName ?? "cash expense"}, {c.categoryCode.charAt(0) + c.categoryCode.slice(1).toLowerCase().replace("_", " ")}, {formatDate(c.receiptDate).replace(/ \d{4}$/, "")}.{" "}
                    {c.status === "DRAFT" ? "Correct?" : ""}
                  </p>
                </>
              )}
              {warnings.map((w) => (
                <p key={w.type} className={cn("mt-1.5 flex items-start gap-1 text-[12px]", w.blocking ? "text-[#f15c6d]" : "text-[#ffd279]")}>
                  <Icon name={w.blocking ? "error" : "warning"} className="mt-px text-[14px]" />
                  {w.message}
                </p>
              ))}
            </BotBubble>
            {c.status === "DRAFT" && (
              <QuickReplies>
                {!unread && (
                  <QuickReply icon="check_circle" disabled={typing} onClick={() => void confirmAndSubmit(c)}>
                    Yes, submit claim
                  </QuickReply>
                )}
                <QuickReply icon="edit" tone="muted" disabled={typing} onClick={() => setEditing(c)}>
                  Edit details
                </QuickReply>
              </QuickReplies>
            )}
          </div>
        ),
      });
    }
  } else {
    for (const p of inbox.data ?? []) {
      transcript.push({
        at: p.claim.submittedAt ?? p.claim.createdAt,
        node: (
          <div key={`a-${p.claim.id}`} onClick={() => setSelected(p.claim.id)} className="cursor-pointer">
            <BotBubble
              at={p.claim.submittedAt ?? undefined}
              title={
                <>
                  <Icon name="approval_delegation" className="text-[15px]" /> Approval needed · {p.claim.reference}
                  {p.requiredLevels > 1 ? ` · level ${p.level}/${p.requiredLevels}` : ""}
                </>
              }
            >
              <KeyValues
                rows={[
                  ["From", p.claim.employee.name],
                  ["Amount", formatINRExact(p.claim.totalAmount), "font-bold text-[13px]"],
                  ["Vendor", p.claim.vendorName ?? "—"],
                  ["Date", formatDate(p.claim.receiptDate)],
                ]}
              />
              {p.issues.length === 0 ? (
                <p className="flex items-center gap-1 text-[12px] text-[#25d366]">
                  <Icon name="verified" className="text-[14px]" /> All policy checks passed
                </p>
              ) : (
                p.issues.map((i) => (
                  <p key={i.type} className={cn("mt-1 flex items-start gap-1 text-[12px]", i.blocking ? "text-[#f15c6d]" : "text-[#ffd279]")}>
                    <Icon name={i.blocking ? "error" : "warning"} className="mt-px text-[14px]" />
                    {i.message}
                  </p>
                ))
              )}
            </BotBubble>
            <QuickReplies>
              <QuickReply icon="check_circle" disabled={approve.isPending} onClick={() => approve.mutate(p)}>
                {p.hasBlockingIssues ? "Approve as exception" : "Approve"}
              </QuickReply>
              <div className="grid grid-cols-2 gap-1">
                <QuickReply icon="help" tone="muted" onClick={() => setAsking(p)}>
                  Ask
                </QuickReply>
                <QuickReply icon="block" tone="red" onClick={() => setRejecting(p)}>
                  Reject
                </QuickReply>
              </div>
            </QuickReplies>
          </div>
        ),
      });
    }
    for (const d of decisions) transcript.push({ at: d.at, node: <BotBubble key={d.id} at={d.at}>{d.text}</BotBubble> });
  }
  for (const m of msgs) {
    transcript.push({
      at: m.createdAt,
      node: (
        <BotBubble key={m.id} at={m.createdAt}>
          {m.body}
        </BotBubble>
      ),
    });
  }
  transcript.sort((a, b) => a.at.localeCompare(b.at));

  const persona = session?.user.fullName ?? "";
  const sc = selectedClaim.data;

  return (
    <>
      <div className="flex flex-col justify-between gap-space-md pt-space-md xl:flex-row xl:items-center">
        <div className="flex flex-col">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-secondary-container px-2 py-0.5 font-label-sm text-label-sm uppercase tracking-wider text-secondary">Interactive sandbox</span>
            <span className="font-label-sm text-label-sm text-outline">{status.data?.mode === "SIMULATED" ? "Simulated WhatsApp channel – nothing is sent to WhatsApp" : status.data?.message}</span>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-primary md:font-headline-lg md:text-headline-lg">WhatsApp Expense Simulator</h1>
          <p className="max-w-2xl font-body-md text-body-md text-on-surface-variant">
            Submit receipts the way employees would on WhatsApp and approve them as a manager. Every action creates or updates real claims – they appear in Claims, Approvals and the Audit log.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="flex items-center rounded-full bg-surface-container p-1 shadow-sm" role="tablist" aria-label="Persona">
            {(
              [
                ["employee", "person", canSubmit ? `Employee View (${firstName(persona)})` : "Employee View"],
                ["manager", "supervisor_account", canApprove ? `Manager View (${firstName(persona)})` : "Manager View"],
              ] as const
            ).map(([v, icon, label]) => {
              const allowed = v === "employee" ? canSubmit : canApprove;
              return (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={view === v}
                  disabled={!allowed}
                  title={allowed ? undefined : env.demoMode ? "Switch demo user below" : "Your role cannot use this view"}
                  onClick={() => {
                    setView(v);
                    setSelected(null);
                  }}
                  className={cn("flex items-center gap-1.5 rounded-full px-4 py-1.5 font-label-md text-label-md transition-all duration-200 disabled:opacity-40", view === v ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface")}
                >
                  <Icon name={icon} className="text-[16px]" />
                  {label}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={reset} className="flex items-center gap-1.5 rounded-lg bg-surface-container-lowest px-3.5 py-2 font-label-md text-label-md text-on-surface shadow-sm transition-all hover:bg-surface-container" title="Clears this chat view only; claims are never deleted">
            <Icon name="restart_alt" className="text-[18px] text-secondary" /> Reset Demo Flow
          </button>
        </div>
      </div>
      {env.demoMode && (
        <Notice tone="info" icon="switch_account">
          <span className="font-semibold">Development demo:</span> sign in as another seeded user to play both sides —{" "}
          {DEMO_ACCOUNTS.filter((a) => a.key === "ravi" || a.key === "meera" || a.key === "sanjay").map((a, i) => (
            <span key={a.key}>
              {i > 0 && " · "}
              <button type="button" className="font-semibold text-brand-link hover:underline" onClick={() => void switchPersona(a.email)}>
                {a.name} ({a.title})
              </button>
            </span>
          ))}
        </Notice>
      )}

      <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
        <div className="flex flex-col gap-space-md lg:col-span-3">
          {view === "employee" ? (
            <>
              <Card className="p-space-md">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-headline-sm text-headline-sm text-primary">
                    <Icon name="science" className="text-[20px] text-secondary" />
                    Test Scenarios
                  </h3>
                  <span className="font-label-sm text-label-sm text-outline">4 Presets</span>
                </div>
                <p className="mb-space-sm font-body-sm text-body-sm text-on-surface-variant">Send a bundled sample receipt and watch the backend process it.</p>
                <div className="space-y-2">
                  {SCENARIOS.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      disabled={typing}
                      onClick={() => void ("file" in s ? sendSample(s.file) : sendText(s.text))}
                      className={cn("w-full rounded-lg p-3 text-left transition-all disabled:opacity-60", i === 0 ? "bg-surface-container-low hover:bg-surface-container" : "bg-surface-container-lowest hover:bg-surface-container-low")}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={cn("flex h-6 w-6 items-center justify-center rounded-md font-label-sm text-label-sm", i === 0 ? "bg-secondary text-on-secondary" : "bg-surface-container-highest text-primary")}>{s.id}</span>
                          <span className="font-label-md text-label-md text-on-surface">{s.title}</span>
                        </div>
                        <span className={cn("shrink-0 rounded px-1.5 py-0.5 font-label-sm text-label-sm font-semibold", s.tagCls)}>{s.tag}</span>
                      </div>
                      <p className="mt-1.5 pl-8 font-body-sm text-body-sm text-outline">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </Card>
              <Card className="p-space-md">
                <h4 className="mb-2 flex items-center gap-1.5 font-label-lg text-label-lg text-primary">
                  <Icon name="cloud_upload" className="text-[18px] text-secondary" />
                  Simulated Media Drop
                </h4>
                <button type="button" disabled={typing} onClick={() => fileRef.current?.click()} className="group flex w-full flex-col items-center justify-center rounded-xl bg-surface-container-low p-4 text-center transition-colors hover:bg-surface-container disabled:opacity-60">
                  <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm transition-transform group-hover:scale-105">
                    <Icon name="receipt_long" className="text-[22px] text-secondary" />
                  </span>
                  <span className="font-label-md text-label-md font-semibold text-primary">Send your own bill photo / PDF</span>
                  <span className="mt-0.5 font-body-sm text-body-sm text-outline">JPEG, PNG, WebP or PDF up to 10 MB</span>
                </button>
              </Card>
            </>
          ) : (
            <Card className="space-y-2 p-space-md">
              <h3 className="flex items-center gap-2 font-headline-sm text-headline-sm text-primary">
                <Icon name="inbox" className="text-[20px] text-secondary" /> Manager inbox
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {inbox.data?.length ?? 0} claims are waiting for {firstName(persona)}. Decisions here are the same API calls as the Approvals page.
              </p>
              <Link href="/approvals" className="font-label-md text-label-md text-brand-link hover:underline">
                Open Approvals →
              </Link>
            </Card>
          )}
        </div>

        <div className="flex justify-center lg:col-span-5">
          <div className="relative w-full max-w-[420px] rounded-[36px] bg-primary p-2.5 shadow-xl ring-8 ring-primary/20">
            <div className="absolute left-1/2 top-4 z-30 flex h-4 w-28 -translate-x-1/2 items-center justify-center rounded-full bg-primary">
              <div className="mr-2 h-2.5 w-2.5 rounded-full bg-surface-container-highest/20" />
              <div className="h-1 w-10 rounded-full bg-surface-container-highest/30" />
            </div>
            <div className="relative flex h-[720px] w-full flex-col overflow-hidden rounded-[28px] bg-[#0b141a] text-white">
              <div className="z-20 flex shrink-0 items-center justify-between bg-[#202c33] px-3.5 pb-2.5 pt-6 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <Icon name="arrow_back" className="text-[20px] text-[#aebac1]" />
                  <div className="relative">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-secondary-container">
                      <Icon name="all_inclusive" className="text-[20px]" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-[14px] font-semibold leading-tight text-[#e9edef]">HisabLoop Expenses</span>
                    <span className="text-[11px] font-medium leading-none text-[#00a884]">{view === "employee" ? `chatting as ${firstName(persona)}` : `${firstName(persona)} · approver`}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[#aebac1]">
                  <Icon name="videocam" className="text-[20px]" />
                  <Icon name="call" className="text-[20px]" />
                  <Icon name="more_vert" className="text-[20px]" />
                </div>
              </div>
              <div ref={streamRef} className="relative flex-1 space-y-3 overflow-y-auto bg-[#0b141a] p-3" aria-live="polite">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] opacity-[0.04] [background-size:16px_16px]" />
                <div className="relative z-10 my-1 flex justify-center">
                  <span className="rounded-md bg-[#182229] px-3 py-1 font-label-sm text-[11px] uppercase tracking-wider text-[#8696a0] shadow-sm">Today</span>
                </div>
                <div className="relative z-10 mx-auto max-w-[290px] rounded-lg bg-[#182229]/80 p-2 text-center">
                  <p className="flex items-center justify-center gap-1 text-[10px] leading-tight text-[#ffd279]">
                    <Icon name="science" className="text-[12px]" /> Simulation – messages are stored by HisabLoop, not sent via WhatsApp.
                  </p>
                </div>
                <BotBubble>
                  {view === "employee" ? (
                    <>
                      Hi {firstName(persona)}! 👋 Welcome to {ws.companyName}&apos;s expense desk.
                      <p className="mt-1">
                        Send me any bill photo or PDF, or just type an expense (e.g. <em className="text-[#53bdeb]">&quot;Auto 140 to APMC market&quot;</em>). I&apos;ll do the rest.
                      </p>
                    </>
                  ) : (
                    <>Hi {firstName(persona)}! Claims from your team that need your decision appear here.</>
                  )}
                </BotBubble>
                {(mine.isLoading || inbox.isLoading) && (
                  <div className="relative z-10 flex justify-center">
                    <Spinner />
                  </div>
                )}
                {transcript.map((t) => t.node)}
                {view === "manager" && inbox.data?.length === 0 && <BotBubble>No claims are waiting for you. 🎉</BotBubble>}
                {typing && <Typing />}
              </div>
              <form
                className="flex shrink-0 items-center gap-2 bg-[#202c33] px-2.5 py-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (view !== "employee") return;
                  const t = text;
                  setText("");
                  void sendText(t);
                }}
              >
                <div className="flex flex-1 items-center gap-2 rounded-full bg-[#2a3942] px-3 py-2">
                  <Icon name="sentiment_satisfied" className="text-[20px] text-[#8696a0]" />
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={view !== "employee" || typing}
                    placeholder={view === "employee" ? "Type an expense, e.g. Auto fare 180 cash" : "Use the buttons to decide"}
                    aria-label="Message"
                    className="flex-1 bg-transparent text-[14px] text-[#e9edef] placeholder:text-[#8696a0] focus:outline-none disabled:opacity-60"
                  />
                  <button type="button" disabled={view !== "employee" || typing} onClick={() => fileRef.current?.click()} aria-label="Attach receipt" className="text-[#8696a0] hover:text-[#e9edef] disabled:opacity-40">
                    <Icon name="attach_file" className="text-[20px]" />
                  </button>
                </div>
                <button type="submit" disabled={view !== "employee" || typing || !text.trim()} aria-label="Send" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00a884] text-[#111b21] disabled:opacity-50">
                  <Icon name="send" className="text-[20px]" />
                </button>
              </form>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void sendFile(f);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-space-md lg:col-span-4">
          <Card className="p-space-md">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
                <h3 className="font-headline-sm text-headline-sm text-primary">Live Synchronized Ledger</h3>
              </div>
              <span className="rounded-full bg-secondary-container px-2 py-0.5 font-label-sm text-label-sm text-on-secondary-container">Polling every 5s</span>
            </div>
            <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">Each chat action calls the HisabLoop API. This panel shows the persisted claim record.</p>
          </Card>
          {!sc ? (
            <Card className="p-space-md">
              <EmptyState icon="receipt_long" title="No claim selected" description="Send a scenario or tap a message to inspect its claim." className="py-6" />
            </Card>
          ) : (
            <Card className="space-y-3 p-space-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Claim record</p>
                  <p className="font-headline-lg text-headline-lg text-primary">#{sc.reference}</p>
                  <p className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
                    <Icon name="person" className="text-[16px]" />
                    {sc.employee.name}
                    {sc.employee.designation ? ` · ${sc.employee.designation}` : ""}
                  </p>
                </div>
                <StatusBadge status={sc.status} />
              </div>
              <dl className="space-y-1.5 rounded-xl bg-surface-container-low p-3 font-body-md text-body-md">
                <Row k="Merchant / Vendor" v={sc.vendorName ?? "—"} />
                <Row k="Category" v={<CategoryChip code={sc.categoryCode} />} />
                <Row k="Taxable value" v={sc.taxableAmount != null ? formatINRExact(sc.taxableAmount) : "—"} />
                <Row k={sc.igstAmount > 0 ? "IGST" : "CGST + SGST"} v={formatINRExact(sc.gstAmount)} />
                <div className="flex items-center justify-between border-t border-brand-line pt-2">
                  <dt className="font-headline-sm text-headline-sm text-primary">Total Claimed</dt>
                  <dd className="font-mono text-headline-sm font-bold text-secondary">{formatINRExact(sc.totalAmount)}</dd>
                </div>
              </dl>
              {sc.receipts[0]?.confidence != null && (
                <div>
                  <div className="mb-1 flex items-center justify-between font-label-md text-label-md">
                    <span className="flex items-center gap-1 text-primary">
                      <Icon name="document_scanner" className="text-[16px]" /> OCR Field Confidence
                    </span>
                    <span className="text-secondary">{sc.receipts[0].confidence}%{sc.receipts[0].provider === "mock" ? " (mock provider)" : ""}</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container">
                    <div className="h-2 rounded-full bg-secondary" style={{ width: `${Math.min(100, sc.receipts[0].confidence)}%` }} />
                  </div>
                </div>
              )}
              <ul className="space-y-1.5">
                {sc.policyChecks.map((p) => (
                  <li key={p.type} className={cn("flex items-start gap-2 rounded-lg px-3 py-2 font-body-sm text-body-sm", p.result === "PASS" ? "bg-success-soft/60 text-on-surface" : p.blocking ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning-text")}>
                    <Icon name={p.result === "PASS" ? "check_circle" : "warning"} className="mt-px text-[16px]" />
                    {p.message}
                  </li>
                ))}
              </ul>
              <p className="pt-1 font-label-sm text-label-sm uppercase tracking-wider text-outline">Automated ledger actions</p>
              <ul className="space-y-1.5 font-body-md text-body-md">
                <Ledger icon="receipt_long" label="Claims ledger" value="Row added" ok />
                <Ledger
                  icon="approval_delegation"
                  label="Manager approvals inbox"
                  value={sc.status === "PENDING_APPROVAL" ? `Waiting · level ${sc.approvalsCompleted + 1}/${sc.requiredApprovalLevels}` : ["APPROVED", "IN_BATCH", "PAID"].includes(sc.status) ? "Cleared" : sc.status === "REJECTED" ? "Rejected" : "Not submitted"}
                  ok={["APPROVED", "IN_BATCH", "PAID"].includes(sc.status)}
                />
                <Ledger icon="payments" label="Reimbursement batch" value={sc.batch ? `${sc.batch.reference}${sc.status === "PAID" ? " · paid" : ""}` : sc.status === "APPROVED" ? "Ready for next batch" : "—"} ok={Boolean(sc.batch)} />
                <Ledger icon="account_balance" label="Tally / Zoho Books sync" value="Not configured" />
              </ul>
              <Button asChild className="w-full">
                <Link href={`/claims/${sc.id}`}>
                  Inspect Full Claim <Icon name="arrow_forward" className="text-[18px]" />
                </Link>
              </Button>
            </Card>
          )}
          <div className="rounded-xl bg-surface-container-low p-space-md">
            <p className="flex items-center gap-2 font-label-lg text-label-lg text-primary">
              <Icon name="lightbulb" className="text-[18px] text-secondary" /> Connecting real WhatsApp
            </p>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              The simulator uses the backend&apos;s simulated messaging gateway. A WhatsApp Business (Cloud API) adapter can replace it without changing the claim workflow.
            </p>
          </div>
        </div>
      </div>

      <Dialog open={editing !== null} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent title={`Edit ${editing?.reference ?? ""}`} description="Correct what the bot extracted, then confirm in the chat." className="max-w-2xl">
          {editing && (
            <ClaimForm
              initial={editing}
              submitLabel="Save"
              onCancel={() => setEditing(null)}
              onSubmit={async (v) => {
                try {
                  await claimsService.update(ws.companyId, editing.id, { ...toClaimInput(v), version: editing.version });
                  await refresh();
                  setEditing(null);
                } catch (e) {
                  toast.error(errorMessage(e));
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <ReasonDialog
        open={rejecting !== null}
        onOpenChange={(v) => !v && setRejecting(null)}
        title={`Reject ${rejecting?.claim.reference ?? ""}?`}
        label="Reason"
        confirmLabel="Reject"
        variant="danger"
        onConfirm={async (reason) => {
          if (!rejecting) return;
          const c = await approvalService.reject(ws.companyId, rejecting.claim.id, reason);
          setDecisions((d) => [...d, { id: c.id + "rej", at: new Date().toISOString(), text: `❌ Rejected ${c.reference}: ${reason}` }]);
          await refresh();
        }}
      />
      <ReasonDialog
        open={asking !== null}
        onOpenChange={(v) => !v && setAsking(null)}
        title={`Ask about ${asking?.claim.reference ?? ""}`}
        label="Question for the employee"
        confirmLabel="Send question"
        onConfirm={async (q) => {
          if (!asking) return;
          await claimsService.comment(ws.companyId, asking.claim.id, q, "CLARIFICATION_REQUEST");
          setDecisions((d) => [...d, { id: asking.claim.id + Date.now(), at: new Date().toISOString(), text: `❓ Asked ${firstName(asking.claim.employee.name)} about ${asking.claim.reference}: “${q}”` }]);
          await refresh();
        }}
      />
    </>
  );
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-on-surface-variant">{k}</dt>
      <dd className="truncate text-right font-semibold text-on-surface">{v}</dd>
    </div>
  );
}

function Ledger({ icon, label, value, ok }: { icon: string; label: string; value: string; ok?: boolean }) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-lg bg-surface-container-lowest px-3 py-2 ring-1 ring-brand-line">
      <span className="flex items-center gap-2 text-on-surface">
        <Icon name={icon} className="text-[18px] text-on-surface-variant" />
        {label}
      </span>
      <span className={cn("flex items-center gap-1 font-label-md text-label-md", ok ? "text-secondary" : "text-on-surface-variant")}>
        {value}
        {ok && <Icon name="check" className="text-[16px]" />}
      </span>
    </li>
  );
}

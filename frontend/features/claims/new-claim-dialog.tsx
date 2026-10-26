"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Notice } from "@/components/ui/feedback";
import { useAuth } from "@/features/auth/auth-provider";
import { ApiError, errorMessage } from "@/lib/api-client";
import { invalidateClaimData } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { claimsService } from "@/services/claims-service";
import { receiptService } from "@/services/receipt-service";
import { ClaimForm } from "./claim-form";
import { toClaimInput } from "./claim-schema";

type Mode = "upload" | "manual" | "text";
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

export function NewClaimDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { companyId } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [mode, setMode] = useState<Mode>("upload");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [serverErrors, setServerErrors] = useState<Record<string, string>>();
  const fileRef = useRef<HTMLInputElement>(null);

  if (!companyId) return null;
  const cid = companyId;

  async function done(claimId: string, message: string) {
    await invalidateClaimData(qc, cid);
    toast.success(message);
    onOpenChange(false);
    setBusy(null);
    router.push(`/claims/${claimId}`);
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (file.size > MAX_BYTES) return setError("The file is larger than 10 MB.");
    if (!ACCEPT.split(",").includes(file.type)) return setError("Upload a JPEG, PNG, WebP image or a PDF.");
    try {
      setBusy("Creating draft claim…");
      const draft = await claimsService.create(cid, { categoryCode: "OTHER", source: "WEB" });
      setBusy("Uploading receipt securely…");
      const receipt = await receiptService.upload(cid, draft.id, file);
      setBusy("Reading receipt…");
      const processed = await receiptService.process(cid, receipt.id);
      const r = processed.receipts.find((x) => x.id === receipt.id);
      await done(
        processed.id,
        r?.processingStatus === "COMPLETED" ? `${processed.reference} created – review the extracted details` : `${processed.reference} created – enter the details from the receipt`,
      );
    } catch (e) {
      setBusy(null);
      setError(errorMessage(e));
    }
  }

  async function onText() {
    setError(null);
    if (text.trim().length < 3) return setError("Describe the expense, e.g. “Auto fare 180 cash”.");
    try {
      setBusy("Creating text claim…");
      const c = await claimsService.createFromText(cid, text.trim(), "WEB");
      setText("");
      await done(c.id, `${c.reference} created as a draft without a receipt`);
    } catch (e) {
      setBusy(null);
      setError(errorMessage(e));
    }
  }

  const tabs: { id: Mode; label: string; icon: string }[] = [
    { id: "upload", label: "Upload receipt", icon: "upload_file" },
    { id: "manual", label: "Enter manually", icon: "edit_note" },
    { id: "text", label: "Quick text", icon: "sms" },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!busy) {
          onOpenChange(v);
          setError(null);
        }
      }}
    >
      <DialogContent title="New expense claim" description="Claims start as drafts. You review and confirm before they go for approval.">
        <div className="mb-4 flex rounded-lg bg-surface-container-low p-1" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={mode === t.id}
              onClick={() => setMode(t.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 font-label-md text-label-md transition-all",
                mode === t.id ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant hover:text-primary",
              )}
            >
              <Icon name={t.icon} className="text-[18px]" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
        {error && (
          <Notice tone="danger" className="mb-4">
            {error}
          </Notice>
        )}
        {mode === "upload" && (
          <div className="space-y-3">
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low px-6 py-10 text-center transition hover:border-secondary hover:bg-surface-container disabled:opacity-60"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm">
                <Icon name={busy ? "hourglass_top" : "cloud_upload"} className="text-secondary" />
              </span>
              <span className="font-label-lg text-label-lg text-primary">{busy ?? "Choose a receipt photo or PDF"}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">JPEG, PNG, WebP or PDF · up to 10 MB</span>
            </button>
            <input ref={fileRef} type="file" accept={ACCEPT} className="sr-only" onChange={(e) => void onFile(e.target.files?.[0])} />
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Details are extracted by the configured OCR provider. If none is configured, you will enter them yourself on the next screen.
            </p>
          </div>
        )}
        {mode === "manual" && (
          <ClaimForm
            submitLabel="Create draft"
            serverErrors={serverErrors}
            onCancel={() => onOpenChange(false)}
            onSubmit={async (v) => {
              setError(null);
              setServerErrors(undefined);
              try {
                const c = await claimsService.create(cid, { ...toClaimInput(v), source: "WEB" });
                await done(c.id, `${c.reference} created as a draft`);
              } catch (e) {
                if (e instanceof ApiError) setServerErrors(e.fieldErrors);
                setError(errorMessage(e));
              }
            }}
          />
        )}
        {mode === "text" && (
          <div className="space-y-3">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Auto fare 180 cash"
              aria-label="Describe the expense"
              rows={3}
              maxLength={500}
            />
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              For small cash expenses without a bill. We suggest the amount, category and payment mode; you confirm them.
            </p>
            <div className="flex justify-end">
              <Button onClick={() => void onText()} loading={Boolean(busy)}>
                Create text claim
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

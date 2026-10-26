"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Field, Textarea } from "@/components/ui/form";
import { Notice } from "@/components/ui/feedback";
import { errorMessage } from "@/lib/api-client";

/** Dialog that collects a mandatory reason/comment before running an action. */
export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  label,
  placeholder,
  confirmLabel,
  variant = "primary",
  required = true,
  onConfirm,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  label: string;
  placeholder?: string;
  confirmLabel: string;
  variant?: "primary" | "danger" | "accent";
  required?: boolean;
  onConfirm: (text: string) => Promise<void>;
  children?: ReactNode;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit() {
    if (required && text.trim().length < 3) {
      setError("Please enter a short reason.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onConfirm(text.trim());
      setText("");
      onOpenChange(false);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent title={title} description={description}>
        <div className="space-y-4">
          {children}
          <Field label={label} htmlFor="reason" required={required} error={error ?? undefined}>
            <Textarea id="reason" value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} rows={3} maxLength={1000} autoFocus />
          </Field>
          {error && !required && <Notice tone="danger">{error}</Notice>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button variant={variant} onClick={() => void submit()} loading={busy}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

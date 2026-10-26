"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { CurrencyInput, Field, Input, Select, Textarea } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { useCategories } from "@/hooks/use-company-data";
import { todayInIndia } from "@/lib/format";
import { claimFormSchema, gstinFormatOk, PAYMENT_MODES, type ClaimFormValues } from "./claim-schema";
import type { ClaimDetail } from "@/types/api";

export function defaultsFromClaim(c?: ClaimDetail | null): ClaimFormValues {
  const s = (n: number | null | undefined) => (n === null || n === undefined ? "" : String(n));
  const taxType = c ? (c.igstAmount > 0 ? "INTER" : c.cgstAmount > 0 || c.sgstAmount > 0 ? "INTRA" : "NONE") : "NONE";
  return {
    vendorName: c?.vendorName ?? "",
    receiptDate: c?.receiptDate ?? todayInIndia(),
    categoryCode: c?.categoryCode ?? "TRAVEL",
    totalAmount: c && c.totalAmount > 0 ? s(c.totalAmount) : "",
    taxType,
    taxableAmount: s(c?.taxableAmount),
    cgstAmount: c?.cgstAmount ? s(c.cgstAmount) : "",
    sgstAmount: c?.sgstAmount ? s(c.sgstAmount) : "",
    igstAmount: c?.igstAmount ? s(c.igstAmount) : "",
    vendorGstin: c?.vendorGstin ?? "",
    paymentMode: c?.paymentMode ?? "UPI",
    description: c?.description ?? "",
  };
}

export function ClaimForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  serverErrors,
}: {
  initial?: ClaimDetail | null;
  submitLabel: string;
  onSubmit: (values: ClaimFormValues) => Promise<void>;
  onCancel?: () => void;
  serverErrors?: Record<string, string>;
}) {
  const { data: categories } = useCategories();
  const form = useForm<ClaimFormValues>({ resolver: zodResolver(claimFormSchema), defaultValues: defaultsFromClaim(initial) });
  const { register, handleSubmit, formState, control } = form;
  const e = { ...formState.errors };
  const taxType = useWatch({ control, name: "taxType" });
  const gstin = useWatch({ control, name: "vendorGstin" });
  const err = (k: keyof ClaimFormValues) => e[k]?.message ?? serverErrors?.[k];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Vendor / merchant" htmlFor="vendorName" error={err("vendorName")} className="sm:col-span-2">
          <Input id="vendorName" placeholder="e.g. Uber India Systems Pvt Ltd" aria-invalid={!!err("vendorName")} {...register("vendorName")} />
        </Field>
        <Field label="Bill date" htmlFor="receiptDate" error={err("receiptDate")} required>
          <Input id="receiptDate" type="date" max={todayInIndia()} aria-invalid={!!err("receiptDate")} {...register("receiptDate")} />
        </Field>
        <Field label="Category" htmlFor="categoryCode" error={err("categoryCode")} required>
          <Select id="categoryCode" {...register("categoryCode")}>
            {(categories ?? []).map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Bill total" htmlFor="totalAmount" error={err("totalAmount")} required>
          <CurrencyInput id="totalAmount" placeholder="0.00" aria-invalid={!!err("totalAmount")} {...register("totalAmount")} />
        </Field>
        <Field label="Payment mode" htmlFor="paymentMode">
          <Select id="paymentMode" {...register("paymentMode")}>
            {PAYMENT_MODES.map((m) => (
              <option key={m} value={m}>
                {m.replace("_", " ")}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <fieldset className="rounded-xl bg-surface-container-low p-4">
        <legend className="sr-only">GST details</legend>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="font-label-md text-label-md text-primary">GST on this bill</span>
          {(["NONE", "INTRA", "INTER"] as const).map((t) => (
            <label key={t} className="flex cursor-pointer items-center gap-1.5 rounded-full bg-surface-container-lowest px-3 py-1 font-label-sm text-label-sm text-on-surface has-[:checked]:bg-primary has-[:checked]:text-on-primary">
              <input type="radio" value={t} className="sr-only" {...register("taxType")} />
              {t === "NONE" ? "No GST" : t === "INTRA" ? "CGST + SGST" : "IGST"}
            </label>
          ))}
        </div>
        {taxType !== "NONE" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Taxable value" htmlFor="taxableAmount" error={err("taxableAmount")}>
              <CurrencyInput id="taxableAmount" {...register("taxableAmount")} />
            </Field>
            {taxType === "INTRA" ? (
              <>
                <Field label="CGST" htmlFor="cgstAmount" error={err("cgstAmount")}>
                  <CurrencyInput id="cgstAmount" {...register("cgstAmount")} />
                </Field>
                <Field label="SGST" htmlFor="sgstAmount" error={err("sgstAmount")}>
                  <CurrencyInput id="sgstAmount" {...register("sgstAmount")} />
                </Field>
              </>
            ) : (
              <Field label="IGST" htmlFor="igstAmount" error={err("igstAmount")}>
                <CurrencyInput id="igstAmount" {...register("igstAmount")} />
              </Field>
            )}
            <Field
              label="Supplier GSTIN"
              htmlFor="vendorGstin"
              error={err("vendorGstin")}
              className="sm:col-span-3"
              hint={
                gstin ? (
                  gstinFormatOk(gstin.toUpperCase()) ? (
                    <span className="inline-flex items-center gap-1 text-success">
                      <Icon name="check_circle" className="text-[14px]" /> Format looks valid (registration is not verified)
                    </span>
                  ) : (
                    <span className="text-warning-text">This does not match the GSTIN format; it will be flagged for review.</span>
                  )
                ) : (
                  "Leave empty if the bill has no GSTIN — the claim will be flagged as missing GSTIN."
                )
              }
            >
              <Input id="vendorGstin" className="uppercase tabular-nums" maxLength={15} placeholder="27AABCU9603R1ZM" {...register("vendorGstin")} />
            </Field>
          </div>
        )}
      </fieldset>

      <Field label="Purpose / notes" htmlFor="description" error={err("description")}>
        <Textarea id="description" rows={2} placeholder="e.g. Client meeting at Bhosari MIDC" {...register("description")} />
      </Field>

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={formState.isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

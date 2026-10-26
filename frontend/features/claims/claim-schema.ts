import { z } from "zod";
import type { ClaimInput } from "@/types/api";

export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const PAYMENT_MODES = ["UPI", "CASH", "CARD", "COMPANY_CARD", "NETBANKING"] as const;

const money = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d{1,10}(\.\d{1,2})?$/.test(v.replace(/,/g, "")), "Enter an amount like 1240 or 1240.50");

function toNumber(v: string | undefined): number | null {
  if (!v || v.trim() === "") return null;
  return Number(v.replace(/,/g, ""));
}

/** Client-side validation for the claim form. The backend re-validates everything. */
export const claimFormSchema = z
  .object({
    vendorName: z.string().trim().max(160).optional(),
    receiptDate: z.string().optional(),
    categoryCode: z.string().min(1, "Choose a category"),
    totalAmount: money.refine((v) => (toNumber(v) ?? 0) > 0, "Enter the bill total"),
    taxType: z.enum(["NONE", "INTRA", "INTER"]),
    taxableAmount: money.optional(),
    cgstAmount: money.optional(),
    sgstAmount: money.optional(),
    igstAmount: money.optional(),
    vendorGstin: z
      .string()
      .trim()
      .toUpperCase()
      .optional()
      .refine((v) => !v || v.length === 15, "A GSTIN has 15 characters"),
    paymentMode: z.string().optional(),
    description: z.string().trim().max(500).optional(),
  })
  .superRefine((v, ctx) => {
    const total = toNumber(v.totalAmount) ?? 0;
    const gst =
      v.taxType === "INTRA" ? (toNumber(v.cgstAmount) ?? 0) + (toNumber(v.sgstAmount) ?? 0) : v.taxType === "INTER" ? (toNumber(v.igstAmount) ?? 0) : 0;
    if (gst > total) ctx.addIssue({ code: "custom", path: ["cgstAmount"], message: "GST cannot be more than the bill total" });
    const taxable = toNumber(v.taxableAmount);
    if (taxable !== null && taxable > total) ctx.addIssue({ code: "custom", path: ["taxableAmount"], message: "Taxable value cannot exceed the total" });
    if (v.receiptDate) {
      const today = new Date().toISOString().slice(0, 10);
      if (v.receiptDate > today) ctx.addIssue({ code: "custom", path: ["receiptDate"], message: "The bill date cannot be in the future" });
    }
    if (!v.vendorName && !v.description) ctx.addIssue({ code: "custom", path: ["vendorName"], message: "Enter the vendor (or a description)" });
  });

export type ClaimFormValues = z.infer<typeof claimFormSchema>;

export function toClaimInput(v: ClaimFormValues): ClaimInput & { categoryCode: string } {
  const intra = v.taxType === "INTRA";
  const inter = v.taxType === "INTER";
  return {
    vendorName: v.vendorName || null,
    receiptDate: v.receiptDate || null,
    categoryCode: v.categoryCode,
    totalAmount: toNumber(v.totalAmount),
    taxableAmount: v.taxType === "NONE" ? null : toNumber(v.taxableAmount),
    cgstAmount: intra ? (toNumber(v.cgstAmount) ?? 0) : 0,
    sgstAmount: intra ? (toNumber(v.sgstAmount) ?? 0) : 0,
    igstAmount: inter ? (toNumber(v.igstAmount) ?? 0) : 0,
    vendorGstin: v.vendorGstin ? v.vendorGstin : "",
    paymentMode: v.paymentMode || null,
    description: v.description || null,
  };
}

export function gstinFormatOk(v: string | undefined | null): boolean {
  return !!v && GSTIN_REGEX.test(v);
}

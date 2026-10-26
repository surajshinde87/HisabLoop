import { z } from "zod";

const amount = z
  .string()
  .trim()
  .regex(/^\d{1,10}(\.\d{1,2})?$/, "Enter an amount like 5000");

export const policySchema = z
  .object({
    twoLevelApprovalAbove: amount,
    duplicateDetectionEnabled: z.boolean(),
    duplicateWindowDays: z.coerce.number().int().min(1, "At least 1 day").max(730, "At most 730 days"),
    gstinValidationEnabled: z.boolean(),
    receiptRequiredAbove: z.string().trim().refine((v) => v === "" || /^\d{1,10}(\.\d{1,2})?$/.test(v), "Enter an amount or leave empty"),
    categoryLimits: z.array(
      z.object({
        categoryCode: z.string().min(1),
        role: z.enum(["ALL", "ADMIN", "FINANCE", "MANAGER", "EMPLOYEE"]),
        perClaimLimit: amount.refine((v) => Number(v) >= 1, "Limit must be at least ₹1"),
      }),
    ),
  })
  .superRefine((v, ctx) => {
    const seen = new Set<string>();
    v.categoryLimits.forEach((l, i) => {
      const key = `${l.categoryCode}|${l.role}`;
      if (seen.has(key)) ctx.addIssue({ code: "custom", path: ["categoryLimits", i, "role"], message: "Duplicate category/role limit" });
      seen.add(key);
    });
  });

export type PolicyFormInput = z.input<typeof policySchema>;
export type PolicyFormValues = z.output<typeof policySchema>;

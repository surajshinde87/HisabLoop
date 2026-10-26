import { claimFormSchema, gstinFormatOk, toClaimInput } from "@/features/claims/claim-schema";
import { loginSchema, newPasswordSchema, registerSchema, safeNext } from "@/features/auth/auth-schemas";
import { policySchema } from "@/features/policies/policy-schema";
import { inviteSchema } from "@/features/team/member-dialogs";
import { contactSchema } from "@/components/public/contact-form";

const baseClaim = { vendorName: "Uber India", receiptDate: "2026-10-08", categoryCode: "TRAVEL", totalAmount: "1240", taxType: "INTRA" as const, taxableAmount: "1181", cgstAmount: "29.5", sgstAmount: "29.5", igstAmount: "", vendorGstin: "27aafcu5055k1zo", paymentMode: "UPI", description: "" };

describe("claim form schema", () => {
  it("accepts a valid intra-state claim and normalises the GSTIN", () => {
    const r = claimFormSchema.safeParse(baseClaim);
    expect(r.success).toBe(true);
    const input = toClaimInput(r.data!);
    expect(input.vendorGstin).toBe("27AAFCU5055K1ZO");
    expect(input.totalAmount).toBe(1240);
    expect(input.igstAmount).toBe(0);
  });
  it("rejects GST larger than the total", () => {
    const r = claimFormSchema.safeParse({ ...baseClaim, cgstAmount: "1000", sgstAmount: "1000" });
    expect(r.success).toBe(false);
  });
  it("rejects future bill dates and missing totals", () => {
    expect(claimFormSchema.safeParse({ ...baseClaim, receiptDate: "2999-01-01" }).success).toBe(false);
    expect(claimFormSchema.safeParse({ ...baseClaim, totalAmount: "" }).success).toBe(false);
  });
  it("treats a missing GSTIN as allowed (missing is not invalid)", () => {
    const r = claimFormSchema.safeParse({ ...baseClaim, vendorGstin: "" });
    expect(r.success).toBe(true);
    expect(gstinFormatOk("")).toBe(false);
    expect(gstinFormatOk("27AAFCU5055K1ZO")).toBe(true);
    expect(gstinFormatOk("27AAFCU5055K1Z")).toBe(false);
  });
  it("accepts amounts with Indian grouping commas", () => {
    expect(claimFormSchema.safeParse({ ...baseClaim, totalAmount: "1,240.50", taxType: "NONE" }).success).toBe(true);
  });
});

describe("auth schemas", () => {
  it("requires a letter and a number in new passwords", () => {
    expect(newPasswordSchema.safeParse({ password: "abcdefgh", confirmPassword: "abcdefgh" }).success).toBe(false);
    expect(newPasswordSchema.safeParse({ password: "abcd1234", confirmPassword: "abcd1235" }).success).toBe(false);
    expect(newPasswordSchema.safeParse({ password: "abcd1234", confirmPassword: "abcd1234" }).success).toBe(true);
  });
  it("validates login email", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
  });
  it("validates registration GSTIN format only when provided", () => {
    const base = { fullName: "Sanjay Shinde", email: "s@example.com", phone: "", companyName: "Shinde Agro", gstin: "", city: "", state: "", plan: "GROWTH" as const, password: "Secret123", confirmPassword: "Secret123", acceptTerms: true };
    expect(registerSchema.safeParse(base).success).toBe(true);
    expect(registerSchema.safeParse({ ...base, gstin: "27AABCS1429B1Z" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, acceptTerms: false }).success).toBe(false);
  });
  it("only allows same-origin post-login redirects", () => {
    expect(safeNext("/claims?status=PAID")).toBe("/claims?status=PAID");
    expect(safeNext("https://evil.example")).toBe("/dashboard");
    expect(safeNext("//evil.example")).toBe("/dashboard");
    expect(safeNext("/\\evil.example")).toBe("/dashboard");
    expect(safeNext("/login")).toBe("/dashboard");
    expect(safeNext(null)).toBe("/dashboard");
  });
});

describe("policy schema", () => {
  const valid = { twoLevelApprovalAbove: "5000", duplicateDetectionEnabled: true, duplicateWindowDays: "90", gstinValidationEnabled: true, receiptRequiredAbove: "", categoryLimits: [{ categoryCode: "FOOD", role: "ALL" as const, perClaimLimit: "2500" }] };
  it("accepts configurable thresholds", () => {
    expect(policySchema.safeParse(valid).success).toBe(true);
    expect(policySchema.safeParse({ ...valid, twoLevelApprovalAbove: "12000" }).success).toBe(true);
  });
  it("rejects duplicate category/role limits", () => {
    const r = policySchema.safeParse({ ...valid, categoryLimits: [...valid.categoryLimits, { categoryCode: "FOOD", role: "ALL", perClaimLimit: "3000" }] });
    expect(r.success).toBe(false);
  });
});

describe("invite and contact schemas", () => {
  it("validates invitations", () => {
    expect(inviteSchema.safeParse({ email: "a@b.co", role: "EMPLOYEE" }).success).toBe(true);
    expect(inviteSchema.safeParse({ email: "a@b.co", role: "OWNER" }).success).toBe(false);
  });
  it("rejects filled honeypot and bad phone numbers", () => {
    const base = { fullName: "Asha Patil", email: "asha@example.com", phone: "9820110004" };
    expect(contactSchema.safeParse(base).success).toBe(true);
    expect(contactSchema.safeParse({ ...base, phone: "12" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...base, website: "spam" }).success).toBe(false);
  });
});

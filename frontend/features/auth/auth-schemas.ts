import { z } from "zod";

/** Mirrors AuthDtos.PASSWORD_REGEX on the backend (the backend still validates). */
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/;
export const PASSWORD_MESSAGE = "Use 8–72 characters with at least one letter and one number";
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const email = z.string().trim().min(1, "Enter your email").max(190).email("Enter a valid email");
const password = z.string().regex(PASSWORD_REGEX, PASSWORD_MESSAGE);

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password").max(72),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your name").max(120),
    email,
    phone: z
      .string()
      .trim()
      .max(20)
      .refine((v) => v === "" || /^\+?[0-9 ]{10,15}$/.test(v), "Enter a valid phone number"),
    companyName: z.string().trim().min(2, "Enter your company name").max(160),
    gstin: z
      .string()
      .trim()
      .toUpperCase()
      .refine((v) => v === "" || GSTIN_REGEX.test(v), "GSTIN format looks wrong (15 characters, e.g. 27AABCS1429B1ZB)"),
    city: z.string().trim().max(80),
    state: z.string().trim().max(80),
    plan: z.enum(["STARTER", "GROWTH", "BUSINESS"]),
    password,
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((v) => v, "Please accept the terms to continue"),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotSchema = z.object({ email });
export type ForgotValues = z.infer<typeof forgotSchema>;

export const newPasswordSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });
export type NewPasswordValues = z.infer<typeof newPasswordSchema>;

export const acceptSchema = z
  .object({ fullName: z.string().trim().max(120), password, confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });
export type AcceptValues = z.infer<typeof acceptSchema>;

/** Only same-origin app paths are allowed as post-login redirects (prevents open redirects). */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/dashboard";
  if (/^\/(login|register|forgot-password|reset-password|accept-invitation)(\/|\?|$)/.test(next)) return "/dashboard";
  return next;
}

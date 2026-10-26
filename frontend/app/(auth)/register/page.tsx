"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/auth-provider";
import { AuthShell } from "@/features/auth/auth-shell";
import { registerSchema, type RegisterValues } from "@/features/auth/auth-schemas";
import { PasswordFields } from "@/features/auth/password-fields";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { Notice, Spinner } from "@/components/ui/feedback";
import { errorMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth-service";
import { companyService } from "@/services/company-service";
import type { PlanInfo } from "@/types/api";

const STATES = ["Maharashtra", "Karnataka", "Gujarat", "Tamil Nadu", "Telangana", "Delhi", "Uttar Pradesh", "West Bengal", "Rajasthan", "Madhya Pradesh", "Kerala", "Punjab", "Haryana", "Goa", "Other"];
type Plan = RegisterValues["plan"];
const PLAN_NAMES: Record<Plan, string> = { STARTER: "Starter", GROWTH: "Growth", BUSINESS: "Business" };
const FALLBACK_PLANS: PlanInfo[] = [
  { code: "STARTER", pricePerUserMonthly: 99, currency: "INR" },
  { code: "GROWTH", pricePerUserMonthly: 149, currency: "INR" },
  { code: "BUSINESS", pricePerUserMonthly: 249, currency: "INR" },
];

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <Register />
    </Suspense>
  );
}

function Register() {
  const params = useSearchParams();
  const router = useRouter();
  const { setSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const config = useQuery({ queryKey: ["auth", "config"], queryFn: authService.config, retry: false });
  const plans = useQuery({ queryKey: ["public", "plans"], queryFn: companyService.plans, retry: false });
  const planParam = params.get("plan")?.toUpperCase();
  const initialPlan: Plan = planParam === "STARTER" || planParam === "BUSINESS" ? planParam : "GROWTH";

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", phone: "", companyName: "", gstin: "", city: "", state: "Maharashtra", plan: initialPlan, password: "", confirmPassword: "", acceptTerms: false },
  });
  const errors = form.formState.errors;
  const plan = useWatch({ control: form.control, name: "plan" });

  useEffect(() => form.setValue("plan", initialPlan), [initialPlan, form]);

  if (config.isLoading) {
    return (
      <AuthShell title="Create your workspace">
        <div className="flex justify-center py-space-lg">
          <Spinner />
        </div>
      </AuthShell>
    );
  }
  if (!config.data?.selfRegistrationEnabled) {
    return (
      <AuthShell title="Create your workspace" footer={<Link href="/login" className="text-brand-link hover:underline">Back to sign in</Link>}>
        <Notice tone="info">
          {config.isError ? "We couldn't reach HisabLoop right now. Please try again shortly." : "Self-service sign-up isn't open yet. Book a demo and we'll set up your workspace with you."}
        </Notice>
        <Button asChild size="lg" className="mt-space-md w-full">
          <Link href="/contact">Book a demo</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      wide
      title="Create your company workspace"
      subtitle="You'll be the admin. Invite your team after sign-up. No payment details are collected – billing is not enabled yet."
      footer={
        <>
          Already have an account? <Link href="/login" className="text-brand-link hover:underline">Sign in</Link>
        </>
      }
    >
      <form
        noValidate
        className="mx-auto grid max-w-3xl grid-cols-1 gap-space-md md:grid-cols-2"
        onSubmit={form.handleSubmit(async (v) => {
          setError(null);
          try {
            const res = await authService.register({
              fullName: v.fullName,
              email: v.email,
              password: v.password,
              phone: v.phone || undefined,
              companyName: v.companyName,
              gstin: v.gstin || undefined,
              city: v.city || undefined,
              state: v.state || undefined,
              plan: v.plan,
            });
            setSession(res.session);
            router.replace("/dashboard");
          } catch (e) {
            setError(errorMessage(e));
          }
        })}
      >
        {error && (
          <Notice tone="danger" className="md:col-span-2">
            {error}
          </Notice>
        )}
        <Field label="Your full name" htmlFor="fullName" error={errors.fullName?.message} required>
          <Input id="fullName" autoComplete="name" aria-invalid={Boolean(errors.fullName)} {...form.register("fullName")} />
        </Field>
        <Field label="Work email" htmlFor="email" error={errors.email?.message} required>
          <Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...form.register("email")} />
        </Field>
        <Field label="Mobile (WhatsApp)" htmlFor="phone" error={errors.phone?.message}>
          <Input id="phone" type="tel" autoComplete="tel" placeholder="+91 98xxxxxxxx" {...form.register("phone")} />
        </Field>
        <Field label="Company name" htmlFor="companyName" error={errors.companyName?.message} required>
          <Input id="companyName" autoComplete="organization" aria-invalid={Boolean(errors.companyName)} {...form.register("companyName")} />
        </Field>
        <Field label="Company GSTIN" htmlFor="gstin" hint="Optional. We only check the format here, not registration." error={errors.gstin?.message}>
          <Input id="gstin" className="font-mono uppercase" maxLength={15} aria-invalid={Boolean(errors.gstin)} {...form.register("gstin")} />
        </Field>
        <div className="grid grid-cols-2 gap-space-sm">
          <Field label="City" htmlFor="city" error={errors.city?.message}>
            <Input id="city" autoComplete="address-level2" {...form.register("city")} />
          </Field>
          <Field label="State" htmlFor="state">
            <Select id="state" {...form.register("state")}>
              {STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
        </div>
        <fieldset className="md:col-span-2">
          <legend className="mb-1.5 font-label-md text-label-md text-on-surface">Plan</legend>
          <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-3">
            {(plans.data ?? FALLBACK_PLANS).map((p) => (
              <label key={p.code} className={cn("flex cursor-pointer flex-col rounded-xl bg-surface-container-low p-3 ring-1 ring-transparent transition", plan === p.code && "bg-surface-container-lowest ring-2 ring-secondary")}>
                <input type="radio" value={p.code} className="sr-only" {...form.register("plan")} />
                <span className="font-label-lg text-label-lg text-primary">{PLAN_NAMES[p.code]}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">₹{p.pricePerUserMonthly} / user / month</span>
              </label>
            ))}
          </div>
          <p className="mt-1.5 font-body-sm text-body-sm text-outline">Your plan is recorded on the workspace. You won&apos;t be charged – payments are not set up yet.</p>
        </fieldset>
        <PasswordFields register={form.register} errors={errors} />
        <label className="flex items-start gap-2 font-body-sm text-body-sm text-on-surface-variant md:col-span-2">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded accent-[#006b5f]" {...form.register("acceptTerms")} />
          <span>
            I agree to the <Link href="/terms" className="text-brand-link hover:underline">Terms</Link> and <Link href="/privacy" className="text-brand-link hover:underline">Privacy Policy</Link>.
            {errors.acceptTerms && <span className="block text-danger">{errors.acceptTerms.message}</span>}
          </span>
        </label>
        <Button type="submit" size="lg" loading={form.formState.isSubmitting} className="md:col-span-2">
          Create workspace
        </Button>
      </form>
    </AuthShell>
  );
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell, PasswordInputToggle } from "@/features/auth/auth-shell";
import { useAuth } from "@/features/auth/auth-provider";
import { loginSchema, safeNext, type LoginValues } from "@/features/auth/auth-schemas";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, type DemoAccount } from "@/features/auth/demo-accounts";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Notice, Spinner } from "@/components/ui/feedback";
import { Icon } from "@/components/ui/icon";
import { errorMessage } from "@/lib/api-client";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth-service";

const AVATAR: Record<DemoAccount["key"], string> = {
  sanjay: "bg-primary-container text-on-primary",
  meera: "bg-tertiary-container text-on-tertiary",
  ravi: "bg-secondary text-on-secondary",
  priya: "bg-inverse-surface text-inverse-on-surface",
  anita: "bg-primary text-on-primary",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Login />
    </Suspense>
  );
}

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <Spinner />
    </div>
  );
}

function Login() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { status, setSession } = useAuth();
  const [selected, setSelected] = useState<DemoAccount["key"]>("sanjay");
  const [demoBusy, setDemoBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [registration, setRegistration] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, next, router]);

  useEffect(() => {
    authService
      .config()
      .then((c) => setRegistration(c.selfRegistrationEnabled))
      .catch(() => setRegistration(false));
  }, []);

  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  async function signIn(email: string, password: string) {
    setError(null);
    try {
      const res = await authService.login(email, password);
      setSession(res.session);
      router.replace(next);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  async function continueAsDemo() {
    const acct = DEMO_ACCOUNTS.find((a) => a.key === selected);
    if (!acct) return;
    setDemoBusy(true);
    await signIn(acct.email, DEMO_PASSWORD);
    setDemoBusy(false);
  }

  const notices = (
    <>
      {params.get("expired") && (
        <Notice tone="warning" icon="schedule" className="mb-space-md">
          Your session expired. Please sign in again.
        </Notice>
      )}
      {params.get("reset") && (
        <Notice tone="success" className="mb-space-md">
          Password updated. Sign in with your new password.
        </Notice>
      )}
      {error && (
        <Notice tone="danger" className="mb-space-md">
          {error}
        </Notice>
      )}
    </>
  );

  const emailForm = (
    <form className="mx-auto flex w-full max-w-md flex-col gap-space-md" noValidate onSubmit={form.handleSubmit((v) => signIn(v.email, v.password))}>
      <Field label="Work email" htmlFor="email" error={form.formState.errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(form.formState.errors.email)} {...form.register("email")} />
      </Field>
      <Field
        label={
          <span className="flex w-full items-center justify-between">
            Password
            <Link href="/forgot-password" className="font-label-md text-label-md text-brand-link hover:underline">
              Forgot password?
            </Link>
          </span>
        }
        htmlFor="password"
        error={form.formState.errors.password?.message}
      >
        <div className="relative">
          <Input id="password" type={showPw ? "text" : "password"} autoComplete="current-password" className="pr-10" aria-invalid={Boolean(form.formState.errors.password)} {...form.register("password")} />
          <PasswordInputToggle shown={showPw} onToggle={() => setShowPw((s) => !s)} />
        </div>
      </Field>
      <Button type="submit" size="lg" loading={form.formState.isSubmitting} className="w-full">
        Sign in <Icon name="arrow_forward" className="text-[18px]" />
      </Button>
      {registration && (
        <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
          New to HisabLoop?{" "}
          <Link href="/register" className="font-semibold text-brand-link hover:underline">
            Create a company workspace
          </Link>
        </p>
      )}
    </form>
  );

  if (!env.demoMode) {
    return (
      <AuthShell title="Sign in to HisabLoop" subtitle="Bills, approvals and reimbursements — all in one place.">
        {notices}
        {emailForm}
      </AuthShell>
    );
  }

  const current = DEMO_ACCOUNTS.find((a) => a.key === selected);
  return (
    <AuthShell
      wide
      title="Welcome to HisabLoop"
      subtitle={
        <>
          <p>Bills, approvals and reimbursements — all in one place. Choose a demo role to explore the workspace:</p>
          <div className="mt-space-md inline-flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-1 font-label-sm text-label-sm text-on-surface-variant">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            <span>Development demo mode</span>
            <span className="text-outline-variant">•</span>
            <span>Seeded sample data only</span>
          </div>
        </>
      }
    >
      {notices}
      <div className="relative mb-space-xl grid grid-cols-1 gap-space-md md:grid-cols-2" role="radiogroup" aria-label="Demo role">
        {DEMO_ACCOUNTS.map((a) => {
          const active = a.key === selected;
          return (
            <button
              key={a.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(a.key)}
              onDoubleClick={() => void continueAsDemo()}
              className={cn(
                "group relative cursor-pointer rounded-xl bg-surface-container-lowest p-space-lg text-left shadow-md transition-all duration-200 hover:shadow-lg",
                active && "ring-2 ring-secondary",
              )}
            >
              <div className="absolute right-4 top-4 flex items-center gap-2">
                <span className={cn("flex items-center gap-1 rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-semibold", a.key === "ravi" ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container text-primary")}>
                  {a.key === "ravi" && <Icon name="chat" className="text-[13px]" />}
                  {a.tag}
                </span>
                {active && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-on-secondary">
                    <Icon name="check" className="text-[16px]" />
                  </span>
                )}
              </div>
              <div className="mb-space-md flex items-start gap-3.5">
                <div className={cn("relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-headline-sm text-headline-sm shadow-inner", AVATAR[a.key])}>{a.initials}</div>
                <div className="pr-24">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{a.name}</h3>
                  <p className="font-label-md text-label-md text-on-surface-variant">{a.title}</p>
                  <span className="mt-0.5 block font-label-sm text-label-sm font-medium text-on-surface-variant">{a.subtitle}</span>
                </div>
              </div>
              <p className="mb-space-md line-clamp-2 font-body-sm text-body-sm text-on-surface-variant">{a.description}</p>
              <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-space-sm">
                <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Sign-in</span>
                <span className="truncate font-mono text-[12px] text-on-surface">{a.email}</span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="relative flex flex-col items-center">
        <Button size="lg" onClick={() => void continueAsDemo()} loading={demoBusy} className="group w-full bg-primary-container py-3.5 font-semibold hover:bg-primary sm:w-auto sm:min-w-[340px]">
          Continue as {current?.name} ({current?.title})
          <Icon name="arrow_forward" className="text-lg transition-transform group-hover:translate-x-1" />
        </Button>
        <div className="mt-space-md flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-label-sm text-label-sm text-on-surface-variant">
          <span className="flex items-center gap-1">
            <Icon name="verified_user" className="text-[14px] text-secondary" /> Real sign-in through the API
          </span>
          <span className="text-outline-variant">•</span>
          <span className="flex items-center gap-1">
            <Icon name="key" className="text-[14px] text-secondary" /> Demo password: <span className="font-mono">{DEMO_PASSWORD}</span>
          </span>
          <span className="text-outline-variant">•</span>
          <span>Development only – disabled in production</span>
        </div>
      </div>

      <div className="relative my-space-xl flex items-center gap-3">
        <span className="h-px flex-1 bg-brand-line" />
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">or sign in with email</span>
        <span className="h-px flex-1 bg-brand-line" />
      </div>
      {emailForm}

      <div className="mt-space-xl flex flex-col items-center justify-between gap-2 rounded-xl bg-surface-container-low px-space-md py-space-sm font-body-sm text-body-sm text-on-surface-variant sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-secondary" />
          <span className="font-semibold text-on-surface">Shinde Agro Traders</span>
          <span className="text-outline-variant">|</span>
          <span>Pune, Maharashtra</span>
        </div>
        <div className="flex items-center gap-3">
          <span>
            GSTIN: <span className="font-mono font-semibold text-on-surface">27AABCS1429B1Z5</span>
          </span>
          <span className="text-outline-variant">•</span>
          <span className="rounded bg-surface-container px-2 py-0.5 font-label-sm text-label-sm font-medium">12 Team Members</span>
        </div>
      </div>
    </AuthShell>
  );
}

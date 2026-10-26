"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/features/auth/auth-provider";
import { AuthShell } from "@/features/auth/auth-shell";
import { acceptSchema, type AcceptValues } from "@/features/auth/auth-schemas";
import { PasswordFields } from "@/features/auth/password-fields";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Notice } from "@/components/ui/feedback";
import { errorMessage } from "@/lib/api-client";
import { authService } from "@/services/auth-service";

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={null}>
      <AcceptInvitation />
    </Suspense>
  );
}

function AcceptInvitation() {
  const token = useSearchParams().get("token");
  const router = useRouter();
  const { setSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<AcceptValues>({ resolver: zodResolver(acceptSchema), defaultValues: { fullName: "", password: "", confirmPassword: "" } });

  return (
    <AuthShell
      title="Join your team on HisabLoop"
      subtitle="Set a password to accept the invitation. If you already have a HisabLoop account, use your existing password."
      footer={
        <>
          Already joined? <Link href="/login" className="text-brand-link hover:underline">Sign in</Link>
        </>
      }
    >
      {!token ? (
        <Notice tone="danger">This invitation link is incomplete. Ask your company admin to send a new invitation.</Notice>
      ) : (
        <form
          noValidate
          className="flex flex-col gap-space-md"
          onSubmit={form.handleSubmit(async (v) => {
            setError(null);
            try {
              const res = await authService.acceptInvitation(token, v.password, v.fullName || undefined);
              setSession(res.session);
              router.replace("/dashboard");
            } catch (e) {
              setError(errorMessage(e));
            }
          })}
        >
          {error && <Notice tone="danger">{error}</Notice>}
          <Field label="Your full name" htmlFor="fullName" hint="Optional if you already have an account" error={form.formState.errors.fullName?.message}>
            <Input id="fullName" autoComplete="name" {...form.register("fullName")} />
          </Field>
          <PasswordFields register={form.register} errors={form.formState.errors} />
          <Button type="submit" size="lg" loading={form.formState.isSubmitting}>
            Accept invitation
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

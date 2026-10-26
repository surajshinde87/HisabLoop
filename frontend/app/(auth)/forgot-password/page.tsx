"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/features/auth/auth-shell";
import { forgotSchema, type ForgotValues } from "@/features/auth/auth-schemas";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Notice } from "@/components/ui/feedback";
import { errorMessage } from "@/lib/api-client";
import { authService } from "@/services/auth-service";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema), defaultValues: { email: "" } });

  return (
    <AuthShell title="Reset your password" subtitle="Enter the email you use for HisabLoop." footer={<Link href="/login" className="text-brand-link hover:underline">Back to sign in</Link>}>
      {sent ? (
        <Notice tone="success" icon="mark_email_read">
          If an account exists for that email, a reset link has been issued. It expires in 30 minutes. In development, email delivery is not configured – the link is written to the backend log.
        </Notice>
      ) : (
        <form
          noValidate
          className="flex flex-col gap-space-md"
          onSubmit={form.handleSubmit(async (v) => {
            setError(null);
            try {
              await authService.forgotPassword(v.email);
              setSent(true);
            } catch (e) {
              setError(errorMessage(e));
            }
          })}
        >
          {error && <Notice tone="danger">{error}</Notice>}
          <Field label="Email" htmlFor="email" error={form.formState.errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(form.formState.errors.email)} {...form.register("email")} />
          </Field>
          <Button type="submit" size="lg" loading={form.formState.isSubmitting}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

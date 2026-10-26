"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/features/auth/auth-shell";
import { newPasswordSchema, type NewPasswordValues } from "@/features/auth/auth-schemas";
import { PasswordFields } from "@/features/auth/password-fields";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/feedback";
import { errorMessage } from "@/lib/api-client";
import { authService } from "@/services/auth-service";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}

function ResetPassword() {
  const token = useSearchParams().get("token");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<NewPasswordValues>({ resolver: zodResolver(newPasswordSchema), defaultValues: { password: "", confirmPassword: "" } });

  return (
    <AuthShell title="Choose a new password" footer={<Link href="/login" className="text-brand-link hover:underline">Back to sign in</Link>}>
      {!token ? (
        <Notice tone="danger">
          This reset link is incomplete. <Link href="/forgot-password" className="font-semibold underline">Request a new link</Link>.
        </Notice>
      ) : (
        <form
          noValidate
          className="flex flex-col gap-space-md"
          onSubmit={form.handleSubmit(async (v) => {
            setError(null);
            try {
              await authService.resetPassword(token, v.password);
              router.replace("/login?reset=1");
            } catch (e) {
              setError(errorMessage(e));
            }
          })}
        >
          {error && <Notice tone="danger">{error}</Notice>}
          <PasswordFields register={form.register} errors={form.formState.errors} label="New password" />
          <p className="font-body-sm text-body-sm text-on-surface-variant">For your security, all other signed-in sessions will be signed out.</p>
          <Button type="submit" size="lg" loading={form.formState.isSubmitting}>
            Update password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

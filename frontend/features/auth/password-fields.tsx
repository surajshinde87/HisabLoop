"use client";

import { useState } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Field, Input } from "@/components/ui/form";
import { PasswordInputToggle } from "@/features/auth/auth-shell";
import { PASSWORD_MESSAGE } from "@/features/auth/auth-schemas";

type PwForm = { password: string; confirmPassword: string };

/** New-password + confirmation pair shared by register, reset and invitation forms. */
export function PasswordFields<T extends PwForm>({ register, errors, label = "Password" }: { register: UseFormRegister<T>; errors: FieldErrors<T>; label?: string }) {
  const [shown, setShown] = useState(false);
  const reg = register as unknown as UseFormRegister<PwForm>;
  const errs = errors as FieldErrors<PwForm>;
  return (
    <>
      <Field label={label} htmlFor="password" error={errs.password?.message} hint={errs.password ? undefined : PASSWORD_MESSAGE} required>
        <div className="relative">
          <Input id="password" type={shown ? "text" : "password"} autoComplete="new-password" className="pr-10" aria-invalid={Boolean(errs.password)} {...reg("password")} />
          <PasswordInputToggle shown={shown} onToggle={() => setShown((s) => !s)} />
        </div>
      </Field>
      <Field label="Confirm password" htmlFor="confirmPassword" error={errs.confirmPassword?.message} required>
        <Input id="confirmPassword" type={shown ? "text" : "password"} autoComplete="new-password" aria-invalid={Boolean(errs.confirmPassword)} {...reg("confirmPassword")} />
      </Field>
    </>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { contactService } from "@/services/contact-service";
import { errorMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const phoneRe = /^[0-9 +()-]{10,16}$/;

export const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid business email"),
  phone: z.string().trim().regex(phoneRe, "Enter a 10-digit mobile number"),
  company: z.string().trim().max(160).optional(),
  teamSize: z.string().optional(),
  role: z.string().optional(),
  erp: z.array(z.string()).optional(),
  notes: z.string().trim().max(1500).optional(),
  icai: z.string().trim().max(40).optional(),
  agree: z.boolean().optional(),
  website: z.string().max(0).optional(), // honeypot
});
export type ContactValues = z.infer<typeof contactSchema>;

const partnerSchema = contactSchema.extend({
  company: z.string().trim().min(2, "Enter your firm name").max(160),
  agree: z.literal(true, { message: "Please accept to continue" }),
});

type Tab = "demo" | "sales" | "ca";
const TABS: { id: Tab; label: string }[] = [
  { id: "demo", label: "Schedule a Live Demo (15 Min)" },
  { id: "sales", label: "General Inquiries" },
  { id: "ca", label: "CA Partner Onboarding" },
];
const SLOTS = ["Today, 3:00 PM", "Today, 5:30 PM", "Tomorrow, 11:30 AM"];
const ROLES = [
  { value: "founder", label: "Founder / Owner", hint: "MSME Decision Maker" },
  { value: "cfo", label: "CFO / Controller", hint: "Finance Lead" },
  { value: "ca", label: "CA / Auditor", hint: "Tax Consultant" },
  { value: "ops", label: "Operations Lead", hint: "Field / Fleet Mgr" },
];
const ERPS = [
  { value: "Tally Prime / ERP 9", label: "Tally Prime / ERP 9" },
  { value: "Zoho Books", label: "Zoho Books" },
  { value: "Busy Accounting", label: "Busy Accounting" },
  { value: "QuickBooks / Other", label: "QuickBooks / Other" },
  { value: "None / Excel sheets", label: "None / Excel sheets" },
];

const contactInput =
  "w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md shadow-sm outline-none focus:bg-surface-container-low transition-colors aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-error/40";
const partnerInput =
  "w-full h-10 px-3 rounded-lg bg-surface font-body-md text-body-md text-on-surface outline-none focus:bg-surface-container-lowest transition-colors aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-error/40";

function FieldError({ message }: { message?: string }) {
  return message ? (
    <span role="alert" className="font-body-sm text-body-sm text-error">
      {message}
    </span>
  ) : null;
}

/**
 * Contact / demo-request and CA partner forms, submitted to
 * POST /api/v1/public/contact. Success is only shown after the backend stored the request.
 */
export function ContactForm({ variant }: { variant: "demo" | "partner" }) {
  const [tab, setTab] = useState<Tab>("demo");
  const [slot, setSlot] = useState<string>(SLOTS[0] ?? "");
  const [result, setResult] = useState<{ ok: true; ref: string } | { ok: false; message: string } | null>(null);
  const partner = variant === "partner";
  const form = useForm<ContactValues>({
    resolver: zodResolver(partner ? partnerSchema : contactSchema) as never,
    defaultValues: { teamSize: "10-50", role: "founder", erp: [partner ? "Tally Prime" : "Tally Prime / ERP 9"], website: "", agree: false },
  });
  const { register, handleSubmit, formState } = form;
  const errors = formState.errors;

  async function onSubmit(v: ContactValues) {
    setResult(null);
    const topic = partner || tab === "ca" ? "PARTNERSHIP" : tab === "sales" ? "SALES" : "DEMO";
    const lines = [
      v.notes?.trim() || (partner ? "CA partner registration" : tab === "demo" ? "Demo walkthrough request" : "General enquiry"),
      "",
      partner ? `Firm: ${v.company ?? ""}` : `Role: ${ROLES.find((r) => r.value === v.role)?.label ?? v.role ?? "-"}`,
      partner ? `ICAI / FRN: ${v.icai || "-"}` : `Company size: ${v.teamSize ?? "-"}`,
      `${partner ? "Clients" : "Accounting software"}: ${partner ? (v.teamSize ?? "-") : (v.erp ?? []).join(", ") || "-"}`,
      partner ? `Software: ${(v.erp ?? []).join(", ") || "-"}` : "",
      !partner && tab !== "sales" ? `Preferred slot (IST): ${slot}` : "",
    ].filter(Boolean);
    try {
      const res = await contactService.submit({
        fullName: v.fullName,
        email: v.email,
        phone: v.phone,
        companyName: v.company,
        teamSize: partner ? undefined : v.teamSize,
        topic,
        message: lines.join("\n"),
        website: v.website,
      });
      setResult({ ok: true, ref: res.id.slice(0, 8).toUpperCase() });
      form.reset();
    } catch (e) {
      setResult({ ok: false, message: errorMessage(e, "We could not send your request. Please try again.") });
    }
  }

  const honeypot = (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input tabIndex={-1} autoComplete="off" {...register("website")} />
      </label>
    </div>
  );

  const status = result && (
    <div
      role={result.ok ? "status" : "alert"}
      className={cn(
        "flex items-center gap-space-sm rounded-xl p-space-md font-label-md text-label-md",
        result.ok ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-on-error-container",
      )}
    >
      <span className="material-symbols-outlined" aria-hidden>
        {result.ok ? "check_circle" : "error"}
      </span>
      <span>
        {result.ok
          ? `Request received (ref ${result.ref}). Our team will contact you by email or phone to confirm${partner ? " your partner onboarding" : " a time"}.`
          : result.message}
      </span>
    </div>
  );

  if (partner) {
    return (
      <form className="relative space-y-space-md" onSubmit={handleSubmit(onSubmit)} noValidate>
        {honeypot}
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <div>
            <label htmlFor="p-name" className="mb-1 block font-label-sm text-label-sm text-primary">Full Name *</label>
            <input id="p-name" className={partnerInput} placeholder="CA Rahul Deshmukh" aria-invalid={!!errors.fullName} {...register("fullName")} />
            <FieldError message={errors.fullName?.message} />
          </div>
          <div>
            <label htmlFor="p-firm" className="mb-1 block font-label-sm text-label-sm text-primary">Firm Name / Practice *</label>
            <input id="p-firm" className={partnerInput} placeholder="Deshmukh & Associates, CAs" aria-invalid={!!errors.company} {...register("company")} />
            <FieldError message={errors.company?.message} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <div>
            <label htmlFor="p-email" className="mb-1 block font-label-sm text-label-sm text-primary">Business Email *</label>
            <input id="p-email" type="email" className={partnerInput} placeholder="rahul@deshmukh-ca.in" aria-invalid={!!errors.email} {...register("email")} />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <label htmlFor="p-phone" className="mb-1 block font-label-sm text-label-sm text-primary">Phone Number *</label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-lg bg-surface-container px-3 font-body-sm text-body-sm text-on-surface-variant">+91</span>
              <input id="p-phone" type="tel" className={cn(partnerInput, "rounded-l-none")} placeholder="98230 12345" aria-invalid={!!errors.phone} {...register("phone")} />
            </div>
            <FieldError message={errors.phone?.message} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <div>
            <label htmlFor="p-icai" className="mb-1 block font-label-sm text-label-sm text-primary">ICAI Membership / FRN (Optional)</label>
            <input id="p-icai" className={partnerInput} placeholder="M. No. 142857" {...register("icai")} />
          </div>
          <div>
            <label htmlFor="p-clients" className="mb-1 block font-label-sm text-label-sm text-primary">Estimated MSME Clients</label>
            <select id="p-clients" className={partnerInput} {...register("teamSize")}>
              <option>5 – 20 Clients</option>
              <option>21 – 50 Clients</option>
              <option>51 – 100 Clients</option>
              <option>100+ Clients</option>
            </select>
          </div>
        </div>
        <fieldset>
          <legend className="mb-2 block font-label-sm text-label-sm text-primary">Primary Accounting Software Used</legend>
          <div className="flex flex-wrap gap-2">
            {["Tally Prime", "Zoho Books", "QuickBooks", "Busy Accounting", "Other"].map((s) => (
              <label key={s} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 font-label-sm text-label-sm text-on-surface hover:bg-surface-container">
                <input type="checkbox" value={s} className="rounded text-primary focus:ring-0" {...register("erp")} />
                {s}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="p-notes" className="mb-1 block font-label-sm text-label-sm text-primary">Practice Notes or Specific Requirements</label>
          <textarea id="p-notes" rows={3} className={cn(partnerInput, "h-auto p-3")} placeholder="Tell us about your client mix or any specific ERP integration requirements..." {...register("notes")} />
        </div>
        <div className="flex items-start gap-2">
          <input id="agree" type="checkbox" className="mt-1 rounded text-primary focus:ring-0" {...register("agree")} />
          <label htmlFor="agree" className="font-body-sm text-body-sm text-on-surface-variant">
            I agree to the HisabLoop Privacy Policy and consent to receive practice onboarding assistance via WhatsApp or phone.
          </label>
        </div>
        <FieldError message={errors.agree?.message} />
        <button
          type="submit"
          disabled={formState.isSubmitting}
          className="h-12 w-full rounded-lg bg-primary font-label-lg text-label-lg text-on-primary shadow-sm transition-all duration-200 hover:bg-primary-container disabled:opacity-60"
        >
          {formState.isSubmitting ? "Submitting…" : "Submit CA Partner Registration"}
        </button>
        <div className="flex items-center justify-center gap-2 pt-2 text-center">
          <span className="material-symbols-outlined text-sm text-secondary" aria-hidden>lock</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">Sent over HTTPS. We strictly respect CA-client confidentiality.</span>
        </div>
        {status}
      </form>
    );
  }

  return (
    <>
      <div className="mb-space-lg flex items-center rounded-lg bg-surface-container-low p-1" role="tablist" aria-label="Request type">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-md py-2 text-center font-label-md text-label-md transition-all",
              tab === t.id ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant hover:text-primary",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <form className="relative flex flex-col gap-space-md" onSubmit={handleSubmit(onSubmit)} noValidate>
        {honeypot}
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-primary" htmlFor="full-name">
              Full Name <span className="text-error">*</span>
            </label>
            <input id="full-name" className={contactInput} placeholder="e.g. Ramesh Kulkarni" aria-invalid={!!errors.fullName} {...register("fullName")} />
            <FieldError message={errors.fullName?.message} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-primary" htmlFor="work-email">
              Business Email <span className="text-error">*</span>
            </label>
            <input id="work-email" type="email" className={contactInput} placeholder="name@company.in" aria-invalid={!!errors.email} {...register("email")} />
            <FieldError message={errors.email?.message} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-primary" htmlFor="phone-num">
              WhatsApp / Mobile <span className="text-error">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 flex select-none items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">🇮🇳 +91</span>
              <input id="phone-num" type="tel" className={cn(contactInput, "pl-16")} placeholder="98230 00000" aria-invalid={!!errors.phone} {...register("phone")} />
            </div>
            {errors.phone ? (
              <FieldError message={errors.phone.message} />
            ) : (
              <span className="font-body-sm text-body-sm text-on-surface-variant">We use this to confirm your slot</span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-primary" htmlFor="team-size">Company Size</label>
            <select id="team-size" className={contactInput} {...register("teamSize")}>
              <option value="1-10">&lt; 10 employees (Micro MSME)</option>
              <option value="10-50">10 – 50 employees (Growth MSME)</option>
              <option value="50-200">50 – 200 employees (Scale-up)</option>
              <option value="200+">200+ employees (Multi-branch / Enterprise)</option>
              <option value="ca-firm">Practicing CA Firm / Multi-client</option>
            </select>
          </div>
        </div>
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 font-label-md text-label-md text-primary">
            Your Primary Role <span className="text-error">*</span>
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ROLES.map((r) => (
              <label key={r.value} className="flex cursor-pointer flex-col items-center justify-center rounded-lg bg-surface-container-low p-2 text-center transition-colors hover:bg-surface-container has-[:checked]:ring-2 has-[:checked]:ring-secondary">
                <input type="radio" value={r.value} className="peer sr-only" {...register("role")} />
                <span className="font-label-sm text-label-sm text-primary peer-checked:font-bold">{r.label}</span>
                <span className="mt-0.5 font-body-sm text-[10px] leading-tight text-on-surface-variant">{r.hint}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {tab !== "sales" && (
          <div className="flex flex-col gap-space-xs rounded-xl bg-surface-container-low p-space-md">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-label-md text-label-md text-primary">
                <span className="material-symbols-outlined text-sm text-secondary" aria-hidden>schedule</span>
                Preferred 15-Min Slot
              </span>
              <span className="font-label-sm text-label-sm font-semibold text-secondary">Indian Standard Time (IST)</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Preferred slot">
              {SLOTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={slot === s}
                  onClick={() => setSlot(s)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-center font-label-sm text-label-sm transition-all",
                    slot === s ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface-variant hover:text-primary",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 font-label-md text-label-md text-primary">Current Accounting Ledger / ERP in Use</legend>
          <div className="flex flex-wrap gap-2">
            {ERPS.map((e) => (
              <label key={e.value} className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-surface-container-low px-3 py-1.5 font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container">
                <input type="checkbox" value={e.value} className="rounded text-primary" {...register("erp")} />
                {e.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-col gap-1.5">
          <label className="font-label-md text-label-md text-primary" htmlFor="notes">Specific questions or expense challenges (Optional)</label>
          <textarea
            id="notes"
            rows={2}
            className={cn(contactInput, "h-auto p-3")}
            placeholder="e.g. Need WhatsApp OCR for petrol fuel slips and GST invoice reconciliation for 22 delivery reps..."
            {...register("notes")}
          />
        </div>
        <div className="mt-space-sm flex flex-col gap-space-xs">
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary font-label-lg text-label-lg text-on-primary shadow-sm transition-all hover:bg-primary-container hover:shadow-md disabled:opacity-60"
          >
            <span>{formState.isSubmitting ? "Sending…" : tab === "sales" ? "Send Enquiry" : "Request Demo Walkthrough"}</span>
            <span className="material-symbols-outlined text-lg" aria-hidden>arrow_forward</span>
          </button>
          <div className="flex items-center justify-center gap-2 text-center">
            <span className="material-symbols-outlined text-sm text-secondary" aria-hidden>lock_clock</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">No credit card needed · We confirm the slot with you by phone or email</span>
          </div>
        </div>
        {status}
      </form>
    </>
  );
}

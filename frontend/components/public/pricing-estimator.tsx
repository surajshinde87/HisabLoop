"use client";

import Link from "next/link";
import { useState } from "react";

const UNIT_PRICE = 149; // Growth plan, ₹ per user per month (configurable product plan)
const GST_RATE = 0.18;
const inr = (n: number) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Interactive pricing estimator from the Stitch pricing page. */
export function PricingEstimator() {
  const [users, setUsers] = useState(15);
  const subtotal = users * UNIT_PRICE;
  const gst = Math.round(subtotal * GST_RATE * 100) / 100;
  const total = subtotal + gst;
  return (
    <div className="grid grid-cols-1 items-center gap-space-xl lg:grid-cols-12">
      <div className="flex flex-col gap-space-md lg:col-span-7">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-surface-container px-space-sm py-1 font-label-sm text-label-sm text-primary">
          <span className="material-symbols-outlined text-sm text-secondary" aria-hidden>calculate</span>
          INTERACTIVE INVESTMENT ESTIMATOR
        </div>
        <h2 className="font-headline-lg text-headline-lg tracking-tight text-primary">Estimate your monthly investment</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Calculate projected monthly software expenses based on your active team members who submit or approve receipts.
        </p>
        <div className="mt-space-xs flex flex-col gap-space-md rounded-xl bg-surface-container-low p-space-lg">
          <div className="flex items-center justify-between">
            <label htmlFor="userSlider" className="font-label-lg text-label-lg text-primary">Number of active team members:</label>
            <span className="font-headline-md text-headline-md font-bold text-secondary" aria-live="polite">{users} users</span>
          </div>
          <input
            id="userSlider"
            type="range"
            min={3}
            max={60}
            step={1}
            value={users}
            onChange={(e) => setUsers(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-container accent-secondary"
          />
          <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
            <span>3 users (Starter shop)</span>
            <span>25 users (Standard MSME)</span>
            <span>60+ (Multi-branch)</span>
          </div>
        </div>
        <div className="flex items-center gap-space-sm rounded-xl bg-secondary-container/20 p-space-md text-on-secondary-container">
          <span className="material-symbols-outlined shrink-0 text-2xl text-secondary" aria-hidden>hourglass_top</span>
          <p className="font-body-sm text-body-sm leading-relaxed">
            <strong>High ROI:</strong> The typical Indian MSME saves ~28 hours per month in manual receipt chasing, invoice typing, and
            month-end CA back-and-forth.
          </p>
        </div>
      </div>
      <div className="flex flex-col justify-between rounded-xl bg-surface-container p-space-xl lg:col-span-5">
        <div>
          <div className="mb-space-md flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Recommended Plan</span>
            <span className="rounded-full bg-secondary px-space-sm py-0.5 font-label-sm text-label-sm text-on-secondary">Growth Tier</span>
          </div>
          <div className="flex flex-col gap-space-sm py-space-sm">
            <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant">
              <span>
                {users} users × ₹{UNIT_PRICE}/mo
              </span>
              <span className="font-semibold text-on-surface tabular-nums">{inr(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
              <span>Applicable GST (18%)</span>
              <span className="font-medium text-on-surface tabular-nums">{inr(gst)}</span>
            </div>
            <div className="my-space-xs h-px w-full bg-outline-variant/30" />
            <div className="flex items-baseline justify-between pt-space-xs">
              <div>
                <span className="block font-label-lg text-label-lg text-primary">Net Monthly Total</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Billed monthly, cancel anytime</span>
              </div>
              <div className="text-right">
                <span className="block font-currency-display text-currency-display leading-none text-primary" aria-live="polite">
                  {inr(total)}
                </span>
                <span className="font-label-sm text-label-sm font-semibold text-secondary">Incl. 1 CA seat</span>
              </div>
            </div>
          </div>
          <div className="mt-space-lg flex flex-col gap-2 border-t border-outline-variant/20 pt-space-md">
            {["WhatsApp expense bot access for all users", "Free read-only ledger portal for your CA", "Instant GSTIN checksum & GSTR-2B reports"].map((f) => (
              <div key={f} className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-base text-secondary" aria-hidden>check</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-space-lg">
          <Link
            href="/register"
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-space-md font-label-lg text-label-lg text-on-primary transition-colors hover:bg-primary-container"
          >
            Start 14-Day Growth Trial
          </Link>
        </div>
      </div>
    </div>
  );
}

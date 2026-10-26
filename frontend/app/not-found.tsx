import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <Logo />
      <div>
        <p className="font-label-md text-label-md uppercase tracking-wider text-secondary">404</p>
        <h1 className="mt-2 font-headline-lg text-headline-lg text-primary">This page could not be found</h1>
        <p className="mt-2 font-body-md text-body-md text-on-surface-variant">The link may be broken or the page may have moved.</p>
      </div>
      <div className="flex gap-3">
        <Link href="/" className="inline-flex h-10 items-center rounded-lg bg-primary px-5 font-label-lg text-label-lg text-on-primary hover:bg-primary-container">
          Go to homepage
        </Link>
        <Link href="/dashboard" className="inline-flex h-10 items-center rounded-lg bg-surface-container-lowest px-5 font-label-lg text-label-lg text-primary shadow-sm">
          Open workspace
        </Link>
      </div>
    </main>
  );
}

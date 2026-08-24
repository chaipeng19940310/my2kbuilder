import Link from "next/link";

// Real 404 (contract §6.2): unknown routes get a true not-found with exits
// back to home and the tools.
export default function NotFound() {
  return (
    <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-grow flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <span className="font-display text-display-lg text-primary-container">404</span>
      <h1 className="font-display text-headline-md text-on-surface">This page doesn&apos;t exist</h1>
      <p className="max-w-md text-body-md text-on-surface-variant">
        The route you opened isn&apos;t part of My2KBuilder. Head back home or jump straight into a
        tool.
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/"
          className="rounded border border-outline px-6 py-3 text-label-md font-bold text-on-surface transition-colors duration-200 hover:bg-surface-card"
        >
          Back to Home
        </Link>
        <Link
          href="/badge-token-planner"
          className="rounded bg-primary-container px-6 py-3 text-label-md font-bold text-on-primary transition-colors duration-200 hover:bg-surface-tint"
        >
          Open Badge Token Planner
        </Link>
      </div>
    </main>
  );
}

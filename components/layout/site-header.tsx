import Link from "next/link";
import { HeaderAuth } from "@/app/(home)/header-auth";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="shell flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          {/* Simple geometric mark: stacked tiffin tiers */}
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-7 w-7 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M4 12h16" />
            <path d="M5.5 12a6.5 6.5 0 0 1 13 0" />
            <path d="M5.5 12v3a6.5 6.5 0 0 0 13 0v-3" />
            <path d="M12 5.5V4" />
            <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" />
          </svg>
          {/* nowrap keeps the wordmark on one line at 375px — the wrapped
              three-line stack looked broken, and the nav has room to spare */}
          <span className="shrink-0 whitespace-nowrap font-display text-base font-semibold tracking-tight sm:text-lg">
            The Tiffin Club
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
          <Link
            href="/#how-it-works"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium underline-offset-4 text-primary hover:underline sm:block"
          >
            How it works
          </Link>
          <Link
            href="/#faq"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium underline-offset-4 text-primary hover:underline sm:block"
          >
            FAQ
          </Link>
          <HeaderAuth />
          <Link
            href="/#todays-menu"
            className="whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98] sm:px-4"
          >
            Order today
          </Link>
        </nav>
      </div>
    </header>
  );
}

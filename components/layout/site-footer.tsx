// components/layout/site-footer.tsx
import { RESTAURANT } from "@/lib/brand";
import { FooterContact } from "./footer-contact";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      {/* Mast: the wordmark over the links. */}
      <div className="shell py-[var(--space-3xl)]">
        <p className="font-display text-2xl font-semibold">{RESTAURANT.name}</p>
        <p className="mt-[var(--space-2xs)] text-sm text-muted-foreground">
          Today&apos;s meal, ordered simply. Home-style tiffin in {RESTAURANT.area}.
        </p>
        <div className="mt-[var(--space-2xl)] grid gap-[var(--space-xl)] border-t border-border pt-[var(--space-xl)] sm:grid-cols-3">
          <FooterContact />
        </div>
      </div>
      <div className="border-t border-border py-[var(--space-md)] text-center text-xs text-muted-foreground">
        © The Tiffin Club. Pay in person at pickup or delivery.
      </div>
    </footer>
  );
}

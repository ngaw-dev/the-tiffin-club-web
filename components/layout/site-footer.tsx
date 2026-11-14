import { RESTAURANT } from "@/lib/brand";
import { FooterContact } from "./footer-contact";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/60">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-display text-base font-semibold">{RESTAURANT.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Today&apos;s meal, ordered simply. Home-style tiffin in {RESTAURANT.area}.
          </p>
        </div>
        <FooterContact />
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © The Tiffin Club. Pay in person at pickup or delivery.
      </div>
    </footer>
  );
}

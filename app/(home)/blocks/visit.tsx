// app/(home)/blocks/visit.tsx
import Link from "next/link";
import type { ContactInfo } from "@/lib/brand";

interface VisitProps {
  windowLabel: string | null;
  contact: ContactInfo;
}

/**
 * The close: the job again (order), beside the practical facts a guest needs
 * to act — the cutoff, the pickup window, the address, the phone. Everything
 * here is a fact the page already carried.
 */
export function Visit({ windowLabel, contact }: VisitProps) {
  // Non-breaking space keeps "11:00 PM" from splitting across lines.
  const cutoff = windowLabel ? windowLabel.split("-")[1]?.replace(" ", " ") : null;

  return (
    <section className="bg-secondary" aria-labelledby="visit">
      <div className="shell grid gap-[var(--space-2xl)] py-[var(--space-3xl)] lg:grid-cols-[7fr_5fr] lg:items-center">
        <div>
          <h2 id="visit" className="text-display-s">
            {cutoff ? `Order by ${cutoff}, eat today.` : "Order today, eat today."}
          </h2>
          <div className="mt-[var(--space-xl)] flex flex-wrap gap-3">
            <Link
              href="/#todays-menu"
              className="rounded-lg bg-primary px-[var(--space-lg)] py-[var(--space-sm)] text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 motion-safe:active:scale-[0.98]"
            >
              Order today&apos;s meal
            </Link>
          </div>
        </div>

        <dl className="divide-y divide-border border-y border-border text-sm [&>div]:py-[var(--space-lg)] [&>div:first-child]:pt-0 [&>div:last-child]:pb-0">
          <div>
            <dt className="font-medium">Pickup</dt>
            <dd className="mt-[var(--space-2xs)] text-muted-foreground">
              {contact.pickupWindow ? `Daily, ${contact.pickupWindow}` : "Daily"}
              {contact.pickupAddress ? (
                <>
                  {", "}
                  <a
                    href={contact.pickupMapUrl ?? "#"}
                    target="_blank"
                    className="underline underline-offset-4 hover:text-foreground"
                    rel="noreferrer"
                  >
                    {contact.pickupAddress}
                  </a>
                </>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="font-medium">Delivery</dt>
            <dd className="mt-[var(--space-2xs)] text-muted-foreground">
              Selected Wellington suburbs, no delivery fee. The list is in checkout.
            </dd>
          </div>
          {contact.phoneHref ? (
            <div>
              <dt className="font-medium">Questions</dt>
              <dd className="mt-[var(--space-2xs)]">
                <a href={contact.phoneHref} className="text-primary underline underline-offset-4">
                  {contact.phone}
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </section>
  );
}

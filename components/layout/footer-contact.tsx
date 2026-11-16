"use client";

import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@/lib/api";
import { contactFromSettings } from "@/lib/brand";
import Link from "next/link";

/** Footer contact columns driven by the settings query. */
export function FooterContact() {
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });
  const contact = contactFromSettings(settings ?? null);

  return (
    <>
      <div className="text-sm">
        <p className="font-medium">Hours</p>
        <ul className="mt-2 space-y-1 text-muted-foreground">
          <li>Pickup: {contact.pickupWindow}</li>
          <li>Last order: {contact.orderCutoffTime}</li>
          <li>
            <a
              href={contact.pickupMapUrl}
              className="mt-2 inline-block rounded-lg underline-offset-4 hover:underline"
              target="_blank"
            >
              {contact.pickupAddress}
            </a>{" "}
          </li>
        </ul>
      </div>
      <div className="text-sm">
        <p className="font-medium">Questions?</p>
        {contact.phoneHref && (
          <a
            href={contact.phoneHref}
            className="mt-2 inline-block rounded-lg text-primary underline-offset-4 hover:underline"
          >
            {contact.phone}
          </a>
        )}
        {contact.altPhoneHref && (
          <>
            <br />
            <a
              href={contact.altPhoneHref}
              className="mt-1 inline-block rounded-lg text-primary underline-offset-4 hover:underline"
            >
              {contact.altPhone}
            </a>
          </>
        )}
        <p className="mt-2 text-muted-foreground">
          Have an order?{" "}
          <Link href="/orders" className="underline underline-offset-4 hover:text-foreground">
            Find my order
          </Link>
        </p>
      </div>
    </>
  );
}

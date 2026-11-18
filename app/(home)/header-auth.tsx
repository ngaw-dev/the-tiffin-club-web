"use client";

import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

/** Header auth/order row: order link + Clerk sign-in / user menu. */
export function HeaderAuth() {
  return (
    <span className="flex items-center gap-1">
      {/* Hidden on the smallest screens: the header row can't fit logo +
          orders + sign-in + CTA at 375px, and /orders stays reachable from
          the footer's "Find my order" link. */}
      <Button
        asChild
        variant="link"
        className="hidden min-h-11 px-3 py-2 text-sm font-medium sm:inline-flex"
      >
        <Link href="/orders">My orders</Link>
      </Button>
      <Show when="signed-in">
        <UserButton />
      </Show>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <Button variant="link" className="min-h-11 px-3 py-2 text-sm font-medium">
            Sign in
          </Button>
        </SignInButton>
      </Show>
    </span>
  );
}

"use client";

import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

/** Header auth/order row: order link + Clerk sign-in / user menu. */
export function HeaderAuth() {
  return (
    <span className="flex items-center gap-1">
      <Button asChild variant="link" className="min-h-11 px-3 py-2 text-sm font-medium">
        <Link href="/order">My order</Link>
      </Button>
      <Show when="signed-in">
        <Button asChild variant="link" className="min-h-11 px-3 py-2 text-sm font-medium">
          <Link href="/orders">My orders</Link>
        </Button>
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

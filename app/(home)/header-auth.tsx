"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignInLink } from "@/app/(home)/sign-in";

/** Header auth/order row: text links. */
export function HeaderAuth() {
  return (
    <span className="flex items-center">
      <Button asChild variant="link" className="min-h-11 px-3 py-2 text-sm font-medium">
        <Link href="/order">My order</Link>
      </Button>
      <SignInLink />
    </span>
  );
}

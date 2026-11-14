"use client";

import Link from "next/link";
import { SignInLink } from "@/app/(home)/sign-in";

/** Header auth/order row: text links. */
export function HeaderAuth() {
  return (
    <span className="flex items-center">
      <Link
        href="/order"
        className="rounded-lg px-3 py-2 text-sm font-medium underline-offset-4 hover:underline"
      >
        My order
      </Link>
      <SignInLink />
    </span>
  );
}

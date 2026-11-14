"use client";

import { FindOrderLink } from "@/components/home/order-status";
import { SignInLink } from "@/components/home/sign-in";

/** Header auth/order row: text links, dialog-driven. */
export function HeaderAuth() {
  return (
    <span className="flex items-center">
      <FindOrderLink />
      <SignInLink />
    </span>
  );
}

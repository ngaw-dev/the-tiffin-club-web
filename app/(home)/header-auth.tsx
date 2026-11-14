"use client";

import { FindOrderLink } from "@/app/(home)/order-status";
import { SignInLink } from "@/app/(home)/sign-in";

/** Header auth/order row: text links, dialog-driven. */
export function HeaderAuth() {
  return (
    <span className="flex items-center">
      <FindOrderLink />
      <SignInLink />
    </span>
  );
}

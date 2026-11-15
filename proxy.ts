import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Clerk runs on every page request (matcher below); /order stays public —
 * guests manage today's orders via manage tokens, and signed-in users get
 * their full account history on the same page. Only auth pages are dynamic.
 */
export default clerkMiddleware(async (_auth, _request) => {
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/"],
};

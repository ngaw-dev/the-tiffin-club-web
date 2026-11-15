import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Clerk runs on every page request (matcher below); only /orders requires
 * sign-in. /order (today's manage-token orders), /checkout and the auth
 * pages stay public — guest ordering works without an account.
 */
export default clerkMiddleware(async (auth, request) => {
  if (request.nextUrl.pathname === "/orders") {
    await auth.protect();
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/"],
};

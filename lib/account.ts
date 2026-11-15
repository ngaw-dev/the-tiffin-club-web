// Clerk-authenticated account API (api.md "Account (Clerk)"). The bearer is
// the Clerk session JWT; the backend verifies it and maps to a customer by
// verified email. Endpoints: GET /my-account, GET /my-orders.

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { api, unwrap } from "./api";
import type { AccountPrefill, ApiEnvelope, Order } from "./types";

function authHeaders(token: string): { headers: { Authorization: string } } {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export function getMyAccount(token: string): Promise<AccountPrefill> {
  return unwrap(api.get<ApiEnvelope<AccountPrefill>>("/my-account", authHeaders(token)));
}

export function getMyOrders(token: string): Promise<Order[]> {
  return unwrap(api.get<ApiEnvelope<Order[]>>("/my-orders", authHeaders(token)));
}

/** Prefill for checkout — replaces the legacy localStorage-token prefill. */
export function usePrefill() {
  const { isSignedIn, getToken } = useAuth();
  return useQuery({
    queryKey: ["account", "prefill"],
    queryFn: async () => getMyAccount((await getToken())!),
    enabled: isSignedIn === true,
    staleTime: 5 * 60_000,
  });
}

// Typed axios client for /api/v1 (api.md). Unwraps the shared envelope and
// normalizes errors for the UI.

import axios, { AxiosError } from "axios";
import type {
  AccountPrefill,
  ApiEnvelope,
  Order,
  PlaceOrderInput,
  StoreSettings,
  TodayMenu,
} from "./types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1",
  headers: { Accept: "application/json" },
});

/** Normalized API error the UI can render inline or toast. */
export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;
  ordering?: unknown; // present on 422 ordering-window errors

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string> = {},
    ordering?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.ordering = ordering;
  }
}

function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  const ax = err as AxiosError<ApiEnvelope<unknown>>;
  const status = ax.response?.status ?? 0;
  const body = ax.response?.data;

  if (body && body.success === false) {
    const e = body.errors ?? {};
    let message = body.message || "Request failed";
    const fieldErrors: Record<string, string> = {};
    let ordering: unknown;

    if (!("error" in e)) {
      // Validation: { field: [msgs] }
      for (const [field, msgs] of Object.entries(e)) {
        fieldErrors[field] = (msgs as string[])[0] ?? "Invalid";
      }
      message = body.message || Object.values(fieldErrors)[0] || message;
    } else {
      message = e.error as string;
    }

    // Ordering-window 422s carry an `ordering` object per api.md
    const raw = e as Record<string, unknown>;
    if (raw && typeof raw === "object" && "ordering" in raw) {
      ordering = raw.ordering;
    }

    return new ApiError(status, message, fieldErrors, ordering);
  }

  return new ApiError(status, ax.message || "Network error");
}

async function unwrap<T>(p: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  try {
    const res = await p;
    return res.data.data;
  } catch (err) {
    throw toApiError(err);
  }
}

// --- Storefront ---

export function getTodayMenu(): Promise<TodayMenu> {
  return unwrap(api.get<ApiEnvelope<TodayMenu>>("/menu/today"));
}

export function getSettings(): Promise<StoreSettings> {
  return unwrap(api.get<ApiEnvelope<StoreSettings>>("/settings"));
}

// --- Orders (guest-first) ---

export function placeOrder(input: PlaceOrderInput): Promise<Order> {
  return unwrap(api.post<ApiEnvelope<Order>>("/orders", input));
}

export function lookupOrder(input: {
  token: string;
  email?: string;
  phone?: string;
}): Promise<Order> {
  return unwrap(api.post<ApiEnvelope<Order>>("/orders/lookup", input));
}

export function getOrder(token: string): Promise<Order> {
  return unwrap(api.get<ApiEnvelope<Order>>(`/orders/${token}`));
}

export function updateOrder(
  token: string,
  input: Partial<PlaceOrderInput>,
): Promise<Order> {
  return unwrap(api.patch<ApiEnvelope<Order>>(`/orders/${token}`, input));
}

export function cancelOrder(token: string): Promise<Order> {
  return unwrap(api.delete<ApiEnvelope<Order>>(`/orders/${token}`));
}

// --- Account (optional) ---

export function register(input: {
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<{ token: string }> {
  return unwrap(api.post<ApiEnvelope<{ token: string }>>("/account/register", input));
}

export function login(input: { email: string; password: string }): Promise<{
  token: string;
}> {
  return unwrap(api.post<ApiEnvelope<{ token: string }>>("/account/login", input));
}

export function getAccountOrders(bearer: string): Promise<Order[]> {
  return unwrap(
    api.get<ApiEnvelope<Order[]>>("/account/orders", {
      headers: { Authorization: `Bearer ${bearer}` },
    }),
  );
}

export function getPrefill(bearer: string): Promise<AccountPrefill> {
  return unwrap(
    api.get<ApiEnvelope<AccountPrefill>>("/account/prefill", {
      headers: { Authorization: `Bearer ${bearer}` },
    }),
  );
}

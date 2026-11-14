// Guest order memory: today's manage tokens in localStorage. No PII, no
// cached totals — the order page always fetches live from the API.

const KEY = "tiffin_orders_v1";

export interface StoredOrder {
  token: string;
  placedAt: string; // ISO-8601
}

function parse(raw: string | null): StoredOrder[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (e): e is StoredOrder =>
        e && typeof e.token === "string" && typeof e.placedAt === "string",
    );
  } catch {
    return [];
  }
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/** Today's stored orders, newest first. Prunes stale entries as a side effect. */
export function todayOrders(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  const kept = parse(window.localStorage.getItem(KEY)).filter((e) => isToday(e.placedAt));
  window.localStorage.setItem(KEY, JSON.stringify(kept));
  return kept.sort((a, b) => b.placedAt.localeCompare(a.placedAt));
}

export function rememberOrder(token: string): void {
  if (typeof window === "undefined") return;
  const kept = parse(window.localStorage.getItem(KEY)).filter(
    (e) => e.token !== token && isToday(e.placedAt),
  );
  kept.push({ token, placedAt: new Date().toISOString() });
  window.localStorage.setItem(KEY, JSON.stringify(kept));
}

export function forgetOrder(token: string): void {
  if (typeof window === "undefined") return;
  const kept = parse(window.localStorage.getItem(KEY)).filter((e) => e.token !== token);
  window.localStorage.setItem(KEY, JSON.stringify(kept));
}

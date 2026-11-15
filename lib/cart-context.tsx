"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { MenuItem } from "@/lib/types";

export interface CartLine {
  item: MenuItem;
  quantity: number; // 1–20 per api.md
}

interface CartContextValue {
  lines: CartLine[];
  addItem: (item: MenuItem, quantity?: number) => void;
  setQuantity: (item: MenuItem, quantity: number) => void;
  removeItem: (itemId: number) => void;
  clear: () => void;
  count: number;
  total: number; // cents
  toPayload: () => { id: number; quantity: number }[];
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const setQuantity = useCallback((item: MenuItem, quantity: number) => {
    setLines((prev) => {
      const next = Math.max(0, Math.min(20, quantity)); // API limit 1–20
      const existing = prev.find((l) => l.item.id === item.id);
      if (!existing) {
        return next > 0 ? [...prev, { item, quantity: next }] : prev;
      }
      // Bail when nothing changes — returning a new array here would loop
      // any effect that depends on cart state or on re-derived item objects.
      if (existing.quantity === next) return prev;
      return next === 0
        ? prev.filter((l) => l.item.id !== item.id)
        : prev.map((l) => (l.item.id === item.id ? { ...l, quantity: next } : l));
    });
  }, []);

  const addItem = useCallback((item: MenuItem, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.item.id === item.id);
      if (existing) {
        // No-op when the quantity wouldn't change (capped at 20).
        const target = Math.min(20, existing.quantity + quantity);
        if (target === existing.quantity) return prev;
        return prev.map((l) => (l.item.id === item.id ? { ...l, quantity: target } : l));
      }
      return [...prev, { item, quantity: Math.min(20, Math.max(1, quantity)) }];
    });
  }, []);

  const removeItem = useCallback((itemId: number) => {
    setLines((prev) => prev.filter((l) => l.item.id !== itemId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.quantity, 0);
    const total = lines.reduce((n, l) => n + l.item.price * l.quantity, 0);
    return {
      lines,
      addItem,
      setQuantity,
      removeItem,
      clear,
      count,
      total,
      toPayload: () => lines.map((l) => ({ id: l.item.id, quantity: l.quantity })),
    };
  }, [lines, addItem, setQuantity, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

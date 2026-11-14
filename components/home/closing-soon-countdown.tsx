"use client";

import { useEffect, useState } from "react";
import { formatTime } from "@/lib/format";

/**
 * Friendly closing-soon countdown. Receives the HH:MM cutoff from the server
 * (authoritative); re-renders periodically.
 */
export function ClosingSoonCountdown({ closesAt }: { closesAt: string }) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Compute today's cutoff Date from HH:MM in the user's timezone.
  const [h, m] = closesAt.split(":").map(Number);
  const cutoff = new Date();
  cutoff.setHours(h, m, 0, 0);
  const remaining = cutoff.getTime() - now;

  if (remaining <= 0) {
    return (
      <p className="text-sm font-medium text-primary">
        Heads up: ordering has just closed for today.
      </p>
    );
  }

  const mins = Math.floor(remaining / 60_000);
  const hrs = Math.floor(mins / 60);
  const label =
    hrs > 0
      ? `${hrs}h ${mins % 60}m`
      : mins >= 1
        ? `${mins} minute${mins === 1 ? "" : "s"}`
        : "less than a minute";

  return (
    <p className="text-sm font-medium text-primary" role="status">
      Heads up: ordering closes at {formatTime(closesAt)} ({label} left). Get
      your tiffin in before then!
    </p>
  );
}

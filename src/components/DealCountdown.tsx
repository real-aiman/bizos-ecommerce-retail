"use client";

import { useEffect, useState } from "react";

const parts = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
};

/** Counts down to the end (UTC) of an ISO date. Renders nothing until mounted to avoid hydration drift. */
export function DealCountdown({ until }: { until: string }) {
  const end = new Date(`${until}T23:59:59Z`).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  if (now === null || Number.isNaN(end)) return null;
  if (now > end) return <span className="countdown ended">Ended</span>;
  const t = parts(end - now);
  return (
    <span className="countdown" role="timer" aria-label={`Ends in ${t.d} days ${t.h} hours ${t.m} minutes`}>
      {t.d > 0 && <b>{t.d}d</b>}<b>{String(t.h).padStart(2, "0")}h</b><b>{String(t.m).padStart(2, "0")}m</b><b>{String(t.s).padStart(2, "0")}s</b>
    </span>
  );
}

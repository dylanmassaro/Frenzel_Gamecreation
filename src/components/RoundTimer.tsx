import { useEffect, useState } from "react";

interface Props {
  endsAt: number | null;
  onExpire: () => void;
}

/** Countdown clock. Calls onExpire once when the deadline passes. */
export default function RoundTimer({ endsAt, onExpire }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endsAt === null) return;
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [endsAt]);

  useEffect(() => {
    if (endsAt === null) return;
    if (Date.now() >= endsAt) onExpire();
  }, [endsAt, now, onExpire]);

  if (endsAt === null) return null;
  const ms = Math.max(0, endsAt - now);
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const low = ms < 30_000;

  return (
    <div
      className={`rounded-lg px-3 py-1.5 font-mono text-sm font-medium ${
        low ? "bg-berry/10 text-berry" : "bg-espresso/5 text-espresso"
      }`}
    >
      ⏱ {min}:{sec.toString().padStart(2, "0")}
    </div>
  );
}

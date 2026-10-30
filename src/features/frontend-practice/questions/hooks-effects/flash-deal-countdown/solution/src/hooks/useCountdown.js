// src/hooks/useCountdown.js — drives the "Deal ends in 0:45" timers on the Flash Deals page
// (see client/src/pages/FlashDeals.tsx).
//
// useCountdown(totalSeconds, tickMs) returns the seconds left. `tickMs` is how long one
// "second" lasts (default 1000) so tests can run it quickly.
//
// Reported by shoppers: the number goes down once and then freezes.
// Reported by the performance team: timers keep running after leaving the page.
import { useEffect, useState } from "react";

const useCountdown = (totalSeconds, tickMs = 1000) => {
  const [remaining, setRemaining] = useState(totalSeconds);

  // FIX (restart): a new duration starts the countdown over.
  useEffect(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  // Only keep a timer alive while there is time left. When `remaining` reaches 0 this
  // flips to false, the effect re-runs, and the cleanup below clears the interval.
  const isRunning = remaining > 0;

  useEffect(() => {
    if (!isRunning) return;

    // ROOT CAUSE 1 (frozen): the interval callback used `remaining` from the render in which
    // the effect was created (a stale closure), so every tick computed `initial - 1`.
    // FIX: the functional update always receives the latest value.
    const timer = setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, tickMs);

    // ROOT CAUSE 2 (leak): the interval id was thrown away, so nothing could stop it.
    // FIX: return a cleanup that clears it (unmount, tickMs change, countdown finished).
    return () => clearInterval(timer);
  }, [isRunning, tickMs]);

  return remaining;
};

export default useCountdown;

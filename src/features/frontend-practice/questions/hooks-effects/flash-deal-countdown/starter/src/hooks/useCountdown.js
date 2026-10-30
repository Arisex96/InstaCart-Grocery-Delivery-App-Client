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

  useEffect(() => {
    setInterval(() => {
      setRemaining(remaining - 1);
    }, tickMs);
  }, []);

  return remaining;
};

export default useCountdown;

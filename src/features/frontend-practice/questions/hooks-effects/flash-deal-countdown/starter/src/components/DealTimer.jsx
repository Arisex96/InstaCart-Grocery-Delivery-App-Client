// src/components/DealTimer.jsx — read-only. Formats the value coming from useCountdown.
import useCountdown from "../hooks/useCountdown";

export const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes + ":" + String(seconds).padStart(2, "0");
};

const DealTimer = ({ seconds, tickMs = 1000, label = "Deal ends in" }) => {
  const remaining = useCountdown(seconds, tickMs);

  return (
    <p className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-app-error">
      {label} {formatTime(remaining)}
    </p>
  );
};

export default DealTimer;

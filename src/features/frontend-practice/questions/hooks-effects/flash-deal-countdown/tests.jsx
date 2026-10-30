import { render, renderHook, screen, waitFor } from "@testing-library/react";
import useCountdown from "./src/hooks/useCountdown";
import DealTimer from "./src/components/DealTimer";

const TICK = 20;

// Track the intervals that use our tick length (Testing Library polls with its own interval).
const realSetInterval = window.setInterval;
const realClearInterval = window.clearInterval;
let live;
let created;

beforeEach(() => {
  live = new Set();
  created = 0;
  window.setInterval = (callback, ms, ...rest) => {
    const id = realSetInterval(callback, ms, ...rest);
    if (ms === TICK) {
      live.add(id);
      created += 1;
    }
    return id;
  };
  window.clearInterval = (id) => {
    live.delete(id);
    return realClearInterval(id);
  };
});
afterEach(() => {
  window.setInterval = realSetInterval;
  window.clearInterval = realClearInterval;
});

const recordedHook = (initial) => {
  const seen = [];
  const utils = renderHook(
    ({ seconds }) => {
      const value = useCountdown(seconds, TICK);
      if (seen[seen.length - 1] !== value) seen.push(value);
      return value;
    },
    { initialProps: { seconds: initial } },
  );
  return { ...utils, seen };
};

describe("useCountdown", () => {
  it("counts down one step per tick until it reaches 0", async () => {
    const { result, seen } = recordedHook(3);
    expect(result.current).toBe(3);
    await waitFor(() => expect(result.current).toBe(0));
    expect(seen).toEqual([3, 2, 1, 0]);
  });

  it("never goes negative and leaves no interval running after 0", async () => {
    const { result } = recordedHook(2);
    await waitFor(() => expect(result.current).toBe(0));
    await sleep(120); // several more ticks
    expect(result.current).toBe(0);
    expect(live.size).toBe(0);
  });

  it("clears its interval when the component unmounts", async () => {
    const { unmount } = recordedHook(50);
    await sleep(60);
    expect(live.size).toBe(1);
    unmount();
    expect(live.size).toBe(0);
  });

  it("creates a single interval instead of one per tick", async () => {
    recordedHook(50);
    await sleep(120); // roughly five ticks
    expect(created).toBe(1);
  });

  it("restarts from the new value when totalSeconds changes", async () => {
    const { result, rerender } = recordedHook(30);
    await sleep(50);
    rerender({ seconds: 8 });
    await waitFor(() => expect(result.current).toBeLessThan(9));
    expect(result.current).toBeGreaterThan(5);
    expect(live.size).toBe(1);
  });

  it("starts at 0 without creating a timer when totalSeconds is 0", async () => {
    const { result } = recordedHook(0);
    await sleep(60);
    expect(result.current).toBe(0);
    expect(live.size).toBe(0);
  });
});

describe("DealTimer", () => {
  it("formats the remaining time as m:ss", () => {
    render(<DealTimer seconds={65} tickMs={TICK} />);
    expect(screen.getByText("Deal ends in 1:05")).toBeInTheDocument();
  });
});

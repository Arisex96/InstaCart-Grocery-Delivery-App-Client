import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

const STORAGE_KEY = "frontend-practice-lab:editor-height";

function readStored(fallback: number) {
  try {
    const value = Number(window.localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(value) && value > 0 ? value : fallback;
  } catch {
    return fallback;
  }
}

/**
 * A horizontal splitter that resizes the editor's height. Works with the mouse,
 * touch (pointer events) and the keyboard (arrow keys on the focused handle).
 */
export function useSplitter({ initial = 360, min = 160, max = 720, step = 32 } = {}) {
  const [height, setHeight] = useState(() => Math.min(max, Math.max(min, readStored(initial))));
  const drag = useRef<{ startY: number; startHeight: number } | null>(null);
  const clamp = useCallback((value: number) => Math.min(max, Math.max(min, value)), [max, min]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(height));
    } catch {
      // not persisted; the layout still works
    }
  }, [height]);

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    drag.current = { startY: e.clientY, startHeight: height };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!drag.current) return;
    setHeight(clamp(drag.current.startHeight + (e.clientY - drag.current.startY)));
  };
  const onPointerUp = () => {
    drag.current = null;
  };
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowUp") setHeight((h) => clamp(h - step));
    else if (e.key === "ArrowDown") setHeight((h) => clamp(h + step));
    else return;
    e.preventDefault();
  };

  return {
    height,
    handleProps: {
      role: "separator" as const,
      "aria-orientation": "horizontal" as const,
      "aria-label": "Resize editor",
      "aria-valuenow": height,
      "aria-valuemin": min,
      "aria-valuemax": max,
      tabIndex: 0,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onKeyDown,
    },
  };
}

import "@testing-library/jest-dom/vitest";

// CodeMirror measures text through Range geometry APIs that jsdom does not implement.
if (typeof Range !== "undefined") {
  const rect = { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0, toJSON: () => ({}) };
  const rects = { length: 0, item: () => null, [Symbol.iterator]: function* () {} };
  Range.prototype.getBoundingClientRect ??= () => rect as DOMRect;
  Range.prototype.getClientRects ??= () => rects as unknown as DOMRectList;
}

// src/hooks/usePagination.js — generic pagination state for any list.
//
//   const { page, totalPages, pageItems, next, prev, canNext, canPrev, setPageSize } =
//     usePagination(items, { initialPageSize: 6, resetKey: searchText });
//
// `resetKey` is anything that, when it changes, should send the shopper back to page 1
// (a search text, a category…). Pages are 1-based.
//
// Reported: last page unreachable, empty screens after searching, jumping content on
// "per page" changes, "Page 1 of 0" for empty lists.
import { useState } from "react";

const usePagination = (items, { initialPageSize = 6, resetKey } = {}) => {
  const [storedPage, setStoredPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [seenResetKey, setSeenResetKey] = useState(resetKey);

  // FIX (reset): when resetKey changes, go back to page 1. Adjusting state while rendering (comparing
  // with the previously seen value) avoids an extra render with a stale page, unlike an effect.
  let rawPage = storedPage;
  if (seenResetKey !== resetKey) {
    setSeenResetKey(resetKey);
    setStoredPage(1);
    rawPage = 1;
  }

  // ROOT CAUSE (last page / empty list): Math.floor drops the partial last page, and 0 items gave 0 pages.
  // FIX: round up, and there is always at least one (empty) page.
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // ROOT CAUSE (empty screen after the list shrinks): the stored page was never validated.
  // FIX: derive a valid page from the stored one instead of patching every handler.
  const page = Math.min(Math.max(rawPage, 1), totalPages);

  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  const setPage = (value) => setStoredPage(Math.min(Math.max(value, 1), totalPages));

  // FIX (jumping content): page and item index are two views of the same position. Remember the
  // first item that is on screen and compute the page that contains it with the new size.
  const setPageSize = (size) => {
    setPageSizeState(size);
    setStoredPage(Math.floor(start / size) + 1);
  };

  return {
    page,
    pageSize,
    totalPages,
    pageItems,
    start,
    setPage,
    setPageSize,
    next: () => setPage(page + 1),
    prev: () => setPage(page - 1),
    canPrev: page > 1,
    canNext: page < totalPages,
  };
};

export default usePagination;

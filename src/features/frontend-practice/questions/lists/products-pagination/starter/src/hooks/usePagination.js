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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = Math.floor(items.length / pageSize);
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  const setPageSize = (size) => {
    setPageSizeState(size);
  };

  return {
    page,
    pageSize,
    totalPages,
    pageItems,
    start,
    setPage,
    setPageSize,
    next: () => setPage((p) => p + 1),
    prev: () => setPage((p) => p - 1),
    canPrev: page > 1,
    canNext: page < totalPages,
  };
};

export default usePagination;

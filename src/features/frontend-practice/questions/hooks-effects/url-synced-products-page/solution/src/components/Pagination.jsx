// src/components/Pagination.jsx — "Previous · Page 2 of 5 · Next".
//
// Props
//   page          current page (1-based)
//   totalPages    number of pages
//   onPageChange  called with the new page number
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

// APPROACH: a purely presentational control. It owns no state; the page decides what
// "page" means (here: a URL param) and just receives the callback.
const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const button =
    "inline-flex items-center gap-1 rounded-full border border-app-border bg-white px-4 py-2 text-sm font-medium text-app-green hover:bg-app-cream disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-4">
      <button type="button" className={button} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeftIcon className="size-4" aria-hidden="true" />
        <span>Previous page</span>
      </button>
      <span className="text-sm font-semibold text-app-text">
        Page {page} of {totalPages}
      </span>
      <button type="button" className={button} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        <span>Next page</span>
        <ChevronRightIcon className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
};

export default Pagination;

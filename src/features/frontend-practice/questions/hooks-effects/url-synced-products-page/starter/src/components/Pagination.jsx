// src/components/Pagination.jsx — "Previous · Page 2 of 5 · Next".
//
// Props
//   page          current page (1-based)
//   totalPages    number of pages
//   onPageChange  called with the new page number
//
// Requirements are in the Problem tab (UI requirements). Remember the accessibility contract:
// a <nav aria-label="Pagination">, buttons named "Previous page" / "Next page", and nothing at all
// when there is only one page.

const Pagination = ({ page, totalPages, onPageChange }) => {
  // TODO: render the control (and nothing when totalPages <= 1).
  void page;
  void totalPages;
  void onPageChange;
  return null;
};

export default Pagination;

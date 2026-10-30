// src/components/EmptyState.jsx — the reusable "nothing here" card.
// Modelled on the "No Products Found" block in client/src/components/ProductGrid.tsx.
//
// Props
//   icon              a React node (e.g. <SearchIcon className="size-12" />)
//   title             string
//   description       string
//   actionLabel       string  — primary button, optional
//   onAction          () => void
//   secondaryLabel    string  — link-style button, optional
//   onSecondary       () => void

// APPROACH: a purely presentational component. It lays out whatever it is given and renders
// each optional piece only when its label is provided, so absent actions leave no empty element.
const EmptyState = ({ icon, title, description, actionLabel, onAction, secondaryLabel, onSecondary }) => (
  <div
    role="status"
    className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-4 py-12 text-center"
  >
    {icon && (
      <div aria-hidden="true" className="mb-4 text-gray-400">
        {icon}
      </div>
    )}
    <h3 className="mb-2 font-serif text-xl font-bold text-app-green">{title}</h3>
    {description && <p className="mb-6 max-w-md text-sm text-app-text-light">{description}</p>}

    {actionLabel && (
      <button
        type="button"
        onClick={onAction}
        className="rounded-full bg-app-green px-6 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-app-green-light active:scale-95"
      >
        {actionLabel}
      </button>
    )}
    {secondaryLabel && (
      <button
        type="button"
        onClick={onSecondary}
        className="mt-3 text-sm font-medium text-app-text-light underline hover:text-app-green"
      >
        {secondaryLabel}
      </button>
    )}
  </div>
);

export default EmptyState;

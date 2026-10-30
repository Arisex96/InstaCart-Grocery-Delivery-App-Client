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
//
// Build it from the UI requirements in the Problem tab.

const EmptyState = ({ icon, title, description, actionLabel, onAction, secondaryLabel, onSecondary }) => {
  // TODO: role="status" container with the dashed card styling.
  // TODO: icon slot (aria-hidden), <h3> title, <p> description.
  // TODO: primary + secondary buttons, rendered only when their labels are provided.
  return (
    <div className="rounded-3xl border border-dashed border-gray-300 p-6 text-center text-sm text-app-text-light">
      EmptyState is not built yet ({String(Boolean(icon))} {title} {description} {actionLabel} {secondaryLabel}{" "}
      {typeof onAction} {typeof onSecondary})
    </div>
  );
};

export default EmptyState;

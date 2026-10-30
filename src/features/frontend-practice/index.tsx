import { lazy, Suspense } from "react";

const PracticeLab = lazy(() => import("./PracticeLab"));

/**
 * Route element for `/practice` and `/practice/:id`. The lab (editor, sandbox
 * runtime bundle, question bank) is code-split so it adds nothing to the
 * storefront's initial bundle.
 */
export default function FrontendPracticeLab() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-app-text-light">Loading practice lab…</p>}>
      <PracticeLab />
    </Suspense>
  );
}

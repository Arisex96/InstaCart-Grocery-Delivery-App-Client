// src/components/ui/Accordion.jsx — compound component used by FilterSidebar (Products page filters)
// and the mobile filter drawer.
//
//   <Accordion defaultValue="categories">                    // uncontrolled
//   <Accordion value={open} onValueChange={setOpen}>         // controlled (the drawer does this)
//     <AccordionItem value="categories">
//       <AccordionTrigger>Categories</AccordionTrigger>
//       <AccordionPanel>…</AccordionPanel>
//     </AccordionItem>
//   </Accordion>
//
// Only one section is open at a time. `null` means "everything collapsed".
import { createContext, useContext, useId, useState } from "react";
import { ChevronRight } from "lucide-react";

const AccordionContext = createContext(null);
const ItemContext = createContext(null);

export function Accordion({ value, defaultValue = null, onValueChange, className = "", children }) {
  // ROOT CAUSE: `useState(value ?? defaultValue)` read the `value` prop once, so a controlled
  // parent could never change the open section afterwards.
  // FIX: `value !== undefined` means controlled. Derive the current value from the prop in
  // that case, and only keep internal state for the uncontrolled case.
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const current = isControlled ? value : internal;

  // ROOT CAUSE: the old select() always stored the clicked value, so an open section could
  // never collapse, and onValueChange was only called in the mode where nobody needed it.
  // FIX: one toggle computes the NEXT value (null = collapse), updates internal state only
  // when uncontrolled, and always reports the change to the parent.
  const toggle = (itemValue) => {
    const next = current === itemValue ? null : itemValue;
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  return (
    <AccordionContext.Provider value={{ current, toggle }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, children }) {
  // Per-item ids so aria-controls / aria-labelledby never collide between accordions.
  const id = useId();
  return (
    <ItemContext.Provider value={{ value, triggerId: id + "-trigger", panelId: id + "-panel" }}>
      <div className="border-b border-app-border last:border-0">{children}</div>
    </ItemContext.Provider>
  );
}

export function AccordionTrigger({ children }) {
  const { current, toggle } = useContext(AccordionContext);
  const { value, triggerId, panelId } = useContext(ItemContext);
  const open = current === value;

  return (
    <button
      type="button"
      id={triggerId}
      aria-expanded={open}
      aria-controls={panelId}
      onClick={() => toggle(value)}
      className="flex w-full items-center justify-between py-3 text-left text-sm font-bold uppercase tracking-wide text-app-green"
    >
      {children}
      <ChevronRight className={`size-4 transition-transform ${open ? "rotate-90" : ""}`} />
    </button>
  );
}

export function AccordionPanel({ children }) {
  const { current } = useContext(AccordionContext);
  const { value, triggerId, panelId } = useContext(ItemContext);

  // FIX: closed panels are not rendered at all (no hidden DOM, nothing for assistive tech to read).
  if (current !== value) return null;
  return (
    <div id={panelId} role="region" aria-labelledby={triggerId} className="pb-4">
      {children}
    </div>
  );
}

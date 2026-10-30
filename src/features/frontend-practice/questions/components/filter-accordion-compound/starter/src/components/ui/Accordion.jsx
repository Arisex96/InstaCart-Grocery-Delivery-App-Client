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
import { createContext, useContext, useState } from "react";
import { ChevronRight } from "lucide-react";

const AccordionContext = createContext(null);
const ItemContext = createContext(null);

export function Accordion({ value, defaultValue = null, onValueChange, className = "", children }) {
  const [openValue, setOpenValue] = useState(value ?? defaultValue);

  const select = (itemValue) => {
    setOpenValue(itemValue);
    if (value === undefined) onValueChange?.(itemValue);
  };

  return (
    <AccordionContext.Provider value={{ openValue, select }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, children }) {
  return (
    <ItemContext.Provider value={{ value }}>
      <div className="border-b border-app-border last:border-0">{children}</div>
    </ItemContext.Provider>
  );
}

export function AccordionTrigger({ children }) {
  const { openValue, select } = useContext(AccordionContext);
  const { value } = useContext(ItemContext);
  const open = openValue === value;

  return (
    <button
      type="button"
      onClick={() => select(value)}
      className="flex w-full items-center justify-between py-3 text-left text-sm font-bold uppercase tracking-wide text-app-green"
    >
      {children}
      <ChevronRight className={`size-4 transition-transform ${open ? "rotate-90" : ""}`} />
    </button>
  );
}

export function AccordionPanel({ children }) {
  const { openValue } = useContext(AccordionContext);
  const { value } = useContext(ItemContext);

  return <div className={openValue === value ? "pb-4" : "hidden"}>{children}</div>;
}

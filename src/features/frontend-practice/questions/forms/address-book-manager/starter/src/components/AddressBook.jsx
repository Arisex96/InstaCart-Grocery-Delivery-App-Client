// src/components/AddressBook.jsx — the "Saved addresses" screen of the account area
// (client/src/pages/Addresses.tsx is the real, map-based page; this version is list + form only).
//
// Props
//   initialAddresses  [{ _id, label, address, city, state, zip, isDefault }]  (the starting list)
//   onChange(addresses)  called with the whole updated array after every change
//
// Build it from the UI requirements in the Problem tab. The Demo (src/Demo.jsx) renders it with a
// couple of sample books and the "Target UI" output tab shows the finished design.

const AddressBook = ({ initialAddresses = [], onChange }) => {
  // TODO: keep the addresses in state (start from `initialAddresses`).
  // TODO: which address is being edited / is a new one being added? which one awaits delete confirmation?
  // TODO: one helper that sets the state AND calls onChange(next) after add / edit / delete / set default.

  return (
    <section aria-label="Saved addresses" className="rounded-2xl border border-app-border bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-app-green">Saved addresses</h2>
        <button className="rounded-full bg-app-green px-4 py-2 text-sm font-semibold text-white">Add address</button>
      </div>
      <p className="mt-3 text-sm text-app-text-light">
        Not built yet ({initialAddresses.length} addresses, {String(Boolean(onChange))}).
      </p>
    </section>
  );
};

export default AddressBook;

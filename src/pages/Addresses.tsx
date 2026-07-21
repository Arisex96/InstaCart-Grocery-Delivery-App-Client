import { Check, MapPinIcon, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Address, User } from "../types";
import { useState } from "react";

export const dummyAddress: Address = {
  _id: "addr_001",
  label: "Home",
  address: "123 New Market Road",
  city: "New York",
  state: "NY",
  zip: "10001",
  isDefault: true,
  lat: 40.7128,
  lng: -74.006,
};

export const dummyUser: User = {
  _id: "user_001",
  name: "Admin",
  email: "admin@example.com",
  phone: "+1 9876543210",
  avatar: "https://i.pravatar.cc/150?img=12",
  addresses: [
    dummyAddress,
    {
      _id: "addr_002",
      label: "Office",
      address: "456 Wall Street",
      city: "New York",
      state: "NY",
      zip: "10005",
      isDefault: false,
      lat: 40.706,
      lng: -74.0086,
    },
  ],
  isAdmin: true,
  createdAt: "2026-04-01T09:00:00.000Z",
  updatedAt: "2026-04-06T08:47:28.984Z",
};

const Addresses = () => {
  const [isOverlayOn, setIsOverlayOn] = useState(true);

  const [addresses, setAddresses] = useState<Address[]>(dummyUser.addresses);

  return (
    <main className="max-w-7xl mx-auto p-4 flex flex-col gap-6 mb-10 mt-4 min-h-screen">
      {/** Header */}
      <section className="flex justify-between items-center gap-2">
        <p className="text-3xl font-semibold">My Addresses</p>
        <button
          className="bg-app-green text-white p-2 rounded-lg flex items-center gap-2"
          onClick={() => setIsOverlayOn(true)}
        >
          <Plus />
          <span>Add New Address</span>
        </button>
      </section>

      {/** Addresses List */}
      <section className="flex flex-col gap-4 items-start">
        {addresses.map((address) => (
          <AddressCard key={address._id} address={address} />
        ))}
      </section>

      {/** Overlay */}
      {isOverlayOn && <AddressForm setIsOverlayOn={setIsOverlayOn} />}
    </main>
  );
};



interface AddressFormData {
  label: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

const AddressForm = ({ setIsOverlayOn }: { setIsOverlayOn: (value: boolean) => void }) => {
  const [formData, setFormData] = useState<AddressFormData>({
    label: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    isDefault: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log(formData);

    setIsOverlayOn(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => setIsOverlayOn(false)}
    >
      <div
        className="w-full max-w-xl rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-xl font-semibold">Add New Address</h2>

          <button
            type="button"
            onClick={() => setIsOverlayOn(false)}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-5"
        >
          {/* Label */}
          <div className="flex flex-col gap-1">
            <label htmlFor="label" className="font-medium">
              Label
            </label>

            <input
              id="label"
              name="label"
              type="text"
              required
              placeholder="Home, Office..."
              value={formData.label}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 p-2 outline-none focus:border-app-green"
            />
          </div>

          {/* Street Address */}
          <div className="flex flex-col gap-1">
            <label htmlFor="address" className="font-medium">
              Street Address
            </label>

            <input
              id="address"
              name="address"
              type="text"
              required
              placeholder="123 Main Street"
              value={formData.address}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 p-2 outline-none focus:border-app-green"
            />
          </div>

          {/* City & State */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="city" className="font-medium">
                City
              </label>

              <input
                id="city"
                name="city"
                type="text"
                required
                value={formData.city}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 p-2 outline-none focus:border-app-green"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="state" className="font-medium">
                State
              </label>

              <input
                id="state"
                name="state"
                type="text"
                required
                value={formData.state}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 p-2 outline-none focus:border-app-green"
              />
            </div>
          </div>

          {/* Zip */}
          <div className="flex flex-col gap-1">
            <label htmlFor="zip" className="font-medium">
              ZIP Code
            </label>

            <input
              id="zip"
              name="zip"
              type="text"
              inputMode="numeric"
              required
              value={formData.zip}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 p-2 outline-none focus:border-app-green"
            />
          </div>

          {/* Default */}
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-300 p-3">
            <input
              name="isDefault"
              type="checkbox"
              checked={formData.isDefault}
              onChange={handleChange}
              className="h-4 w-4 accent-app-green"
            />

            <span className="font-medium">
              Set as default address
            </span>
          </label>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOverlayOn(false)}
              className="rounded-lg border border-gray-300 px-5 py-2 transition hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-app-green px-5 py-2 text-white transition hover:opacity-90"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



const AddressCard = ({ address }: { address: Address }) => {


  const handleEdit = (id: string) => {
    
  }
  const handleDelete = (id: string) => {
    
  }
  
  const default_tab = () => {
    return (
      <div className="bg-app-green text-white p-1 rounded-full flex flex-row gap-1 items-center w-fit text-xs px-3">
        <Check size={16} className="text-gray-400" /> Default
      </div>
    );
  };
  return (
    <div className="flex flex-col gap-2 bg-white rounded-lg w-[600px] p-4">
      <div className="flex flex-row gap-2 items-start ">
        <div>
          <MapPinIcon
            className=" text-app-green bg-app-cream p-1 rounded-lg"
            size={30}
          />
        </div>
        <div className="flex flex-col justify-start">
          <p className="text-lg font-semibold flex flex-row gap-2 items-center">
            {address.label} {address.isDefault ? default_tab() : ""}
          </p>
          <p className="text-sm text-gray-600">{address.address}</p>
          <p className="text-sm text-gray-600">
            {address.city}, {address.state}, {address.zip}
          </p>
        </div>
        <div className="flex flex-row gap-2 items-center ml-auto">
          <button onClick={() => handleEdit(address._id)} className="bg-app-cream text-app-green p-1 rounded-lg">
            <Pencil size={20} />
          </button>
          <button onClick={() => handleDelete(address._id)} className="bg-app-cream text-app-green p-1 rounded-lg">
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Addresses;

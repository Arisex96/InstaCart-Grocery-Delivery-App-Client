import { Check, MapPinIcon, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Address } from "../types";
import { useState } from "react";
import useUserStore from "../store/useUserStore";

const Addresses = () => {
  const [isOverlayOn, setIsOverlayOn] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const addresses = useUserStore((state) => state.addresses);
  const remove_address = useUserStore((state) => state.remove_address);
  const set_default_address = useUserStore(
    (state) => state.set_default_address,
  );

  return (
    <main className="max-w-7xl mx-auto p-4 flex flex-col gap-6 mb-10 mt-4 min-h-screen">
      {/** Header */}
      <section className="flex justify-between items-center gap-2">
        <p className="text-3xl font-semibold">My Addresses</p>
        <button
          className="bg-app-green text-white p-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
          onClick={() => setIsOverlayOn(true)}
        >
          <Plus />
          <span>Add New Address</span>
        </button>
      </section>

      {/** Addresses List */}
      <section className="flex flex-col gap-4 items-start">
        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg w-[600px] border border-dashed border-gray-300 text-gray-500">
            <MapPinIcon size={40} className="mb-2 text-gray-400" />
            <p className="text-sm">
              No addresses saved. Add one to get started!
            </p>
          </div>
        ) : (
          addresses.map((address) => (
            <AddressCard
              key={address._id}
              address={address}
              onEdit={() => setEditingAddress(address)}
              onDelete={() => remove_address(address._id)}
              onSetDefault={() => set_default_address(address._id)}
            />
          ))
        )}
      </section>

      {/** Overlay */}
      {(isOverlayOn || editingAddress) && (
        <AddressForm
          addressToEdit={editingAddress}
          onClose={() => {
            setIsOverlayOn(false);
            setEditingAddress(null);
          }}
        />
      )}
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

interface AddressFormProps {
  addressToEdit: Address | null;
  onClose: () => void;
}

const AddressForm = ({ addressToEdit, onClose }: AddressFormProps) => {
  const [formData, setFormData] = useState<AddressFormData>({
    label: addressToEdit?.label || "",
    address: addressToEdit?.address || "",
    city: addressToEdit?.city || "",
    state: addressToEdit?.state || "",
    zip: addressToEdit?.zip || "",
    isDefault: addressToEdit?.isDefault || false,
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

    if (addressToEdit) {
      const updatedAddress: Address = {
        ...addressToEdit,
        ...formData,
      };

      useUserStore.getState().update_address(updatedAddress);
      if (updatedAddress.isDefault) {
        useUserStore.getState().set_default_address(updatedAddress._id);
      }
    } else {
      const newAddress: Address = {
        _id: Date.now().toString(),
        lat: 0,
        lng: 0,
        ...formData,
      };

      useUserStore.getState().add_address(newAddress);
      if (newAddress.isDefault) {
        useUserStore.getState().set_default_address(newAddress._id);
      }
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-xl font-semibold">
            {addressToEdit ? "Edit Address" : "Add New Address"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5">
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

            <span className="font-medium">Set as default address</span>
          </label>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
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

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) => {
  const default_tab = () => {
    return (
      <span className="bg-app-green/10 text-app-green border border-app-green/20 p-1 rounded-full flex flex-row gap-1 items-center w-fit text-xs px-3 font-medium">
        <Check size={14} className="text-app-green" /> Default
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-2 bg-white rounded-lg w-[600px] p-4 border border-gray-100 shadow-sm hover:shadow transition-shadow">
      <div className="flex flex-row gap-3 items-start ">
        <div>
          <MapPinIcon
            className="text-app-green bg-app-cream p-1.5 rounded-lg"
            size={36}
          />
        </div>
        <div className="flex flex-col justify-start">
          <div className="text-lg font-semibold flex flex-row gap-2 items-center">
            <span>{address.label}</span>
            {address.isDefault ? (
              default_tab()
            ) : (
              <button
                onClick={onSetDefault}
                className="text-[10px] text-gray-500 hover:text-app-green transition-colors border border-gray-200 hover:border-app-green/30 px-2 py-0.5 rounded-full"
              >
                Set as Default
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{address.address}</p>
          <p className="text-sm text-gray-600">
            {address.city}, {address.state}, {address.zip}
          </p>
        </div>
        <div className="flex flex-row gap-2 items-center ml-auto">
          <button
            onClick={onEdit}
            className="bg-app-cream hover:bg-app-green hover:text-white text-app-green p-2 rounded-lg transition-colors cursor-pointer"
            title="Edit Address"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={onDelete}
            className="bg-red-50 hover:bg-red-500 hover:text-white text-red-500 p-2 rounded-lg transition-colors cursor-pointer"
            title="Delete Address"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Addresses;

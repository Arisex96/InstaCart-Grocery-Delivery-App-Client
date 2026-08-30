import { Check, MapPinIcon, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Address } from "../types";
import { useState, useEffect } from "react";
import useUserStore from "../store/useUserStore";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import toast from "react-hot-toast";

// Pure CSS Leaflet custom icon
const addressIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: #16a34a;
      border: 2px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.15);
    ">
      <div style="
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Map helper components
interface MapEventsHandlerProps {
  onChange: (lat: number, lng: number) => void;
}

function MapEventsHandler({ onChange }: MapEventsHandlerProps) {
  useMapEvents({
    click(e) {
      onChange(
        parseFloat(e.latlng.lat.toFixed(6)),
        parseFloat(e.latlng.lng.toFixed(6)),
      );
    },
  });
  return null;
}

interface MapViewUpdaterProps {
  center: [number, number];
}

function MapViewUpdater({ center }: MapViewUpdaterProps) {
  const map = useMap();
  useEffect(() => {
    if (
      typeof center[0] === "number" &&
      !isNaN(center[0]) &&
      typeof center[1] === "number" &&
      !isNaN(center[1]) &&
      center[0] !== 0 &&
      center[1] !== 0
    ) {
      map.setView(center, map.getZoom());
    }
  }, [center[0], center[1], map]);
  return null;
}

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
          className="bg-app-green text-white p-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
          onClick={() => setIsOverlayOn(true)}
        >
          <Plus />
          <span>Add New Address</span>
        </button>
      </section>

      {/** Addresses List */}
      <section className="flex flex-col gap-4 items-start">
        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg w-full max-w-150 border border-dashed border-gray-300 text-gray-500">
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

      {/** Overlay / Modal */}
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
  lat: number;
  lng: number;
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
    lat: addressToEdit?.lat || 0,
    lng: addressToEdit?.lng || 0,
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCoordinatesChange = (field: "lat" | "lng", val: string) => {
    const parsed = parseFloat(val);
    setFormData((prev) => ({
      ...prev,
      [field]: isNaN(parsed) ? 0 : parsed,
    }));
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            lat: parseFloat(position.coords.latitude.toFixed(6)),
            lng: parseFloat(position.coords.longitude.toFixed(6)),
          }));
          toast.success("GPS Location detected!");
        },
        (error) => {
          console.error(error);
          toast.error("Could not retrieve GPS coordinates");
        },
      );
    } else {
      toast.error("Geolocation not supported by this browser");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (
      formData.lat < -90 ||
      formData.lat > 90 ||
      formData.lng < -180 ||
      formData.lng > 180
    ) {
      toast.error("Latitude must be -90 to 90. Longitude must be -180 to 180.");
      return;
    }

    setSubmitting(true);
    try {
      if (addressToEdit) {
        const updatedAddress: Address = {
          ...addressToEdit,
          ...formData,
        };

        await useUserStore.getState().update_address(updatedAddress);
        if (updatedAddress.isDefault) {
          await useUserStore.getState().set_default_address(updatedAddress._id);
        }
      } else {
        const newAddress: Address = {
          _id: Date.now().toString(),
          ...formData,
        };

        await useUserStore.getState().add_address(newAddress);
        if (newAddress.isDefault) {
          await useUserStore.getState().set_default_address(newAddress._id);
        }
      }
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Determine starting point map center
  const mapCenter: [number, number] =
    formData.lat !== 0 && formData.lng !== 0
      ? [formData.lat, formData.lng]
      : [37.422, -122.0841]; // Fallback to Mountain View

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-5 shrink-0">
          <h2 className="text-xl font-semibold">
            {addressToEdit ? "Edit Address" : "Add New Address"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto flex flex-col gap-5 p-5"
        >
          {/* Label */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="label"
              className="font-medium text-sm text-zinc-700"
            >
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
              className="rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-app-green"
            />
          </div>

          {/* Street Address */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="address"
              className="font-medium text-sm text-zinc-700"
            >
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
              className="rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-app-green"
            />
          </div>

          {/* City & State */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="city"
                className="font-medium text-sm text-zinc-700"
              >
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                required
                value={formData.city}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-app-green"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="state"
                className="font-medium text-sm text-zinc-700"
              >
                State
              </label>
              <input
                id="state"
                name="state"
                type="text"
                required
                value={formData.state}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-app-green"
              />
            </div>
          </div>

          {/* Zip */}
          <div className="flex flex-col gap-1">
            <label htmlFor="zip" className="font-medium text-sm text-zinc-700">
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
              className="rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-app-green"
            />
          </div>

          {/* Coordinates Header & Inputs */}
          <div className="border-t pt-4 mt-2">
            <h3 className="font-semibold text-zinc-900 text-sm mb-0.5">
              Geographic Location (Map Coordinates)
            </h3>
            <p className="text-xs text-zinc-500 mb-3">
              Provide coordinate values for delivery mapping, or click/tap the
              map below to position a pin.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="lat"
                  className="font-medium text-xs text-zinc-600"
                >
                  Latitude
                </label>
                <input
                  id="lat"
                  name="lat"
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 37.4220"
                  value={formData.lat || ""}
                  onChange={(e) =>
                    handleCoordinatesChange("lat", e.target.value)
                  }
                  className="rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-app-green"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="lng"
                  className="font-medium text-xs text-zinc-600"
                >
                  Longitude
                </label>
                <input
                  id="lng"
                  name="lng"
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. -122.0841"
                  value={formData.lng || ""}
                  onChange={(e) =>
                    handleCoordinatesChange("lng", e.target.value)
                  }
                  className="rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-app-green"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="mt-3 text-xs font-semibold text-app-green hover:opacity-80 flex items-center gap-1.5 cursor-pointer"
            >
              <MapPinIcon size={14} /> Detect Current GPS Coordinates
            </button>
          </div>

          {/* Leaflet Picker Map */}
          <div className="h-48 w-full rounded-lg overflow-hidden border border-gray-200 z-0 select-none">
            <MapContainer
              center={mapCenter}
              zoom={13}
              scrollWheelZoom={true}
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapEventsHandler
                onChange={(lat, lng) => {
                  setFormData((prev) => ({ ...prev, lat, lng }));
                }}
              />
              {formData.lat !== 0 && formData.lng !== 0 && (
                <Marker
                  position={[formData.lat, formData.lng]}
                  icon={addressIcon}
                />
              )}
              <MapViewUpdater center={mapCenter} />
            </MapContainer>
          </div>

          {/* Default address checkbox */}
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-300 p-3 mt-2 hover:bg-zinc-50 transition-colors">
            <input
              name="isDefault"
              type="checkbox"
              checked={formData.isDefault}
              onChange={handleChange}
              className="h-4 w-4 accent-app-green cursor-pointer"
            />
            <span className="font-medium text-sm text-zinc-800">
              Set as default address
            </span>
          </label>

          {/* Form Actions Footer */}
          <div className="flex justify-end gap-3 pt-3 border-t shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium transition hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-app-green px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? "Saving..." : "Save Address"}
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
    <div className="flex flex-col gap-2 bg-white rounded-lg w-full max-w-150 p-4 border border-gray-100 shadow-sm hover:shadow transition-shadow">
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
                className="text-[10px] text-gray-500 hover:text-app-green transition-colors border border-gray-200 hover:border-app-green/30 px-2 py-0.5 rounded-full cursor-pointer"
              >
                Set as Default
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{address.address}</p>
          <p className="text-sm text-gray-600">
            {address.city}, {address.state}, {address.zip}
          </p>
          {address.lat !== 0 && address.lng !== 0 && (
            <p className="text-[11px] text-zinc-500 font-mono mt-1">
              Coordinates: {address.lat.toFixed(4)}, {address.lng.toFixed(4)}
            </p>
          )}
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

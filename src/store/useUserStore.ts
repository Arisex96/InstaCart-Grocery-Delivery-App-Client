import { create } from "zustand";
import type { Address, User, UserState } from "../types";

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

const useUserStore = create<UserState>((set) => ({
  ...dummyUser,
  add_address: (address: Address) =>
    set((state) => ({
      addresses: [...state.addresses, address],
    })),
  remove_address: (address_id: string) =>
    set((state) => ({
      addresses: state.addresses.filter(
        (address) => address._id !== address_id,
      ),
    })),
  update_address: (address: Address) =>
    set((state) => ({
      addresses: state.addresses.map((addr) =>
        addr._id === address._id ? address : addr,
      ),
    })),
  set_default_address: (address_id: string) =>
    set((state) => ({
      addresses: state.addresses.map((addr) =>
        addr._id === address_id
          ? { ...addr, isDefault: true }
          : { ...addr, isDefault: false },
      ),
    })),
}));

export default useUserStore;

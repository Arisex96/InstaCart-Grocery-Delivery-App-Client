import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Address, User, UserState } from "../types";
import api from "../api/axios";
import toast from "react-hot-toast";

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      _id: "",
      name: "",
      email: "",
      phone: "",
      avatar: "",
      addresses: [],
      isAdmin: false,
      createdAt: "",
      updatedAt: "",

      setUser: (user: User) =>
        set({
          ...user,
        }),

      clearUser: () =>
        set({
          _id: "",
          name: "",
          email: "",
          phone: "",
          avatar: "",
          addresses: [],
          isAdmin: false,
          createdAt: "",
          updatedAt: "",
        }),

      add_address: async (address: Address) => {
        try {
          const res = await api.post("/addresses", {
            label: address.label,
            address: address.address,
            city: address.city,
            state: address.state,
            zip: address.zip,
            isDefault: address.isDefault,
            lat: address.lat || 0,
            lng: address.lng || 0,
          });
          const mapped = res.data.addresses.map((addr: any) => ({
            _id: addr.id,
            label: addr.label,
            address: addr.address,
            city: addr.city,
            state: addr.state,
            zip: addr.zip,
            isDefault: addr.isDefault,
            lat: addr.lat,
            lng: addr.lng,
          }));
          set({ addresses: mapped });
          toast.success("Address added successfully!");
        } catch (error) {
          console.error("Failed to add address", error);
          toast.error("Failed to add address.");
          throw error;
        }
      },

      remove_address: async (address_id: string) => {
        try {
          const res = await api.delete(`/addresses/${address_id}`);
          const mapped = res.data.addresses.map((addr: any) => ({
            _id: addr.id,
            label: addr.label,
            address: addr.address,
            city: addr.city,
            state: addr.state,
            zip: addr.zip,
            isDefault: addr.isDefault,
            lat: addr.lat,
            lng: addr.lng,
          }));
          set({ addresses: mapped });
          toast.success("Address removed successfully!");
        } catch (error) {
          console.error("Failed to remove address", error);
          toast.error("Failed to remove address.");
          throw error;
        }
      },

      update_address: async (address: Address) => {
        try {
          const res = await api.put(`/addresses/${address._id}`, {
            label: address.label,
            address: address.address,
            city: address.city,
            state: address.state,
            zip: address.zip,
            isDefault: address.isDefault,
            lat: address.lat || 0,
            lng: address.lng || 0,
          });
          const mapped = res.data.addresses.map((addr: any) => ({
            _id: addr.id,
            label: addr.label,
            address: addr.address,
            city: addr.city,
            state: addr.state,
            zip: addr.zip,
            isDefault: addr.isDefault,
            lat: addr.lat,
            lng: addr.lng,
          }));
          set({ addresses: mapped });
          toast.success("Address updated successfully!");
        } catch (error) {
          console.error("Failed to update address", error);
          toast.error("Failed to update address.");
          throw error;
        }
      },

      set_default_address: async (address_id: string) => {
        try {
          const addresses = useUserStore.getState().addresses;
          const address = addresses.find((a) => a._id === address_id);
          if (!address) return;

          const res = await api.put(`/addresses/${address_id}`, {
            label: address.label,
            address: address.address,
            city: address.city,
            state: address.state,
            zip: address.zip,
            isDefault: true,
            lat: address.lat || 0,
            lng: address.lng || 0,
          });

          const mapped = res.data.addresses.map((addr: any) => ({
            _id: addr.id,
            label: addr.label,
            address: addr.address,
            city: addr.city,
            state: addr.state,
            zip: addr.zip,
            isDefault: addr.isDefault,
            lat: addr.lat,
            lng: addr.lng,
          }));
          set({ addresses: mapped });
          toast.success("Default address updated!");
        } catch (error) {
          console.error("Failed to set default address", error);
          toast.error("Failed to set default address.");
          throw error;
        }
      },

      loadAddresses: async () => {
        try {
          const res = await api.get("/addresses");
          const mapped = res.data.map((addr: any) => ({
            _id: addr.id,
            label: addr.label,
            address: addr.address,
            city: addr.city,
            state: addr.state,
            zip: addr.zip,
            isDefault: addr.isDefault,
            lat: addr.lat,
            lng: addr.lng,
          }));
          set({ addresses: mapped });
        } catch (error) {
          console.error("Failed to load addresses", error);
        }
      },
    }),
    {
      name: "user-storage",
    },
  ),
);

export default useUserStore;

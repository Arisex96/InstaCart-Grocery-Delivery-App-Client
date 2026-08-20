export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  addresses: Address[];
  isAdmin?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserState extends User {
  setUser: (user: User) => void;

  clearUser: () => void;

  add_address: (address: Address) => void;

  remove_address: (address_id: string) => void;

  update_address: (address: Address) => void;

  set_default_address: (address_id: string) => void;

  loadAddresses: () => Promise<void>;
}

export interface Address {
  _id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
  lat: number;
  lng: number;
}

export interface Category {
  slug: string;
  name: string;
  image: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  unit: string;
  stock: number;
  isOrganic: boolean;
  rating: number;
  reviewCount: number;
  discount: number;
  createdAt?: string;
}

export interface Review {
  _id: string;
  productId: string;
  userImage: string;
  name: string;
  date: string;
  rating: number;
  comment: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface DeliveryPartner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  vehicleType?: "bike" | "scooter" | "car";
  // Non-optional: the server column is now NOT NULL with a default, so a
  // partner always has an explicit active state.
  isActive: boolean;
  createdAt?: string;
}

/**
 * A shipping address is a *snapshot* taken at order time — it deliberately has
 * no `_id` and no `isDefault`, because it is not a row in the address book and
 * editing the saved address must not rewrite past orders.
 */
export type ShippingAddress = Omit<Address, "_id" | "isDefault">;

/**
 * The partner as embedded in an order. This is a *projection*, not a full
 * `DeliveryPartner`: the server selects only the contact fields it needs
 * (id/name/phone, plus email or avatar/vehicleType depending on the endpoint),
 * so an order never carries credentials or an active flag.
 */
export interface OrderDeliveryPartner {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  vehicleType?: "bike" | "scooter" | "car";
}

export interface Order {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  liveLocation?: {
    lat: number;
    lng: number;
    updatedAt: string;
  };
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: string;
  statusHistory: { status: string; timestamp: string; note: string }[];
  deliveryPartner: OrderDeliveryPartner | null;
  deliveryOtp: string;
  isPaid: boolean;
  createdAt: string;
}
export interface CartState {
  items: CartItem[];
  total_items: number;
  total_price: number;
  isCartOpen: boolean;
  toggle_cart_view: () => void;
  add_item: (product: Product, quantity: number) => void;
  remove_item: (product_id: string) => void;
  update_quantity: (product_id: string, quantity: number) => void;

  clear_cart: () => void;
}

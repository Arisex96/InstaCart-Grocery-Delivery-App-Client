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
  createdAt: string;
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
  isActive?: boolean;
  createdAt?: string;
}

export interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  liveLocation: {
    lat: number;
    lng: number;
    updatedAt:string;
  };
  shippingAddress: Address;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: string;
  statusHistory: { status: string; timestamp: string; note: string }[];
  deliveryPartner: DeliveryPartner | null;
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

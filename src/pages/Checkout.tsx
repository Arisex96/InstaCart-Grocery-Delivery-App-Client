import {
  ArrowLeft,
  Check,
  MapPin,
  MapPinIcon,
  Plus,
  Wallet2Icon,
  ShoppingBag,
  CreditCard,
  ChevronRight,
  Wallet,
  Banknote,
  Landmark,
} from "lucide-react";
import { useEffect, useState } from "react";
import useCartStore from "../store/useCartStore";
import type { Address, CartState } from "../types";
import useUserStore from "../store/useUserStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const userStore = useUserStore();
  const navigate = useNavigate();
  const { clear_cart } = useCartStore();

  const [currentAddress, setCurrentAddress] = useState<Address | null>(
    userStore.addresses.find((address) => address.isDefault) || null,
  );

  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  // Sync currentAddress if the default address changes or addresses are loaded
  useEffect(() => {
    if (!currentAddress && userStore.addresses.length > 0) {
      setCurrentAddress(
        userStore.addresses.find((address) => address.isDefault) ||
          userStore.addresses[0],
      );
    }
  }, [userStore.addresses, currentAddress]);

  const steps = [
    {
      id: 1,
      name: "Address",
      icon: <MapPin size={18} />,
    },
    {
      id: 2,
      name: "Payment",
      icon: <Wallet2Icon size={18} />,
    },
    {
      id: 3,
      name: "Review",
      icon: <Check size={18} />,
    },
  ];

  const handlePlaceOrder = () => {
    toast.success("Order placed successfully! Thank you.");
    clear_cart();
    navigate("/my-orders");
  };

  return (
    <div className="max-w-7xl mx-auto mt-7 p-6 flex flex-col gap-8">
      <div
        onClick={() => navigate(-1)}
        className="flex flex-row items-center gap-2 text-gray-600 hover:text-app-green transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft size={20} />
        <p className="text-sm font-medium">Back</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>

        {/* Steps indicator */}
        <div className="flex flex-row items-center gap-2 flex-wrap">
          {steps.map((it) => {
            const isActive = currentStep === it.id;
            const isCompleted = currentStep > it.id;
            return (
              <div
                key={it.id}
                onClick={() => {
                  // Only allow navigation to steps that are filled/accessible
                  if (
                    it.id === 1 ||
                    (it.id === 2 && currentAddress) ||
                    (it.id === 3 && currentAddress && selectedPayment)
                  ) {
                    setCurrentStep(it.id);
                  }
                }}
                className={`flex flex-row items-center gap-2 rounded-2xl px-4 py-2 hover:cursor-pointer transition-all border ${
                  isActive
                    ? "bg-app-green text-white border-app-green shadow-md"
                    : isCompleted
                      ? "bg-app-green/10 text-app-green border-app-green/20"
                      : "bg-white text-gray-500 border-gray-200"
                }`}
              >
                {isCompleted ? <Check size={16} /> : it.icon}
                <p className="text-xs md:text-sm font-semibold">{it.name}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        {/* Left Side Content */}
        <div className="flex-1 w-full">
          {currentStep === 1 && (
            <DeliveryAdress
              currentAddress={currentAddress}
              setCurrentAddress={setCurrentAddress}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <PaymentMethodSelection
              selectedPayment={selectedPayment}
              setSelectedPayment={setSelectedPayment}
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && (
            <ReviewOrder
              currentAddress={currentAddress}
              selectedPayment={selectedPayment}
              onBack={() => setCurrentStep(2)}
              onPlaceOrder={handlePlaceOrder}
            />
          )}
        </div>

        {/* Right Side Sidebar */}
        <div className="w-full lg:w-95 shrink-0 flex flex-col gap-6">
          <SelectedAddressCard address={currentAddress} />
          <OrderSummary />
        </div>
      </div>
    </div>
  );
};

const AddressCard = ({
  address,
  isSelected,
  onSelect,
  onSetDefault,
}: {
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
  onSetDefault: () => void;
}) => {
  const default_tab = () => {
    return (
      <span className="bg-app-green/10 text-app-green border border-app-green/20 p-1 rounded-full flex flex-row gap-1 items-center w-fit text-xs px-2.5 font-medium shrink-0">
        <Check size={12} className="text-app-green" /> Default
      </span>
    );
  };

  return (
    <div
      onClick={onSelect}
      className={`flex flex-col sm:flex-row justify-between items-start gap-4 bg-white rounded-xl p-4 border transition-all cursor-pointer ${
        isSelected
          ? "border-app-green ring-1 ring-app-green/30 bg-app-green/5 shadow-md"
          : "border-gray-200 hover:border-gray-300 shadow-sm hover:shadow"
      }`}
    >
      <div className="flex flex-row gap-3 items-start w-full sm:w-auto">
        <MapPinIcon
          className={`p-2 rounded-xl shrink-0 transition-colors ${
            isSelected
              ? "text-white bg-app-green"
              : "text-app-green bg-app-cream"
          }`}
          size={40}
        />
        <div className="flex flex-col justify-start min-w-0">
          <div className="text-base font-semibold flex flex-wrap gap-2 items-center">
            <span className="truncate">{address.label}</span>
            {address.isDefault ? (
              default_tab()
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSetDefault();
                }}
                className="text-[10px] text-gray-500 hover:text-app-green transition-colors border border-gray-200 hover:border-app-green/30 px-2 py-0.5 rounded-full bg-white shrink-0"
              >
                Set as Default
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1.5 wrap-break-word">
            {address.address}
          </p>
          <p className="text-sm text-gray-500">
            {address.city}, {address.state}, {address.zip}
          </p>
        </div>
      </div>
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:ml-auto shrink-0">
        <div className="flex items-center gap-2 sm:ml-auto">
          {isSelected ? (
            <span className="bg-app-green text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1 shadow-sm">
              <Check size={14} /> Selected
            </span>
          ) : (
            <button
              type="button"
              className="text-xs text-gray-600 hover:text-white hover:bg-app-green bg-white transition-all border border-gray-200 hover:border-app-green px-3 py-1.5 rounded-full font-medium shadow-sm hover:shadow"
            >
              Select
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SelectedAddressCard = ({ address }: { address: Address | null }) => {
  if (!address) {
    return (
      <div className="flex flex-col gap-2 bg-white rounded-xl p-4 border border-gray-100 shadow-sm animate-fade-in">
        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
          <MapPin size={18} className="text-app-green" /> Selected Address
        </h3>
        <p className="text-sm text-gray-450 py-3">No address selected yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm animate-fade-in">
      <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
        <MapPin size={18} className="text-app-green" /> Selected Address
      </h3>
      <div className="flex flex-col">
        <span className="font-semibold text-gray-800 text-base">
          {address.label}
        </span>
        <p className="text-sm text-gray-600 mt-1">{address.address}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {address.city}, {address.state}, {address.zip}
        </p>
      </div>
    </div>
  );
};

const DeliveryAdress = ({
  currentAddress,
  setCurrentAddress,
  onNext,
}: {
  currentAddress: Address | null;
  setCurrentAddress: (address: Address) => void;
  onNext: () => void;
}) => {
  const navigate = useNavigate();
  const userStore = useUserStore();
  const addresses = userStore.addresses;
  const setDefaultAddress = userStore.set_default_address;

  return (
    <div className="flex flex-col gap-5 p-5 w-full bg-white rounded-xl shadow-sm border border-gray-100 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Delivery Address</h2>
          <p className="text-sm text-gray-500 mt-1">
            Select an existing address or add a new one.
          </p>
        </div>
        <button
          onClick={() => navigate("/addresses")}
          className="bg-app-green hover:bg-app-green-light text-white p-2.5 rounded-xl flex items-center gap-1.5 text-sm font-semibold shadow-md shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Address</span>
        </button>
      </div>

      <div className="flex flex-col gap-3 max-h-112.5 overflow-y-auto pr-1">
        {addresses.map((address) => (
          <AddressCard
            key={address._id}
            address={address}
            isSelected={currentAddress?._id === address._id}
            onSelect={() => setCurrentAddress(address)}
            onSetDefault={() => setDefaultAddress(address._id)}
          />
        ))}
        {addresses.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-200 rounded-xl text-center">
            <MapPinIcon size={36} className="text-gray-300 mb-2" />
            <p className="text-sm font-medium text-gray-600">
              No saved addresses found.
            </p>
            <button
              onClick={() => navigate("/addresses")}
              className="mt-3 text-xs text-app-green hover:underline font-semibold"
            >
              Add your first address
            </button>
          </div>
        )}
      </div>

      {addresses.length > 0 && currentAddress && (
        <button
          onClick={onNext}
          className="mt-4 bg-app-green hover:bg-app-green-light text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 w-full sm:w-fit sm:self-end"
        >
          <span>Proceed to Payment</span>
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
};

const PaymentMethodSelection = ({
  selectedPayment,
  setSelectedPayment,
  onBack,
  onNext,
}: {
  selectedPayment: string | null;
  setSelectedPayment: (payment: string) => void;
  onBack: () => void;
  onNext: () => void;
}) => {
  const paymentMethods = [
    {
      id: "cod",
      name: "Cash on Delivery",
      description: "Pay with cash on delivery of your order",
      icon: <Banknote size={24} />,
    },
    {
      id: "card",
      name: "Credit / Debit Card",
      description: "Pay securely using Visa, Mastercard, or RuPay",
      icon: <CreditCard size={24} />,
    },
    {
      id: "upi",
      name: "UPI / Wallet",
      description: "Pay with Google Pay, PhonePe, Paytm, or Wallet",
      icon: <Wallet size={24} />,
    },
    {
      id: "netbanking",
      name: "Net Banking",
      description: "Direct bank transfer from major banks",
      icon: <Landmark size={24} />,
    },
  ];

  return (
    <div className="flex flex-col gap-5 p-5 w-full bg-white rounded-xl shadow-sm border border-gray-100 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Select Payment Method
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose how you would like to pay for your groceries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {paymentMethods.map((method) => {
          const isSelected = selectedPayment === method.id;
          return (
            <div
              key={method.id}
              onClick={() => setSelectedPayment(method.id)}
              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? "border-app-green bg-app-green/3 ring-1 ring-app-green/10"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
              }`}
            >
              <div
                className={`p-2.5 rounded-lg shrink-0 ${
                  isSelected
                    ? "bg-app-green text-white"
                    : "bg-app-cream text-app-green"
                }`}
              >
                {method.icon}
              </div>
              <div className="flex flex-col justify-start">
                <span className="font-semibold text-gray-800 text-sm md:text-base">
                  {method.name}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {method.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-row justify-between items-center mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={onBack}
          className="text-sm text-gray-650 hover:text-app-green border border-gray-200 hover:border-app-green/30 px-5 py-2.5 rounded-xl font-medium"
        >
          Back to Address
        </button>
        <button
          disabled={!selectedPayment}
          onClick={onNext}
          className={`text-sm font-semibold py-2.5 px-6 rounded-xl transition-all shadow-md flex items-center gap-1 ${
            selectedPayment
              ? "bg-app-green hover:bg-app-green-light text-white cursor-pointer"
              : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
          }`}
        >
          <span>Review Order</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const ReviewOrder = ({
  currentAddress,
  selectedPayment,
  onBack,
  onPlaceOrder,
}: {
  currentAddress: Address | null;
  selectedPayment: string | null;
  onBack: () => void;
  onPlaceOrder: () => void;
}) => {
  const cart: CartState = useCartStore();
  const { items } = cart;

  const paymentLabelMap: Record<string, string> = {
    cod: "Cash on Delivery",
    card: "Credit / Debit Card",
    upi: "UPI / Wallet",
    netbanking: "Net Banking",
  };

  return (
    <div className="flex flex-col gap-6 p-5 w-full bg-white rounded-xl shadow-sm border border-gray-100 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Review & Confirm Order
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Please review all details before placing your order.
        </p>
      </div>

      {/* Cart Items review */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gray-705 uppercase tracking-wider flex items-center gap-2">
          <ShoppingBag size={16} className="text-app-green" /> Items (
          {items.length})
        </h3>
        <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-gray-50/10 max-h-75 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.product._id}
              className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors"
            >
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-12 h-12 object-contain bg-white rounded-lg border border-gray-100 p-1 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-800 truncate">
                  {item.product.name}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.product.unit} × {item.quantity}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-800">
                  $ {(item.product.price * item.quantity).toFixed(2)}
                </p>
                <p className="text-xs text-gray-405 mt-0.5">
                  $ {item.product.price.toFixed(2)} each
                </p>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="p-8 text-center text-gray-550">
              Your cart is empty.
            </div>
          )}
        </div>
      </div>

      {/* Address & Payment summary side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Shipping Address summary */}
        <div className="border border-gray-100 p-4 rounded-xl flex flex-col gap-2 bg-gray-50/30">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin size={14} className="text-app-green" /> Shipping Address
          </h4>
          {currentAddress ? (
            <div className="text-sm">
              <p className="font-semibold text-gray-800">
                {currentAddress.label}
              </p>
              <p className="text-gray-600 mt-1 wrap-break-word">
                {currentAddress.address}
              </p>
              <p className="text-gray-500 text-xs">
                {currentAddress.city}, {currentAddress.state},{" "}
                {currentAddress.zip}
              </p>
            </div>
          ) : (
            <p className="text-sm text-red-500 font-medium">
              No address selected
            </p>
          )}
        </div>

        {/* Payment Method summary */}
        <div className="border border-gray-100 p-4 rounded-xl flex flex-col gap-2 bg-gray-50/30">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard size={14} className="text-app-green" /> Payment Method
          </h4>
          {selectedPayment ? (
            <div className="text-sm">
              <p className="font-semibold text-gray-800">
                {paymentLabelMap[selectedPayment] || selectedPayment}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Payment will be settled securely online or at your door.
              </p>
            </div>
          ) : (
            <p className="text-sm text-red-500 font-medium">
              No payment method selected
            </p>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex flex-row justify-between items-center mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-app-green border border-gray-200 hover:border-app-green/30 px-5 py-2.5 rounded-xl font-medium"
        >
          Back to Payment
        </button>
        <button
          disabled={!currentAddress || !selectedPayment || items.length === 0}
          onClick={onPlaceOrder}
          className={`text-sm font-semibold py-2.5 px-6 rounded-xl transition-all shadow-md flex items-center gap-1.5 border border-transparent ${
            currentAddress && selectedPayment && items.length > 0
              ? "bg-app-orange hover:bg-app-orange-dark text-white cursor-pointer"
              : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
          }`}
        >
          <span>Place Order</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const OrderSummary = () => {
  const cart: CartState = useCartStore();
  const { total_items, total_price } = cart;

  return (
    <div className="flex flex-col gap-4 w-full p-5 bg-white rounded-xl border border-gray-100 shadow-sm animate-fade-in animate-delay-100">
      <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">
        Order Summary
      </h3>
      <div className="flex flex-row justify-between items-center">
        <p className="text-sm text-gray-500">
          Subtotal {`(${total_items} items)`}
        </p>
        <p className="text-sm font-semibold text-gray-800">
          $ {total_price.toFixed(2)}
        </p>
      </div>
      <div className="flex flex-row justify-between items-center">
        <p className="text-sm text-gray-500">Delivery</p>
        <p className="text-sm font-semibold">
          {total_price > 50 ? (
            <span className="text-green-600">Free</span>
          ) : (
            <span className="text-gray-800">$2.00</span>
          )}
        </p>
      </div>
      <div className="flex flex-row justify-between items-center">
        <p className="text-sm text-gray-500">Tax (18%)</p>
        <p className="text-sm font-semibold text-gray-800">
          $ {(total_price * 0.18).toFixed(2)}
        </p>
      </div>
      <div className="flex flex-row justify-between items-center border-t border-gray-100 pt-4 mt-2">
        <p className="text-lg font-bold text-gray-800">Total</p>
        <p className="text-lg font-bold text-app-green">
          ${" "}
          {(
            total_price +
            (total_price > 50 ? 0 : 2) +
            total_price * 0.18
          ).toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default Checkout;

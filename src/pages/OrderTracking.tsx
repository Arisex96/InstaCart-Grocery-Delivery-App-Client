import {
  ArrowLeft,
  CheckCheck,
  Clock4,
  KeyRound,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Order } from "../types";
import { dummyDashboardOrdersData } from "../assets/assets";
import { useParams } from "react-router";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import home from "../assets/home.png";
import motorbike from "../assets/motorbike.png";
import L from "leaflet";

import { useNavigate } from "react-router-dom";   


const OrderTracking = () => {
  // - /order/:id
  const [order, setOrder] = useState<Order | null>(null);
  const { id } = useParams();
  const orderId = id || "69d366617ed7e54198d67dac";

  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = () => {
      const response = dummyDashboardOrdersData.find(
        (it) => it._id === orderId,
      );
      setOrder(response || null);
    };
    fetchOrder();
  }, [orderId]);

  const date_formatter = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const status_tab = (status: string) => {
    const bg_color =
      status === "Placed"
        ? "bg-green-400/20"
        : status === "Out for Delivery"
          ? "bg-blue-400/20"
          : "bg-green-400/20";

    return (
      <button
        className={`${bg_color} px-4 h-8 text-sm rounded-full flex items-center justify-center font-medium`}
      >
        {status}
      </button>
    );
  };

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-500 font-medium animate-pulse">
          Loading order details...
        </p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-4 flex flex-col gap-6 mb-10 min-h-screen">
      {/** Back to orders button */}
      <section className="flex items-center gap-2">
        <button
          className="flex items-center gap-2"
          onClick={() => {
            navigate("/my-orders");
          }}
        >
          <ArrowLeft className="text-gray-500" size={20} />
          <span className="text-md text-gray-500">Back to Orders</span>
        </button>
      </section>

      {/**Order heading (order id, date and status) */}
      <section className="flex flex-row justify-between items-center w-auto">
        <div className="flex flex-col gap-1 items-start">
          <p className="text-2xl font-semibold">Order ID: {order._id}</p>
          <p className="text-sm text-gray-600">
            Date: {date_formatter(order.createdAt)}
          </p>
        </div>
        {status_tab(order.status)}
      </section>

      {/** TWO parts  {delivery ot, map , delivery progress etc} and { delivery address, items box}*/}
      <section className="flex flex-row gap-4">
        {/** left part is can scroll*/}
        <div className="flex flex-col gap-6 w-2/3">
          <DeliveryOtpBox order={order} />
          <DeliveryMap order={order} />
          <DeliveryProgress order={order} />
          <DeliveryAgent order={order} />
        </div>
        {/** right part - it stays fixed*/}
        <div className="flex flex-col gap-4 sticky top-24 w-1/3">
          <DeliveryAddressBox order={order} />
          <ItemsBox order={order} />
        </div>
      </section>
    </main>
  );
};

const DeliveryAgent = ({ order }: { order: Order }) => (
  <section className="rounded-lg bg-white p-6 shadow-sm flex flex-row gap-4 justify-between items-center">
    <div className="flex flex-row gap-4 items-center">
      {/* <img
        src=""
        alt=""
        className="w-12 h-12 rounded-full"
        /> */}
      <div className="w-12 h-12 rounded-full bg-app-green flex items-center justify-center">
        <Truck className="text-white" size={24} />
      </div>

      <div>
        <p className="text-lg font-semibold">{order.deliveryPartner.name}</p>
        <p className="text-sm text-gray-600">{order.deliveryPartner.phone}</p>
      </div>
    </div>

    <div className="flex flex-row gap-6">
      <button className="flex items-center gap-2">
        <Phone
          className="text-gray-500 bg-app-cream rounded-lg h-[50px] w-[50px] flex items-center justify-center p-3 hover:shadow-md"
          size={20}
        />
      </button>
    </div>
  </section>
);

/**
 * 
 * ### Delivery Timeline Backend Rule

* `statusHistory` should be the **single source of truth** for the timeline.
* Whenever `order.status` changes, **append that status to `statusHistory`** with its timestamp and optional note.
* The **last entry** in `statusHistory` should always equal `order.status`.
* Never update `order.status` without updating `statusHistory`; otherwise the frontend can show inconsistent progress.
* The frontend should use:

  * **Timeline state (green/orange/gray):** from `order.status` (or the last `statusHistory` entry if `status` is removed).
  * **Timestamp & note:** from the matching `statusHistory` entry.
* If a step has no history entry, it hasn't happened yet, so it should remain gray and show no details.

 */

const DeliveryProgress = ({ order }: { order: Order }) => {
  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const StepList = [
    "Placed",
    "Assigned",
    "Packed",
    "Out for Delivery",
    "Delivered",
  ];

  const IconMap = {
    Placed: Clock4,
    Assigned: Truck,
    Packed: PackageCheck,
    "Out for Delivery": Truck,
    Delivered: CheckCheck,
  };

  const currentStep = StepList.indexOf(order.status);

  const historyMap = new Map(
    order.statusHistory.map((item) => [item.status, item]),
  );

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-app-text">
        Delivery Progress
      </h2>

      <div className="flex flex-col">
        {StepList.map((step, index) => {
          const Icon = IconMap[step];
          const history = historyMap.get(step);

          const completed = index < currentStep;
          const current = index === currentStep;

          return (
            <div key={step} className="flex gap-4">
              {/* Left */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all
                    ${
                      completed
                        ? "bg-app-green text-white"
                        : current
                          ? "border-2 border-app-orange bg-white text-app-orange ring-4 ring-orange-100"
                          : "border border-gray-300 bg-gray-100 text-gray-400"
                    }`}
                >
                  <Icon size={18} />
                </div>

                {index !== StepList.length - 1 && (
                  <div
                    className={`h-16 w-[2px]
                      ${index < currentStep ? "bg-app-green" : "bg-gray-200"}`}
                  />
                )}
              </div>

              {/* Right */}
              <div className="flex-1 pb-8">
                <p
                  className={`font-semibold
                    ${
                      completed
                        ? "text-app-text"
                        : current
                          ? "text-app-orange"
                          : "text-gray-400"
                    }`}
                >
                  {step}
                </p>

                {(completed || current) && history?.note && (
                  <p className="mt-1 text-sm text-gray-500">{history.note}</p>
                )}

                {(completed || current) && history?.timestamp && (
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDateTime(history.timestamp)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const DeliveryOtpBox = ({ order }: { order: Order }) => {
  // string to array of strings (e.g. "123456" -> ["1", "2", "3", "4", "5", "6"])
  const otp_formatter = order.deliveryOtp ? order.deliveryOtp.split("") : [];

  return (
    <section className="flex flex-col gap-4 bg-linear-to-br from-app-green via-app-green-light to-app-green-lighter rounded-lg p-4 shadow-md">
      {/** key icon and some text */}
      <div className="flex flex-row justify-start items-center gap-2">
        <div className="p-3 rounded-full bg-white/10 flex items-center justify-center">
          <KeyRound className="text-white" size={25} />
        </div>
        <div>
          <p className="text-lg text-white">Delivery OTP</p>
          <p className="text-sm text-gray-400">
            Share this OTP with delivery partner
          </p>
        </div>
      </div>

      {/** OTP */}
      <div className="flex flex-row justify-start items-center gap-2">
        {otp_formatter.map((it, index) => {
          return (
            <div
              key={index}
              className="flex items-center justify-center rounded-lg bg-white/10 w-10 h-12"
            >
              <p className="text-2xl font-semibold text-white">{it}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const DeliveryAddressBox = ({ order }: { order: Order }) => (
  <section className="flex flex-col bg-white rounded-lg p-2 shadow-sm">
    {/** delivery address */}
    <div className="flex justify-start items-center gap-2 p-2">
      <MapPin className="text-app-green" size={25} />
      <p className="text-lg text-app-green">Delivery Address</p>
    </div>
    <div className="flex flex-col gap-2 p-2">
      <p className="text-md text-gray-400">{order.shippingAddress.label}</p>
      <p className="text-md text-gray-400">{order.shippingAddress.address}</p>

      <p className="text-md text-gray-400">
        {order.shippingAddress.city}
        {", "}
        {order.shippingAddress.state} {order.shippingAddress.zip}
      </p>
    </div>
  </section>
);

const ItemsBox = ({ order }: { order: Order }) => {
  return (
    <section className="flex flex-col gap-1 p-4 bg-white rounded-lg shadow-sm">
      <p className="text-md font-semibold">
        Items{" "}
        <span className="text-sm text-gray-400">({order.items.length})</span>
      </p>

      {/* Items List */}
      {order.items.map((it, index) => {
        return (
          <div
            key={index}
            className="flex flex-row items-center justify-between"
          >
            <div className="flex flex-row gap-2 items-center">
              <img
                src={it.image}
                alt={it.name}
                className="w-14 h-14 rounded-lg"
              />

              <div className="flex flex-col">
                <p className="text-md">{it.name}</p>
                <p className="text-sm text-gray-400">x{it.quantity}</p>
              </div>
            </div>

            <p className="text-md font-semibold">${it.price}</p>
          </div>
        );
      })}

      <div className="h-px w-full bg-gray-200 my-2" />

      {/* Price Details */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between items-center">
          <p className="text-sm text-gray-400">Subtotal</p>
          <p className="text-sm text-gray-400">${order.subtotal}</p>
        </div>

        <div className="flex flex-row justify-between items-center">
          <p className="text-sm text-gray-400">Delivery Fee</p>
          <p className="text-sm text-gray-400">${order.deliveryFee}</p>
        </div>

        <div className="flex flex-row justify-between items-center">
          <p className="text-sm text-gray-400">Tax</p>
          <p className="text-sm text-gray-400">${order.tax}</p>
        </div>

        <div className="h-px w-full bg-gray-200 my-2" />

        <div className="flex flex-row justify-between items-center">
          <p className="text-md font-semibold">Total</p>
          <p className="text-md font-semibold">${order.total}</p>
        </div>
      </div>
    </section>
  );
};

const DeliveryMap = ({ order }: { order: Order }) => {
  const customer: [number, number] = [
    order.shippingAddress.lat,
    order.shippingAddress.lng,
  ];

  const rider: [number, number] = [
    order.liveLocation.lat,
    order.liveLocation.lng,
  ];

  const riderIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:50px;
      height:50px;
      background:#16a34a;
      border:3px solid white;
      border-radius:50%;
      display:flex;
      justify-content:center;
      align-items:center;
      box-shadow:0 4px 12px rgba(0,0,0,.3);
    ">
      <img src="${motorbike}" style="width:28px;height:28px;" />
    </div>
  `,
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

 const homeIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:50px;
      height:50px;
      background:#2563eb;
      border:3px solid white;
      border-radius:50%;
      display:flex;
      justify-content:center;
      align-items:center;
      box-shadow:0 4px 12px rgba(0,0,0,.3);
    ">
      <img src="${home}" style="width:28px;height:28px;" />
    </div>
  `,
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow z-0">
      <MapContainer
        center={customer}
        zoom={14}
        scrollWheelZoom={true}
        className="h-[350px] w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Customer */}
        <Marker position={customer} icon={homeIcon}>
          <Popup>
            <div>
              <p className="font-semibold">Customer</p>
              <p>{order.shippingAddress.address}</p>
            </div>
          </Popup>
        </Marker>

        {/* Delivery Partner */}
        <Marker position={rider} icon={riderIcon}>
          <Popup>
            <div>
              <p className="font-semibold">Delivery Partner</p>
              <p>
                Updated:{" "}
                {new Date(order.liveLocation.updatedAt).toLocaleTimeString()}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Line between them */}
        <Polyline positions={[rider, customer]} />
      </MapContainer>
    </section>
  );
};

export default OrderTracking;

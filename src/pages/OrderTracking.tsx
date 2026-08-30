import {
  ArrowLeft,
  CheckCheck,
  Clock4,
  KeyRound,
  MapPin,
  PackageCheck,
  Phone,
  Truck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Order } from "../types";
import { useParams } from "react-router";
import api from "../api/axios";
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
    let cancelled = false;
    api
      .get(`/orders/${orderId}`)
      .then((res) => {
        if (!cancelled && res.data) {
          const o = res.data;
          const mapped: Order = {
            _id: o.id,
            user: o.userId ? { _id: o.userId, name: "", email: "" } : undefined,
            items: (o.items || []).map((it: any) => ({
              product: it.product,
              name: it.name,
              image:
                it.image ||
                "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200",
              price: it.price,
              quantity: it.quantity,
              unit: it.unit || "pcs",
            })),
            shippingAddress: o.shippingAddress,
            paymentMethod: o.paymentmethod,
            subtotal: o.subtotal,
            deliveryFee: o.deliveryFee,
            tax: o.tax,
            total: o.total,
            status: o.status,
            statusHistory: o.statusHistory || [],
            deliveryPartner: o.deliveryPartner
              ? {
                  _id: o.deliveryPartner.id,
                  name: o.deliveryPartner.name,
                  phone: o.deliveryPartner.phone,
                  avatar: o.deliveryPartner.avatar,
                  vehicleType: o.deliveryPartner.vehicleType,
                }
              : null,
            deliveryOtp: o.deliveryOtp || "",
            isPaid: o.isPaid || false,
            createdAt: o.createdAt,
            liveLocation: o.liveLocation || undefined,
          };
          setOrder(mapped);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch order", err);
      });
    return () => {
      cancelled = true;
    };
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

const DeliveryAgent = ({ order }: { order: Order }) => {
  // Every order is unassigned until a rider is allocated — the auto-assign job
  // only runs five minutes after checkout — so this was a guaranteed
  // `TypeError` on the tracking page for exactly the window in which a
  // customer is most likely to open it.
  if (!order.deliveryPartner) {
    return (
      <section className="rounded-lg bg-white p-6 shadow-sm flex flex-row gap-4 items-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Truck className="text-gray-400" size={24} />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-700">
            Finding a delivery partner
          </p>
          <p className="text-sm text-gray-500">
            We'll assign one shortly and show their details here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm flex flex-row gap-4 justify-between items-center">
      <div className="flex flex-row gap-4 items-center">
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
            className="text-gray-500 bg-app-cream rounded-lg h-12.5 w-12.5 flex items-center justify-center p-3 hover:shadow-md"
            size={20}
          />
        </button>
      </div>
    </section>
  );
};

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

  const IconMap: Record<string, LucideIcon> = {
    Placed: Clock4,
    Assigned: Truck,
    Packed: PackageCheck,
    "Out for Delivery": Truck,
    Delivered: CheckCheck,
  };

  const isCancelled = order.status === "Cancelled";

  // `indexOf` returns -1 for any status not in StepList — which includes both
  // "Confirmed" and "Cancelled". That made every step render inactive, so a
  // cancelled order showed a completely blank timeline instead of a
  // cancellation. Fall back to the furthest step actually reached in the
  // history, so the timeline still reflects how far the order got.
  const stepFromStatus = StepList.indexOf(order.status);
  const furthestReached = order.statusHistory.reduce((furthest, entry) => {
    const index = StepList.indexOf(entry.status);
    return index > furthest ? index : furthest;
  }, -1);
  const currentStep = stepFromStatus >= 0 ? stepFromStatus : furthestReached;

  const historyMap = new Map(
    order.statusHistory.map((item) => [item.status, item]),
  );

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-app-text">
        Delivery Progress
      </h2>

      {isCancelled && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <XCircle className="shrink-0 text-red-600" size={20} />
          <div>
            <p className="text-sm font-semibold text-red-700">
              This order was cancelled
            </p>
            {historyMap.get("Cancelled")?.note && (
              <p className="text-xs text-red-600">
                {historyMap.get("Cancelled")?.note}
              </p>
            )}
          </div>
        </div>
      )}

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
                    className={`h-16 w-0.5
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
  const showOtp =
    order.deliveryOtp &&
    ["Assigned", "Packed", "Out for Delivery"].includes(order.status);

  if (!showOtp) return null;

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

/**
 * Decode an encoded polyline string (precision 5 for OSRM, 6 for Google/ORS).
 * Returns array of [lat, lng] tuples.
 */
function decodePolyline(
  encoded: string,
  precision: number = 5,
): [number, number][] {
  const factor = Math.pow(10, precision);
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coordinates.push([lat / factor, lng / factor]);
  }

  return coordinates;
}

/** Haversine distance in meters between two [lat, lng] points */
function haversineDistance(a: [number, number], b: [number, number]): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * RouteLine – fetches a real road route from OSRM and renders it.
 * Falls back to a straight dashed line if the API call fails.
 * Only re-fetches when the rider moves more than ~150 m.
 */
function RouteLine({
  from,
  to,
}: {
  from: [number, number];
  to: [number, number];
}) {
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([
    from,
    to,
  ]);
  const [lastFetchedFrom, setLastFetchedFrom] = useState<
    [number, number] | null
  >(null);

  useEffect(() => {
    // Skip if rider hasn't moved significantly
    if (lastFetchedFrom && haversineDistance(lastFetchedFrom, from) < 150) {
      return;
    }

    const controller = new AbortController();

    const fetchRoute = async () => {
      try {
        // OSRM expects lng,lat order
        const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=polyline`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
        const data = await res.json();
        if (data.code === "Ok" && data.routes?.[0]?.geometry) {
          const decoded = decodePolyline(data.routes[0].geometry, 5);
          if (decoded.length >= 2) {
            setRouteCoords(decoded);
            setLastFetchedFrom(from);
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.warn("Route fetch failed, using straight line:", err.message);
          setRouteCoords([from, to]);
        }
      }
    };

    fetchRoute();
    return () => controller.abort();
  }, [from[0], from[1], to[0], to[1]]);

  return (
    <Polyline
      positions={routeCoords}
      pathOptions={{
        color: "#16a34a",
        weight: 5,
        opacity: 0.8,
        dashArray: undefined,
      }}
    />
  );
}

const DeliveryMap = ({ order }: { order: Order }) => {
  const customerLat = parseFloat(order.shippingAddress.lat as any);
  const customerLng = parseFloat(order.shippingAddress.lng as any);
  const customer: [number, number] = [
    isNaN(customerLat) || customerLat === 0 ? 12.9716 : customerLat,
    isNaN(customerLng) || customerLng === 0 ? 77.5946 : customerLng,
  ];

  const hasRiderLocation = !!(
    order.liveLocation &&
    typeof order.liveLocation?.lat === "number" &&
    !isNaN(order.liveLocation.lat) &&
    order.liveLocation.lat !== 0 &&
    typeof order.liveLocation?.lng === "number" &&
    !isNaN(order.liveLocation.lng) &&
    order.liveLocation.lng !== 0
  );

  const rider: [number, number] =
    hasRiderLocation && order.liveLocation
      ? [order.liveLocation.lat, order.liveLocation.lng]
      : customer;

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
        zoom={hasRiderLocation ? 14 : 15}
        scrollWheelZoom={true}
        className="h-87.5 w-full"
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
        {hasRiderLocation && order.liveLocation && (
          <Marker position={rider} icon={riderIcon}>
            <Popup>
              <div>
                <p className="font-semibold">Delivery Partner</p>
                <p>
                  Updated:{" "}
                  {order.liveLocation.updatedAt
                    ? new Date(
                        order.liveLocation.updatedAt,
                      ).toLocaleTimeString()
                    : "Just now"}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Road-based route between rider and customer */}
        {hasRiderLocation && <RouteLine from={rider} to={customer} />}
      </MapContainer>
    </section>
  );
};

export default OrderTracking;

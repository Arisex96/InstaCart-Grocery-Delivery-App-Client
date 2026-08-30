import { useEffect, useState, useRef } from "react";
import { PackageIcon, NavigationIcon } from "lucide-react";
import OtpModal from "../../components/Delivery/OtpModal";
import CancelModal from "../../components/Delivery/CancelModal";
import DeliveryOrderCard from "../../components/Delivery/DeliveryOrderCard";
import Loading from "../../components/Loading";
import type { Order } from "../../types";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [tracking, setTracking] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<
    | "Idle"
    | "Searching"
    | "Active"
    | "Permission Denied"
    | "Unavailable"
    | "Timeout"
    | "Error"
  >("Idle");

  const [updatingStatusIds, setUpdatingStatusIds] = useState<string[]>([]);
  // OTP modal
  const [otpModal, setOtpModal] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Cancel modal
  const [cancelModal, setCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const [lastUpdatedTimes, setLastUpdatedTimes] = useState<
    Record<string, number>
  >(() => {
    try {
      const stored = localStorage.getItem("delivery_last_updated_times");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Persist lastUpdatedTimes
  useEffect(() => {
    try {
      localStorage.setItem(
        "delivery_last_updated_times",
        JSON.stringify(lastUpdatedTimes),
      );
    } catch (err) {
      console.error("Failed to save last updated times to localStorage", err);
    }
  }, [lastUpdatedTimes]);

  const activeOrdersRef = useRef<Order[]>([]);
  activeOrdersRef.current = activeOrders;

  const lastUpdatedTimesRef = useRef<Record<string, number>>({});
  lastUpdatedTimesRef.current = lastUpdatedTimes;

  const trackingRef = useRef<boolean>(false);
  trackingRef.current = tracking;

  const mapOrder = (o: any) => ({
    _id: o.id,
    user: o.user
      ? {
          _id: o.userId,
          name: o.user.name,
          email: o.user.email,
          phone: o.user.phone,
        }
      : undefined,
    items: (o.items || []).map((it: any) => ({
      product: it.product,
      name: it.name,
      image: it.image || "",
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
    deliveryPartner: null,
    deliveryOtp: o.deliveryOtp || "",
    isPaid: o.isPaid || false,
    createdAt: o.createdAt,
    liveLocation: o.liveLocation || undefined,
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/delivery/my-deliveries", {
        params: { status: tab },
      });
      const mapped = (data.orders || []).map(mapOrder);
      setOrders(mapped);

      if (tab === "active") {
        setActiveOrders(mapped);
      } else {
        // Fetch active orders in background to keep tracking context up-to-date
        api
          .get("/delivery/my-deliveries", { params: { status: "active" } })
          .then(({ data: activeData }) => {
            const activeMapped = (activeData.orders || []).map(mapOrder);
            setActiveOrders(activeMapped);
          })
          .catch((err) =>
            console.log("Failed to fetch active orders in background", err),
          );
      }
    } catch (err) {
      console.error("Failed to fetch deliveries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [tab]);

  const getAndSendLocation = () => {
    if (!trackingRef.current || activeOrdersRef.current.length === 0) {
      setGpsStatus("Idle");
      return;
    }

    if (!navigator.geolocation) {
      setGpsStatus("Unavailable");
      return;
    }

    setGpsStatus("Searching");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setGpsStatus("Active");

        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;

        for (const order of activeOrdersRef.current) {
          const lastUpdate = lastUpdatedTimesRef.current[order._id] || 0;
          if (now - lastUpdate >= thirtyMinutes) {
            try {
              await api.put(`/delivery/my-deliveries/${order._id}/location`, {
                lat: latitude,
                lng: longitude,
              });
              console.log(
                `Updated location for order ${order._id}: ${latitude}, ${longitude}`,
              );
              setLastUpdatedTimes((prev) => ({
                ...prev,
                [order._id]: now,
              }));
            } catch (err) {
              console.error(
                `Failed to update location for order ${order._id}`,
                err,
              );
            }
          }
        }
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsStatus("Permission Denied");
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsStatus("Unavailable");
            break;
          case error.TIMEOUT:
            setGpsStatus("Timeout");
            break;
          default:
            setGpsStatus("Error");
            break;
        }
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  // Auto-start tracking if there are active orders, and stop if there are none
  useEffect(() => {
    if (activeOrders.length > 0) {
      setTracking(true);
    } else {
      setTracking(false);
    }
  }, [activeOrders.length]);

  // Set up periodic tracking
  useEffect(() => {
    if (!tracking || activeOrders.length === 0) {
      setGpsStatus("Idle");
      return;
    }

    // Run once immediately
    getAndSendLocation();

    // Check location every 30 seconds
    const intervalId = setInterval(getAndSendLocation, 30000);

    return () => clearInterval(intervalId);
  }, [tracking, activeOrders.length]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    if (updatingStatusIds.includes(orderId)) return;
    setUpdatingStatusIds((prev) => [...prev, orderId]);
    try {
      await api.put(`/delivery/my-deliveries/${orderId}/status`, { status });
      toast.success(`Status updated to ${status}`);

      // Clear last update timestamp for this order to trigger immediate location update
      setLastUpdatedTimes((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });

      await fetchOrders();
      // Trigger an immediate check
      setTimeout(getAndSendLocation, 500);
    } catch (err: any) {
      console.error("Failed to update status", err);
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatusIds((prev) => prev.filter((id) => id !== orderId));
    }
  };

  const handleComplete = async () => {
    if (!otpModal || !otp) return;
    setSubmitting(true);
    try {
      await api.put(`/delivery/my-deliveries/${otpModal}/complete`, { otp });
      toast.success("Delivery completed!");

      // Clear tracking cache for this order
      setLastUpdatedTimes((prev) => {
        const next = { ...prev };
        delete next[otpModal];
        return next;
      });

      setOtpModal(null);
      setOtp("");
      await fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelModal) return;
    setSubmitting(true);
    try {
      await api.put(`/delivery/my-deliveries/${cancelModal}/cancel`, {
        reason: cancelReason,
      });
      toast.success("Delivery cancelled");

      // Clear tracking cache for this order
      setLastUpdatedTimes((prev) => {
        const next = { ...prev };
        delete next[cancelModal];
        return next;
      });

      setCancelModal(null);
      setCancelReason("");
      await fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel");
    } finally {
      setSubmitting(false);
    }
  };

  const getGpsStatusBadge = () => {
    switch (gpsStatus) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-green-50 text-green-700 border border-green-200">
            <span className="size-2 rounded-full bg-green-500 animate-ping" />
            GPS: Active
          </span>
        );
      case "Searching":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
            GPS: Acquiring...
          </span>
        );
      case "Permission Denied":
        return (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200"
            title="Please enable location services in your browser settings."
          >
            <span className="size-2 rounded-full bg-red-500" />
            GPS: Permission Denied
          </span>
        );
      case "Unavailable":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="size-2 rounded-full bg-amber-500" />
            GPS: Unavailable
          </span>
        );
      case "Timeout":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="size-2 rounded-full bg-amber-500" />
            GPS: Timeout
          </span>
        );
      case "Error":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">
            <span className="size-2 rounded-full bg-red-500" />
            GPS: Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-zinc-50 text-zinc-600 border border-zinc-200">
            <span className="size-2 rounded-full bg-zinc-400" />
            GPS: Off
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs + Tracking toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["active", "completed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${tab === t ? "bg-app-green text-white" : "bg-white text-zinc-600 hover:bg-app-cream border border-app-border"}`}
          >
            {t === "active" ? "Active" : "Completed"}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3">
          {getGpsStatusBadge()}
          <button
            onClick={() => setTracking((prev) => !prev)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5 ${tracking ? "bg-green-600 text-white" : "bg-white text-zinc-600 border border-app-border hover:bg-app-cream"}`}
          >
            <NavigationIcon
              className={`w-3.5 h-3.5 ${tracking ? "animate-pulse" : ""}`}
            />
            {tracking ? "Sharing Location" : "Share Location"}
          </button>
        </div>
      </div>

      {/* Orders */}
      {loading ? (
        <Loading />
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-app-border">
          <PackageIcon className="size-12 text-app-border mx-auto mb-3" />
          <p className="text-lg font-semibold text-zinc-900 mb-1">
            No {tab} deliveries
          </p>
          <p className="text-sm text-zinc-500">
            {tab === "active"
              ? "You'll see new assignments here"
              : "Completed deliveries will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <DeliveryOrderCard
              key={order._id}
              order={order}
              tab={tab}
              handleUpdateStatus={handleUpdateStatus}
              setOtpModal={setOtpModal}
              setCancelModal={setCancelModal}
              updating={updatingStatusIds.includes(order._id)}
            />
          ))}
        </div>
      )}

      {/* OTP Modal */}
      {otpModal && (
        <OtpModal
          setOtpModal={setOtpModal}
          otp={otp}
          setOtp={setOtp}
          handleComplete={handleComplete}
          submitting={submitting}
        />
      )}
      {/* Cancel Modal */}
      {cancelModal && (
        <CancelModal
          setCancelModal={setCancelModal}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          handleCancel={handleCancel}
          submitting={submitting}
        />
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [tracking, setTracking] = useState(false);

  const [updatingStatusIds, setUpdatingStatusIds] = useState<string[]>([]);
  // OTP modal
  const [otpModal, setOtpModal] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Cancel modal
  const [cancelModal, setCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/delivery/my-deliveries", {
        params: { status: tab },
      });
      const mapped = (data.orders || []).map((o: any) => ({
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
      }));
      setOrders(mapped);
    } catch (err) {
      console.error("Failed to fetch deliveries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [tab]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    if (updatingStatusIds.includes(orderId)) return;
    setUpdatingStatusIds((prev) => [...prev, orderId]);
    try {
      await api.put(`/delivery/my-deliveries/${orderId}/status`, { status });
      toast.success(`Status updated to ${status}`);
      await fetchOrders();
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
      setOtpModal(null);
      setOtp("");
      fetchOrders();
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
      setCancelModal(null);
      setCancelReason("");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel");
    } finally {
      setSubmitting(false);
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
        <div className="ml-auto">
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

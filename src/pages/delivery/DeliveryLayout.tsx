import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { DeliveryPartner } from "../../types";
import Navbar from "../../components/Navbar";

export default function DeliveryLayout() {
  const navigate = useNavigate();
  const [partner, setPartner] = useState<DeliveryPartner | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("delivery_token");
    const partnerStr = localStorage.getItem("delivery_partner");
    if (!token || !partnerStr) {
      navigate("/delivery/login", { replace: true });
    } else {
      try {
        const parsed = JSON.parse(partnerStr);
        setPartner({
          _id: parsed.id || parsed._id,
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone,
          avatar: parsed.avatar,
          vehicleType: parsed.vehicleType,
          isActive: parsed.isActive,
        });
      } catch (e) {
        navigate("/delivery/login", { replace: true });
      }
    }
  }, [navigate]);

  if (!partner) return null;

  return (
    <div className="min-h-screen bg-app-cream">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

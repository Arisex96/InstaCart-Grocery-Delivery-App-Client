import type { Order } from "../types";
import { useState, useEffect } from "react";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const MyOrders = (): any => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get("/orders")
      .then((res) => {
        if (!cancelled) {
          const mapped = res.data.map((order: any) => ({
            _id: order.id,
            user: order.userId,
            items: (order.items || []).map((it: any) => ({
              product: it.product,
              name: it.name,
              image:
                it.image ||
                "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200",
              price: it.price,
              quantity: it.quantity,
              unit: it.unit || "pcs",
            })),
            shippingAddress: order.shippingAddress,
            paymentMethod: order.paymentmethod,
            subtotal: order.subtotal,
            deliveryFee: order.deliveryFee,
            tax: order.tax,
            total: order.total,
            status: order.status,
            statusHistory: order.statusHistory || [],
            deliveryPartner: order.deliveryPartner,
            deliveryOtp: order.deliveryOtp,
            isPaid: order.isPaid,
            createdAt: order.createdAt,
          }));
          setOrders(mapped);
        }
      })
      .catch((err) => {
        console.error("Failed to load orders", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const [selectedTab, setSelectedTab] = useState<string>("All Orders");
  const tabs = ["All Orders", "Placed", "Out for Delivery", "Delivered"];

  return (
    <main className="max-w-7xl mx-auto h-full p-4 gap-4 flex flex-col">
      <h1 className="text-4xl">My Orders</h1>
      {/** tabs */}
      <section className="flex flex-row gap-4 items-center justify-start">
        {tabs.map((it, index) => {
          return (
            <button
              key={index}
              className={`px-4 py-2 rounded-lg ${selectedTab === it ? "bg-app-green-light text-white" : "bg-white text-gray-500 font-semibold"}`}
              onClick={() => {
                setSelectedTab(it);
              }}
            >
              {it}
            </button>
          );
        })}
      </section>

      <section className="flex flex-col gap-6 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-app-green animate-delay-100"></div>
          </div>
        ) : (
          (() => {
            const filteredOrders = orders.filter((it) => {
              if (selectedTab === "All Orders") return true;
              return it.status === selectedTab;
            });

            if (filteredOrders.length === 0) {
              return (
                <p className="text-center text-gray-500 text-2xl bg-white p-4 rounded-lg max-w-5xl">
                  No orders found
                </p>
              );
            } else {
              return filteredOrders.map((order, index) => {
                return <OrderCard key={index} order={order} />;
              });
            }
          })()
        )}
      </section>
    </main>
  );
};

const OrderCard = ({ order }: { order: Order }) => {
  //type will be a enum of ["Placed","Out for Delivery","Delivered"]

  const [showOrderTableId, setShowOrderTableId] = useState<string | null>(null);
  const navigator = useNavigate();

  const status_tab = (status: string) => {
    const bg_color =
      status === "Placed"
        ? "bg-green-400/20"
        : status === "Out for Delivery"
          ? "bg-blue-400/20"
          : "bg-green-400/20";
    const text_color =
      status === "Placed"
        ? "text-green-700"
        : status === "Out for Delivery"
          ? "text-blue-700"
          : "text-green-700";

    return (
      <button
        className={`${bg_color} px-4 h-8 text-sm rounded-full flex items-center justify-center`}
        onClick={() => {
          navigator(`/order-tracking/${order._id}`);
        }}
      >
        {status}{" "}
        <span className="ml-2">
          <ArrowRight className={`${text_color}`} size={24} />
        </span>
      </button>
    );
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="bg-white rounded-lg flex flex-col gap-4 p-4 max-w-5xl">
      <section>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between items-center">
            <p className="text-lg">Order ID: {order._id}</p>

            {/**Clicking opens table */}
            <div className="flex items-center gap-2">
              {status_tab(order.status)}
            </div>
          </div>

          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>
      </section>
      {/** images small icons in 1 row */}
      <section className="flex flex-row gap-2">
        {order.items.map((item, index) => {
          return (
            <div
              key={index}
              className="h-17.5 w-17.5 flex justify-center items-center bg-white rounded-lg relative"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-contain border border-gray-200 rounded-lg"
              />
              {/** bottom right quantity icon */}
              <div className="absolute bottom-0 right-0 h-6 w-6 text-center text-xs rounded-full bg-app-green-light ring-3 ring-white text-white flex justify-center items-center  ">
                {item.quantity}
              </div>
            </div>
          );
        })}
      </section>

      <section className="flex flex-row justify-between items-center">
        <p className="text-md text-gray-400 flex items-center gap-2">
          Total Items: {order.items.length}
          <span
            onClick={() => {
              if (showOrderTableId === order._id) {
                setShowOrderTableId(null);
              } else {
                setShowOrderTableId(order._id);
              }
            }}
          >
            {showOrderTableId === order._id ? (
              <ArrowUp
                size={30}
                className="text-app-green-light border border-gray-200 rounded-full p-1 hover:bg-app-green-light hover:text-white transition-colors cursor-pointer"
              />
            ) : (
              <ArrowDown
                size={30}
                className="text-app-green-light border border-gray-200 rounded-full p-1 hover:bg-app-green-light hover:text-white transition-colors cursor-pointer"
              />
            )}
          </span>
        </p>
        <p className="text-lg font-semibold">Total Price: {order.total}</p>
      </section>

      {/** Tables View */}
      <section
        className={`${
          showOrderTableId === order._id ? "block" : "hidden"
        } mt-4 overflow-x-auto`}
      >
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Product
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                Quantity
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                Price
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                Total Price
              </th>
            </tr>
          </thead>

          <tbody>
            {order.items.map((item, index) => (
              <tr
                key={index}
                className="border-t border-gray-250 even:bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <td className="px-4 py-3 flex items-center gap-3 text-left">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-contain rounded border border-gray-100 bg-white p-1"
                  />
                  <p className="text-lg font-semibold text-gray-800">
                    {item.name}
                  </p>
                </td>
                <td className="px-4 py-3 text-center text-gray-600 font-medium">
                  {item.quantity}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900 border-none">
                  ₹{item.price}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900 border-none">
                  ₹{item.price * item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default MyOrders;

/**
 * 
 * 
 * export interface Order {
   _id: string;
   user: string | { _id: string; name: string; email: string; phone?: string };
   items: OrderItem[];
   shippingAddress: Omit<Address, "_id" | "isDefault">;
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
 */

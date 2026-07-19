import type { Order } from "../types";
import { useState, useEffect } from "react";

import { dummyDashboardOrdersData } from "../assets/assets";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";

const MyOrders = (): any => {
  const [orders, setOrders] = useState<Order[]>([]);

  const temp_user = {
    _id: "69bb6caf448f2d818db59122",
    name: "Admin",
    email: "admin@example.com",
  };

  useEffect(() => {
    const fetchOrders = dummyDashboardOrdersData.filter(
      (it) => it.user._id === temp_user._id,
    );
    setOrders(fetchOrders);
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
        {(() => {
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
        })()}
      </section>
    </main>
  );
};

const OrderCard = ({ order }: { order: Order }) => {
  //type will be a enum of ["Placed","Out for Delivery","Delivered"]

  const [showOrderTableId, setShowOrderTableId] = useState<string | null>(null);

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
            <div
              className="flex items-center gap-2"
            >
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
              className="h-[70px] w-[70px] flex justify-center items-center bg-white rounded-lg relative"
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
          }}>{showOrderTableId === order._id ? <ArrowUp size={30} className="text-app-green-light border border-gray-200 rounded-full p-1 hover:bg-app-green-light hover:text-white transition-colors cursor-pointer" /> : <ArrowDown size={30} className="text-app-green-light border border-gray-200 rounded-full p-1 hover:bg-app-green-light hover:text-white transition-colors cursor-pointer" />}</span>
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

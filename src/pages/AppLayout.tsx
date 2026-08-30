import { Outlet } from "react-router";
import Banner from "../components/Banner";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CartSideBar from "../components/CartSideBar";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import useUserStore from "../store/useUserStore";
import ChatWidget from "../components/chat/ChatWidget";

const AppLayout = () => {
  const loadAddresses = useUserStore((state) => state.loadAddresses);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      loadAddresses().catch((err) =>
        console.error("Error loading addresses", err),
      );
    }
  }, [loadAddresses]);

  return (
    <>
      <Banner />
      <Navbar />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />

      <CartSideBar />
      <Toaster position="top-center" reverseOrder={false} />
      <ChatWidget />
    </>
  );
};

export default AppLayout;

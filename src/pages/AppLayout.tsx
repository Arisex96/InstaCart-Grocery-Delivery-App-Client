import { Outlet } from "react-router";
import Banner from "../components/Banner";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CartSideBar from "../components/CartSideBar";
import { Toaster } from "react-hot-toast";

const AppLayout = () => {
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
    </>
  );
};

export default AppLayout;

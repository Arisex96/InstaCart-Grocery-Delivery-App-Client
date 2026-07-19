import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AppLayout from "./pages/AppLayout";
import Products from "./pages/Products";
import ProductPage from "./pages/ProductPage";
import SearchResults from "./pages/SearchResults";
import Home from "./pages/Home";
import FlashDeals from "./pages/FlashDeals";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import OrderTracking from "./pages/OrderTracking";
import Addresses from "./pages/Addresses";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <>
      <Routes>
        {/** auth pages - no header/footer */}
        <Route path="/login" element={<Login />} />
        {/** main pages */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="product/:id" element={<ProductPage />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="deals" element={<FlashDeals />} />
          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="my-orders" element={<MyOrders />} />
            <Route path="order/:id" element={<OrderTracking />} />
            <Route path="addresses" element={<Addresses />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default App;

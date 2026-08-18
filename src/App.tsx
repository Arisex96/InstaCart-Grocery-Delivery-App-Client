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
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminDeliveryPartners from "./pages/admin/AdminDeliveryPartners";
import DeliveryLogin from "./pages/delivery/DeliveryLogin";
import DeliveryLayout from "./pages/delivery/DeliveryLayout";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";

const App = () => (
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
          <Route path="order-tracking/:id" element={<OrderTracking />} />
          <Route path="addresses" element={<Addresses />} />
        </Route>
      </Route>
      {/**Admin pages */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        {/* Plural, matching both `products/new` above and the edit links in
            AdminProducts (`/admin/products/:id/edit`). The singular form here
            meant the edit button always landed on a blank page. */}
        <Route path="products/:id/edit" element={<AdminProductForm />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="delivery-partners" element={<AdminDeliveryPartners />} />
      </Route>

      {/**Delivery partner pages */}
      <Route path="delivery/login" element={<DeliveryLogin />} />
      <Route path="delivery" element={<DeliveryLayout />}>
        <Route index element={<DeliveryDashboard />} />
      </Route>
    </Routes>
  </>
);

export default App;

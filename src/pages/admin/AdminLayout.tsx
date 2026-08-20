import { NavLink, Outlet, Navigate } from "react-router-dom";
import {
  PlusIcon,
  PackageSearchIcon,
  ShoppingBagIcon,
  LogOutIcon,
  BarChart3Icon,
  ShieldIcon,
  Truck,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import useUserStore from "../../store/useUserStore";

export default function AdminLayout() {
  const { isAdmin } = useUserStore();
  const token = localStorage.getItem("token");

  if (!token || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const AdminLinkData = [
    { to: "/admin", label: "Dashboard", icon: BarChart3Icon },
    { to: "/admin/products/new", label: "Add Product", icon: PlusIcon },
    { to: "/admin/products", label: "Products", icon: PackageSearchIcon },
    { to: "/admin/orders", label: "Orders", icon: ShoppingBagIcon },
    { to: "/admin/delivery-partners", label: "Delivery Partners", icon: Truck },
    { to: "/", label: "Exit", icon: LogOutIcon },
  ];

  return (
    <div className="flex flex-col min-h-screen lg:h-screen lg:overflow-hidden bg-app-cream">
      <Navbar />
      <div className="flex flex-col flex-1 lg:flex-row lg:min-h-0 gap-8 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Admin Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 h-fit bg-white rounded-2xl p-4 border border-app-border">
          <div className="hidden lg:block pb-4 mb-4 border-b border-app-border">
            <h2 className="text-lg font-semibold text-app-green flex items-center gap-2 px-2">
              <ShieldIcon className="size-5 text-green-900" /> Admin Panel
            </h2>
          </div>
          <nav className="flex flex-row overflow-x-auto lg:flex-col gap-2 lg:gap-1.5 no-scrollbar pb-2 lg:pb-0">
            {AdminLinkData.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={true}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2.5 rounded-md text-sm transition-colors shrink-0 ${
                    isActive
                      ? "bg-app-green text-white"
                      : "text-app-text-light hover:bg-orange-50 hover:text-zinc-900"
                  }`
                }
              >
                <link.icon className="size-4" /> {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1 lg:overflow-y-auto lg:no-scrollbar pb-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

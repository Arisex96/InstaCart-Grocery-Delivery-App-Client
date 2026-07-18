import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  BikeIcon,
  ShoppingCart,
  ChevronDown,
  Search,
  Menu,
  X,
  User,
  Package,
  MapPin,
  Store,
  Tag,
  ShieldCheck,
  LogOut,
} from "lucide-react";

import useCartStore from "../store/useCartStore";
import { useNavigate, useSearchParams } from "react-router";
import useDebounce from "../hooks/useDebounce";

const Navbar = () => {
  const [user, setUser] = useState({
    username: "Aditya",
    email: "123@gmail.com",
    isAdmin: true,
  });

  const cartCount = useCartStore((state) => state.total_items);
  const toggleCart = useCartStore((state) => state.toggle_cart_view);
  const [animateCart, setAnimateCart] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (cartCount === 0) return;
    setAnimateCart(true);
    const timer = setTimeout(() => setAnimateCart(false), 350);
    return () => clearTimeout(timer);
  }, [cartCount]);

  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const [searchText, setSearchText] = useState(urlSearch);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const debouncedSearchText = useDebounce(searchText, 500);

  useEffect(() => {
    setSearchText(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentSearch = params.get("search") || "";
    if (debouncedSearchText !== currentSearch) {
      if (debouncedSearchText) {
        params.set("search", debouncedSearchText);
      } else {
        params.delete("search");
      }
      navigate(`/products?${params.toString()}`);
    }
  }, [debouncedSearchText]);

  const isLoggedIn = !!user.email;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-app-border bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Left Side: Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl text-app-green hover:opacity-90 transition-opacity"
        >
          <div className="rounded-xl bg-app-cream px-2.5 py-1.5 text-app-green-lighter shadow-inner">
            <BikeIcon className="size-6" />
          </div>
          <span className="font-serif tracking-wide text-2xl font-black">
            Instacart
          </span>
        </Link>

        {/* Middle Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-sm font-semibold text-zinc-650 hover:text-app-green transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-app-green after:transition-all"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="text-sm font-semibold text-zinc-655 hover:text-app-green transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-app-green after:transition-all"
          >
            Products
          </Link>
          <Link
            to="/deals"
            className="text-sm font-semibold text-zinc-655 hover:text-app-green transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-app-green after:transition-all"
          >
            Deals
          </Link>
        </nav>

        {/* Search Bar (Desktop / Tablet) */}
        <div className="hidden sm:flex relative max-w-xs md:max-w-sm w-full mx-4 items-center">
          <div className="absolute left-3 text-zinc-400">
            <Search className="size-4" />
          </div>
          <input
            type="text"
            placeholder="Search for groceries..."
            className="w-full border border-zinc-200 rounded-full pl-9 pr-4 py-2 text-sm bg-zinc-50 focus:bg-white focus:border-app-green-lighter focus:ring-2 focus:ring-app-green-lighter/10 transition-all duration-200"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate(`/products?search=${searchText}`);
              }
            }}
          />
        </div>

        {/* Right Side Actions: Cart & Profile & Menu */}
        <div className="flex items-center gap-4">
          {/* Cart Icon Button */}
          <button
            type="button"
            onClick={toggleCart}
            className={`relative p-2 text-zinc-650 hover:text-app-green-light hover:bg-zinc-50 rounded-full transition-all focus:outline-none ${
              animateCart ? "animate-cart-pop" : ""
            }`}
          >
            <ShoppingCart className="size-6 text-zinc-700 hover:text-app-green transition-colors" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-app-orange text-[9px] font-bold text-white ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative font-sans">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 hover:bg-zinc-50 rounded-full md:rounded-lg border border-transparent sm:hover:border-zinc-200 transition-all focus:outline-none"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-app-green-lighter text-sm font-bold text-white uppercase shadow-sm">
                {isLoggedIn ? user.username[0] : <User className="size-4" />}
              </div>
              <span className="hidden md:block text-sm font-semibold text-zinc-700">
                {isLoggedIn ? user.username : "Sign In"}
              </span>
              <ChevronDown
                className={`hidden md:block size-4 text-zinc-500 transition-transform duration-200 ${
                  userMenuOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <>
                {/* Overlay to detect click outside */}
                <div
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setUserMenuOpen(false)}
                />

                <div className="absolute right-0 top-full mt-3 w-64 rounded-2xl border border-zinc-150 bg-white shadow-xl flex flex-col overflow-hidden animate-fade-in py-1.5 z-20">
                  {isLoggedIn ? (
                    <>
                      {/* User Profile Header */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50/80 border-b border-zinc-100">
                        <div className="flex size-10 items-center justify-center rounded-full bg-app-green text-base font-bold text-white shadow-sm uppercase">
                          {user.username ? (
                            user.username[0]
                          ) : (
                            <User className="size-5" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-zinc-800 text-sm flex items-center gap-1.5 truncate">
                            {user.username}
                            {user.isAdmin && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                                Admin
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] text-zinc-500 truncate">
                            {user.email}
                          </span>
                        </div>
                      </div>

                      {/* Menu Options */}
                      <div className="p-1 flex flex-col gap-0.5">
                        <Link
                          to="/"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                        >
                          <Package className="size-4 text-zinc-400" />
                          <span className="font-medium">My Orders</span>
                        </Link>
                        <Link
                          to="/"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                        >
                          <MapPin className="size-4 text-zinc-400" />
                          <span className="font-medium">Saved Addresses</span>
                        </Link>
                        <Link
                          to="/"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                        >
                          <Store className="size-4 text-zinc-400" />
                          <span className="font-medium">Manage Products</span>
                        </Link>
                        <Link
                          to="/"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                        >
                          <Tag className="size-4 text-zinc-400" />
                          <span className="font-medium">Exclusive Deals</span>
                        </Link>
                        {user.isAdmin && (
                          <Link
                            to="/"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-650 hover:bg-emerald-50/50 hover:text-app-green transition-colors border-t border-zinc-100/50 mt-1 pt-1.5"
                          >
                            <ShieldCheck className="size-4 text-emerald-600 animate-pulse-soft" />
                            <span className="font-semibold text-emerald-800">
                              Admin Dashboard
                            </span>
                          </Link>
                        )}
                      </div>

                      {/* Sign Out Section */}
                      <div className="border-t border-zinc-105 p-1">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            setUser({
                              username: "",
                              email: "",
                              isAdmin: false,
                            });
                          }}
                          className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-650 hover:bg-red-50 text-red-650 transition-colors"
                        >
                          <LogOut className="size-4" />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Guest menu options */}
                      <div className="p-1 flex flex-col gap-0.5">
                        <Link
                          to="/"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-app-green transition-colors mt-0.5"
                        >
                          <LogOut className="size-4 text-zinc-450 rotate-185" />
                          <span>Sign In</span>
                        </Link>
                        <Link
                          to="/"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-app-green transition-colors"
                        >
                          <Store className="size-4 text-zinc-400" />
                          <span>Products</span>
                        </Link>
                        <Link
                          to="/"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-app-green transition-colors"
                        >
                          <Tag className="size-4 text-zinc-400" />
                          <span>Deals</span>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Option Icon */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-650 hover:text-app-green hover:bg-zinc-50 rounded-full transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="size-6 animate-fade-in" />
            ) : (
              <Menu className="size-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer/Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white py-4 px-4 flex flex-col gap-4 animate-fade-in shadow-inner">
          {/* Mobile Search input (screens smaller than small) */}
          <div className="relative w-full flex items-center sm:hidden">
            <div className="absolute left-3 text-zinc-400">
              <Search className="size-4" />
            </div>
            <input
              type="text"
              placeholder="Search groceries..."
              className="w-full border border-zinc-200 rounded-full pl-9 pr-4 py-2 text-sm bg-zinc-50 focus:bg-white focus:border-app-green transition-all"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1 font-medium">
            {isLoggedIn ? (
              <>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-zinc-705 hover:bg-zinc-50 hover:text-app-green transition-colors text-sm font-semibold"
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-zinc-705 hover:bg-zinc-50 hover:text-app-green transition-colors text-sm font-semibold"
                >
                  Products
                </Link>
                <Link
                  to="/deals"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-zinc-705 hover:bg-zinc-50 hover:text-app-green transition-colors text-sm font-semibold"
                >
                  Deals
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-zinc-705 hover:bg-zinc-50 hover:text-app-green transition-colors text-sm font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-zinc-705 hover:bg-zinc-50 hover:text-app-green transition-colors text-sm font-semibold"
                >
                  Products
                </Link>
                <Link
                  to="/deals"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-zinc-705 hover:bg-zinc-50 hover:text-app-green transition-colors text-sm font-semibold"
                >
                  Deals
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

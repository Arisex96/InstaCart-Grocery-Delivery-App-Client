import { useNavigate } from "react-router";
import { ArrowRightIcon, LeafIcon, MailIcon } from "lucide-react";
import {
  assets,
  categoriesData,
  heroSectionData,
  appPromoBannerData,
} from "../assets/assets";

import delivery_truck from "../assets/delivery_truck.svg";

const back_ground_image = assets.hero_bg;

import ProductGrid from "../components/ProductGrid";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-12 font-sans">
        {/* Hero Section */}
        <section
          className="w-full h-[400px] sm:h-[480px] md:h-[520px] rounded-3xl relative overflow-hidden bg-cover bg-center shadow-lg border border-app-cream-dark"
          style={{
            backgroundImage: `url(${back_ground_image})`,
          }}
        >
          <div className="absolute inset-0 bg-black/45 z-10 bg-gradient-to-r from-black/55 to-transparent"></div>
          <div className="absolute inset-0 z-20 flex flex-col justify-center items-start gap-5 px-6 sm:px-12 md:px-16 lg:px-20 max-w-2xl">
            <div className="flex items-center gap-2 bg-emerald-950/65 backdrop-blur-md border border-emerald-800/30 rounded-full px-3.5 py-1.5 max-w-fit shadow-sm">
              <LeafIcon className="size-4 text-emerald-400" />
              <p className="text-emerald-300 text-xs font-semibold tracking-wide uppercase">
                Farm-Fresh & Organic
              </p>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl text-white font-serif leading-tight">
              Nourish your home with <br />
              <span className="text-app-orange">Earth's finest</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-md">
              {heroSectionData.description}
            </p>

            <div className="flex flex-wrap gap-4 mt-2">
              <button
                onClick={() => navigate("/products")}
                className="bg-app-orange hover:bg-app-orange-dark text-white px-6 py-3 rounded-full flex items-center gap-2 font-semibold transition-all hover:scale-[1.03] shadow-md"
              >
                Shop Now <ArrowRightIcon className="size-5" />
              </button>
              <button
                onClick={() => navigate("/products")}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full border border-white/20 backdrop-blur-sm flex items-center gap-2 font-semibold transition-all hover:scale-[1.03]"
              >
                Browse Categories <ArrowRightIcon className="size-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Hero Features Grid */}
        <div className="w-full py-6 bg-white rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6 shadow-sm border border-app-border mt-2">
          {heroSectionData.hero_features.map((item, index) => (
            <div
              key={index}
              className="flex flex-row gap-4 items-center justify-start py-2 px-4 hover:bg-app-cream rounded-xl transition-all duration-300"
            >
              <div className="bg-app-cream-dark text-app-green p-3 rounded-xl shrink-0">
                <item.icon className="size-6 text-app-green-lighter" />
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-app-green text-sm sm:text-base">
                  {item.title}
                </p>
                <p className="text-xs text-zinc-550">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Categories Section */}
        <div className="w-full">
          <div className="flex flex-col gap-1 mb-6">
            <h2 className="text-2xl sm:text-3xl font-serif text-app-green font-bold">
              Browse by Category
            </h2>
            <p className="text-sm text-zinc-550">
              Find exactly what you need from our fresh selection
            </p>
          </div>

          <div className="overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-6 w-max pb-2">
              {categoriesData.map((category) => (
                <div
                  key={category.slug}
                  className="flex flex-col gap-2.5 items-center justify-center shrink-0 w-24 hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() =>
                    navigate(`/products?category=${category.slug}`)
                  }
                >
                  <div className="bg-white rounded-2xl w-[100px] h-[100px] flex items-center justify-center border border-app-border shadow-sm hover:border-app-green hover:shadow-md transition-all duration-300">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-16 w-16 object-contain"
                    />
                  </div>
                  <p className="text-xs font-semibold text-app-green-light text-center h-8 flex items-center justify-center leading-tight">
                    {category.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="w-full">
          <div className="flex flex-row justify-between items-end mb-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl sm:text-3xl font-serif text-app-green font-bold">
                Featured Products
              </h2>
              <p className="text-sm text-zinc-550">
                Top-rated products this season
              </p>
            </div>

            <button
              onClick={() => navigate("/products")}
              className="flex flex-row gap-1 items-center text-app-orange hover:text-app-orange-dark font-semibold text-sm transition-colors hover:underline"
            >
              View all products
              <ArrowRightIcon className="size-4" />
            </button>
          </div>

          {/* Products grid */}
          <ProductGrid limit={8} />
        </div>

        {/* App download section */}
        <div className="w-full rounded-3xl bg-app-green px-6 py-14 shadow-xl relative overflow-hidden">
          {/* Decorative background blur gradients */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl z-0"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl z-0"></div>

          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center relative z-10">
            <h2 className="text-3xl font-serif text-white sm:text-4xl lg:text-5xl">
              {appPromoBannerData.title}
            </h2>

            <p className="max-w-lg text-base leading-7 text-gray-300">
              {appPromoBannerData.description}
            </p>

            <div className="mt-2 flex flex-col gap-4 sm:flex-row justify-center">
              <button className="rounded-xl bg-white px-6 py-3 font-semibold text-app-green hover:bg-app-cream hover:scale-105 transition-all shadow-md">
                App Store
              </button>

              <button className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white hover:bg-white/20 hover:scale-105 transition-all">
                Play Store
              </button>
            </div>

            <img
              src={delivery_truck}
              alt="Delivery Truck"
              className="mt-8 h-40 object-contain animate-pulse-soft"
            />
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-white w-full mx-auto flex flex-col gap-4 justify-center items-center p-10 border border-app-border rounded-2xl shadow-sm">
          <div className="bg-app-cream text-app-green-lighter rounded-xl shadow-inner p-4">
            <MailIcon className="size-10 text-app-green" />
          </div>
          <h2 className="text-app-green text-3xl font-serif text-center font-bold">
            Subscribe to our Newsletter
          </h2>
          <p className="text-md text-zinc-550 text-center max-w-md">
            Get weekly updates on fresh produce, seasonal offers, and exclusive
            discounts right to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mt-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="border border-app-border rounded-xl px-4 py-2.5 w-full bg-zinc-50 focus:bg-white focus:border-app-green transition-all"
            />
            <button className="bg-app-green hover:bg-app-green-light text-white font-semibold px-6 py-2.5 rounded-xl transition-all whitespace-nowrap shadow-md">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
